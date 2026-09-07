# Notes

## Query optimization (2026-09-07)

Problem: `getRankOneStats()` in `worker/database.ts` ran
`SELECT user_id, COUNT(*) ... FROM (SELECT ... ROW_NUMBER() OVER ...)`
over the full `leaderboard_history` week table (users x days = 1000s of rows),
then threw ~99% away in the outer `WHERE rn = 1 AND rank = 1` filter.

Fixes (all in `worker/database.ts`, indexes in `schema.sql`):

1. Week rank-one counts: `ROW_NUMBER()` over full history replaced with a
   Sunday-only count for past weeks + latest-snapshot lookup for the current
   week (<= 7 rows/user). Same semantics: missed-Sunday weeks stay uncounted,
   current week is a live proxy.
2. Streak windows: day history pre-filters `rank = 1 AND value > 0`
   (~users-fold fewer rows); week history fetches Sundays + current week only
   (past non-Sundays were discarded in JS anyway).
3. Card metrics (`getCardMetricsForAllUsers`): breakdown rows pre-aggregated
   in SQL (`GROUP BY user_id, kind, name`) instead of shipping every
   user x day x name row (~days-fold fewer rows transferred).
4. Compare page (`getCompareStats`): removed the duplicate full `daily_stats`
   fetch (tooltip already loads it); daily/weekly buckets are two tiny `SUM`
   range queries, all-time reuses tooltip aggregates.
5. Cron ranking (`computeAndStorePeriod`): 4 reads per period merged into 1
   read fetching all four metric sums, ranked per-metric in JS with the same
   `value DESC, id` ordering. 8 reads -> 2 per sync.
6. `COUNT(*)` existence checks (`wasFetchedToday`, `recentFetch`) changed to
   `SELECT 1 ... LIMIT 1`.
7. New covering indexes (see `migrations/add_perf_indexes.sql`, also in
   `schema.sql` + season-reset table defs):
   - `idx_leaderboard_history_rank_cover`
   - `idx_leaderboard_history_start_cover`
   - `idx_fetch_log_user_date_status`
   - `idx_fetch_log_user_type_status`
   - `idx_breakdown_user_kind_name`

Apply to live D1: `wrangler d1 execute wakalead --remote --file=./migrations/add_perf_indexes.sql`

Verified with `npx tsc --noEmit` (clean).

## Follow-up: the rest of the 4M-rows/day blowup (2026-09-07)

Sep 6 analytics vs Sep 5: queries 1k -> 9k, rows read 137k -> 4M
(5M/day free cap is now *enforced* - queries fail past it). Per-view
math: one dashboard load costs ~30k rows (17.9k `fetch_log` MAX scan +
2x rank-one scans + 9-user tooltip prefetch); cards full-scan ~5k rows
per compute on a 60s cache.

On top of the fixes above:

1. `getLastSyncTime` (`MAX(fetched_at) ... WHERE status='success'`,
   17.9k rows per dashboard view) was missed - new
   `idx_fetch_log_status_fetched (status, fetched_at)`, also in
   `schema.sql` + season-reset table defs.
2. `recentFetch` only used the `(user_id)` prefix - new
   `idx_fetch_log_user_type_fetched (user_id, fetch_type, fetched_at)`.
3. `POST /api/refresh-all` (~920 writes/click, open to all users, no
   cooldown, ignores `wasFetchedToday`) - 30-min server-side cooldown
   in KV (`refresh_all_at`, 429 + `retryAfterSeconds`), notice shown
   next to the Sync button. Hammering 5-7x/day was the writes spike.
4. `fetch_log` pruned to 30 days on the daily cron (`pruneFetchLog` -
   readers only look back hours/days). One-off remote prune needed too.
5. Card KV cache 60s -> 1h, invalidated on refresh-all / fetch-now /
   reset-season / cron (`invalidateCardCache`).
6. Dashboard computed `getRankOneStats` twice identically (today + week
   boards) - now once, passed into both `getLeaderboard` calls.
7. Profile Daily-table paginated (`GET /api/user/:id/daily`,
   30/page + total) - first page rides the profile payload, rest via
   show-more. Also drops the duplicate full-history fetch the table
   used to do on top of the tooltip's.

Deferred (re-measure first): `getWeeklyData` missing `is_banned`
filter, dead `fetchWeekDataForUser`/`fetchTodayDataForAllUsers`,
per-request `verifySession` PK lookup, `wasFetchedToday` fetch_type
cross-talk (loose matching currently *saves* re-fetches - scoping it
would cost more writes, so left alone).
