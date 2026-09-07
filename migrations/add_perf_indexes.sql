-- Perf indexes for the rank-one / streak / card / fetch-log hot paths.
-- Safe to re-run (IF NOT EXISTS). Apply to the live DB with:
--   wrangler d1 execute wakalead --remote --file=./migrations/add_perf_indexes.sql
-- (schema.sql already contains these for fresh DBs and post-reset tables.)

-- Covering index for rank-filtered counts on leaderboard_history
-- (day consistency totals, Sunday week totals, rank-1 streak windows).
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_rank_cover
    ON leaderboard_history(period, metric, rank, value, user_id, period_start);

-- Covering index for recency-range scans on leaderboard_history
-- (current-week snapshots, 120-day streak windows).
CREATE INDEX IF NOT EXISTS idx_leaderboard_history_start_cover
    ON leaderboard_history(period, metric, period_start, user_id, rank, value);

-- EXISTS checks in wasFetchedToday / recentFetch.
CREATE INDEX IF NOT EXISTS idx_fetch_log_user_date_status
    ON fetch_log(user_id, fetch_date, status);
CREATE INDEX IF NOT EXISTS idx_fetch_log_user_type_status
    ON fetch_log(user_id, fetch_type, status, fetched_at);

-- Card-metrics aggregation: GROUP BY user_id, kind, name with SUM(seconds).
CREATE INDEX IF NOT EXISTS idx_breakdown_user_kind_name
    ON user_stat_breakdown(user_id, kind, name, seconds);
