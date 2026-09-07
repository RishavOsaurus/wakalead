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
