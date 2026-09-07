import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, SeasonStandings as SeasonStandingsData } from '../api';

const POS_STYLE = [
  'bg-yellow-400 text-yellow-950', // P1 - gold
  'bg-slate-300 text-slate-800 dark:bg-zinc-500 dark:text-zinc-50', // P2 - silver
  'bg-amber-600 text-amber-50', // P3 - bronze
];

/**
 * Live season title race - F1-style drivers' table. Same scoring as the
 * frozen-season championship (F1 points per own-window day), so whoever
 * sits P1 here takes the crown if the season ended today.
 */
export function SeasonStandings() {
  const navigate = useNavigate();
  const [data, setData] = useState<SeasonStandingsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    api
      .getSeasonStandings()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        console.error('Error loading season standings:', err);
        if (!cancelled) setData(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
          Season Standings
          {data && <span className="ml-2 font-normal text-slate-400 dark:text-zinc-500">Season {data.season}</span>}
        </h2>
        {data && data.standings.length > 0 && (
          <p className="text-xs text-slate-500 dark:text-zinc-400">
            ★ Title leader: {data.standings[0].display_name || data.standings[0].username}
          </p>
        )}
      </div>

      <div className="p-4 sm:p-6">
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-zinc-800 rounded-lg animate-shimmer" />
            ))}
          </div>
        )}

        {!loading && (!data || data.standings.length === 0) && (
          <p className="text-center text-sm text-slate-400 dark:text-zinc-600 py-8">
            No standings yet - hit Sync to get the season started.
          </p>
        )}

        {!loading && data && data.standings.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-zinc-500 border-b border-slate-200 dark:border-zinc-800">
                    <th className="text-left font-semibold py-2 pr-2 w-12">Pos</th>
                    <th className="text-left font-semibold py-2 pr-2">Driver</th>
                    <th className="text-right font-semibold py-2 px-2" title="F1 points (25-18-15-12-10-8-6-4-2-1)">Pts</th>
                    <th className="text-right font-semibold py-2 px-2" title="Daily wins">P1</th>
                    <th className="text-right font-semibold py-2 px-2" title="Daily P2 finishes">P2</th>
                    <th className="text-right font-semibold py-2 px-2" title="Daily P3 finishes">P3</th>
                    <th className="text-right font-semibold py-2 px-2" title="Synced days with zero time">DNF</th>
                    <th className="text-right font-semibold py-2 px-2" title="Points per day in own window">Avg</th>
                  </tr>
                </thead>
                <tbody>
                  {data.standings.map((s) => (
                    <tr
                      key={s.user_id}
                      onClick={() => navigate(`/profile/${s.username}`)}
                      className="border-b border-slate-100 dark:border-zinc-800/60 last:border-0 hover:bg-slate-50 dark:hover:bg-zinc-800/50 cursor-pointer transition-colors"
                    >
                      <td className="py-2 pr-2">
                        <span
                          className={`inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs font-bold ${
                            POS_STYLE[s.pos - 1] ??
                            'bg-slate-100 text-slate-500 dark:bg-zinc-800 dark:text-zinc-400'
                          }`}
                        >
                          {s.pos}
                        </span>
                      </td>
                      <td className="py-2 pr-2">
                        <div className="flex items-center gap-2">
                          {s.photo_url ? (
                            <img
                              src={s.photo_url}
                              alt={s.username}
                              className="w-7 h-7 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                              {(s.display_name || s.username).charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span className="font-medium text-slate-800 dark:text-zinc-100">
                            {s.display_name || s.username}
                          </span>
                        </div>
                      </td>
                      <td className="text-right font-bold text-slate-900 dark:text-white px-2">{s.points}</td>
                      <td className="text-right text-slate-600 dark:text-zinc-300 px-2">{s.wins}</td>
                      <td className="text-right text-slate-600 dark:text-zinc-300 px-2">{s.seconds}</td>
                      <td className="text-right text-slate-600 dark:text-zinc-300 px-2">{s.thirds}</td>
                      <td className="text-right px-2">
                        <span className={s.dnfs > 0 ? 'text-red-500 dark:text-red-400 font-medium' : 'text-slate-300 dark:text-zinc-700'}>
                          {s.dnfs}
                        </span>
                      </td>
                      <td className="text-right text-slate-600 dark:text-zinc-300 px-2">{s.avg.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] text-slate-400 dark:text-zinc-600">
              Pts = F1 points per daily rank · P1/P2/P3 = daily podiums · DNF = synced day with zero
              time · Avg = points per day in your own window. Ordered by wins - most daily wins
              takes the crown.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
