import { Link } from 'react-router-dom';
import { Header } from '../components/Header';

/**
 * The full rulebook - how FUT cards, tiers, and the season title are
 * decided. Mirrors docs/CRITERIA.md; update both when rules change.
 */
export function Criteria() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0b]">
      <Header />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Link
          to="/"
          className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Back to leaderboard
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
          How cards &amp; titles work
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-zinc-400">
          The full rulebook. Every number below is live in the app right now.
        </p>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            The 6 attributes
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300">
            Each stat is your <strong>percentile rank against everyone else</strong>, rescaled so
            even last place still looks respectable:{' '}
            <code className="text-xs bg-slate-100 dark:bg-zinc-800 rounded px-1.5 py-0.5">
              rating = round(55 + percentile × 44)
            </code>{' '}
            <strong>Overall</strong> is the average of the six, rounded.
          </p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-zinc-300">
            <li><strong className="text-slate-800 dark:text-zinc-100">PAC</strong> — <code className="text-xs bg-slate-100 dark:bg-zinc-800 rounded px-1.5 py-0.5">human_seconds + 0.7 × ai_seconds</code></li>
            <li><strong className="text-slate-800 dark:text-zinc-100">SHO</strong> — <code className="text-xs bg-slate-100 dark:bg-zinc-800 rounded px-1.5 py-0.5">human_lines + 0.7 × ai_lines</code></li>
            <li><strong className="text-slate-800 dark:text-zinc-100">PAS</strong> — projects + languages with 30+ minutes each.</li>
            <li><strong className="text-slate-800 dark:text-zinc-100">DRI</strong> — editors + OSs with 30+ minutes each.</li>
            <li><strong className="text-slate-800 dark:text-zinc-100">DEF</strong> — consistency: active days ÷ tracked days (a day counts at 40+ min).</li>
            <li><strong className="text-slate-800 dark:text-zinc-100">PHY</strong> — 60% longest streak + 40% average time across your top 2 projects, ranked separately then blended.</li>
          </ul>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Card tiers — first match wins
          </h2>
          <ol className="mt-3 space-y-2 text-sm text-slate-600 dark:text-zinc-300 list-decimal list-inside">
            <li><strong className="text-slate-800 dark:text-zinc-100">White Icon</strong> — every stat 90+ <em>and</em> reigning champion <em>and</em> 2+ titles. The crowned legend; absorbs the Icon slot, so no separate Icon exists that season.</li>
            <li><strong className="text-slate-800 dark:text-zinc-100">Icon</strong> — reigning champion (most daily wins last season). Exactly one holder, passes at every reset.</li>
            <li><strong className="text-slate-800 dark:text-zinc-100">Hero</strong> — #1 overall in the cohort right now.</li>
            <li><strong className="text-slate-800 dark:text-zinc-100">On Form</strong> (red) — more than 24 hours coded in the trailing 7 days.</li>
            <li><strong className="text-slate-800 dark:text-zinc-100">Gold</strong> — overall 75+, and none of the above.</li>
            <li><strong className="text-slate-800 dark:text-zinc-100">Silver</strong> — everyone else.</li>
          </ol>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            The season title race
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300">
            Each season crowns one champion from its frozen history: whoever has the{' '}
            <strong>most daily wins</strong> (topped the daily board, with real activity —
            dead days crown nobody). Ties go to the lower user id. The previous season's
            champion is the reigning <strong>Icon</strong>.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Season standings table
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300">
            The dashboard drivers' table shows the race live, ordered by wins:{' '}
            <strong>Pts</strong> (F1 points per daily rank) · <strong>P1/P2/P3</strong> (daily
            podiums) · <strong>DNF</strong> (synced day with zero time) · <strong>Avg</strong> (points
            per day in your own window).
          </p>
        </section>

        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500">
            Provisional &amp; scope
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-zinc-300">
            Cards with fewer than <strong>7 active days</strong> (or in a group smaller than{' '}
            <strong>4 people</strong>) are marked provisional — not enough data for a meaningful
            percentile yet. <strong>This season</strong> resets on every admin reset;{' '}
            <strong>Career</strong> spans everything ever synced.
          </p>
        </section>

        <footer className="text-center py-8 border-t border-slate-200 dark:border-zinc-800 mt-8">
          <p className="text-sm text-slate-400 dark:text-zinc-600">
            Made with ❤️ for coders who grind
          </p>
        </footer>
      </main>
    </div>
  );
}
