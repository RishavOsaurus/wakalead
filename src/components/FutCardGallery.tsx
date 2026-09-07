import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, CardScope, CardType, UserCardWithProfile } from '../api';
import { PlayerCard, CARD_TYPE_LABEL } from './PlayerCard';

/** Special tiers worth spotlighting, in cascade (rarity) order. */
const SPOTLIGHT_TIERS: Array<{ type: CardType; requirement: string }> = [
  { type: 'white_icon', requirement: 'All stats 90+, reigning champ with 2+ titles (absorbs the Icon slot)' },
  { type: 'icon', requirement: 'Reigning champion - most daily wins last season' },
  { type: 'legend_hero', requirement: '#1 overall right now' },
  { type: 'featured_red', requirement: '10+ hours coded in the last 3 days' },
];

/**
 * Everyone's FUT-style card at once, sorted best overall first - the
 * "squad view" companion to the leaderboard above it.
 */
export function FutCardGallery() {
  const navigate = useNavigate();
  const [scope, setScope] = useState<CardScope>('season');
  const [cards, setCards] = useState<UserCardWithProfile[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    api
      .getAllCards(scope)
      .then((result) => {
        if (!cancelled) setCards(result.cards);
      })
      .catch((err) => {
        console.error('Error loading card gallery:', err);
        if (!cancelled) setCards([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope]);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-200 dark:border-zinc-800 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white">FUT Cards</h2>
        <div className="inline-flex rounded-lg bg-slate-100 dark:bg-zinc-800 p-0.5">
          <button
            onClick={() => setScope('season')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              scope === 'season'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
            }`}
          >
            This season
          </button>
          <button
            onClick={() => setScope('career')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              scope === 'career'
                ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-200'
            }`}
          >
            Career
          </button>
        </div>
      </div>

      <div className="p-6">
        {!loading && cards && cards.length > 0 && (
          <div className="mb-6 rounded-xl bg-slate-50 dark:bg-zinc-800/60 border border-slate-200 dark:border-zinc-800 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-zinc-500 mb-2">
              Who holds what
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {SPOTLIGHT_TIERS.map(({ type, requirement }) => {
                const holders = cards.filter((c) => c.cardType === type);
                return (
                  <div key={type} className="text-xs" title={requirement}>
                    <span className="font-semibold text-slate-700 dark:text-zinc-200">
                      {CARD_TYPE_LABEL[type]}
                    </span>{' '}
                    {holders.length === 0 ? (
                      <span className="text-slate-400 dark:text-zinc-600">up for grabs</span>
                    ) : (
                      holders.map((h, i) => (
                        <span key={h.user_id}>
                          {i > 0 && ', '}
                          <button
                            onClick={() => navigate(`/profile/${h.username}`)}
                            className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                          >
                            {h.display_name || h.username}
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                );
              })}
              <div className="text-xs text-slate-500 dark:text-zinc-400">
                <span className="font-semibold text-slate-700 dark:text-zinc-200">Gold</span>{' '}
                ×{cards.filter((c) => c.cardType === 'base_gold').length}
                {' · '}
                <span className="font-semibold text-slate-700 dark:text-zinc-200">Silver</span>{' '}
                ×{cards.filter((c) => c.cardType === 'base_silver').length}
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex flex-wrap justify-center gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-[220px] h-[308px] bg-slate-100 dark:bg-zinc-800 rounded-2xl animate-shimmer" />
            ))}
          </div>
        )}

        {!loading && cards && cards.length === 0 && (
          <p className="text-center text-sm text-slate-400 dark:text-zinc-600 py-8">
            No cards yet - hit Sync to get everyone's stats in.
          </p>
        )}

        {!loading && cards && cards.length > 0 && (
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-8">
            {cards.map((c) => (
              <button
                key={c.user_id}
                onClick={() => navigate(`/profile/${c.username}`)}
                className="flex flex-col items-center gap-2 transition-transform hover:-translate-y-1"
              >
                <PlayerCard card={c} name={c.display_name || c.username} photoUrl={c.photo_url} width={220} />
                <p className="text-xs font-medium text-slate-600 dark:text-zinc-400">
                  {CARD_TYPE_LABEL[c.cardType]} · {c.position}
                  {c.provisional && <span className="text-amber-600 dark:text-amber-400"> · provisional</span>}
                </p>
                {c.nextTier && (
                  <p className="text-[11px] text-slate-400 dark:text-zinc-600 -mt-1">
                    {c.nextTier.pointsAway} pt{c.nextTier.pointsAway === 1 ? '' : 's'} from {c.nextTier.label}
                  </p>
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
