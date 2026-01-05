import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import clsx from 'clsx';
import type { Database } from '../../types/supabase';

type Poll = Database['public']['Tables']['kb_polls']['Row'];
type PollOption = Database['public']['Tables']['kb_poll_options']['Row'];

interface PollCardProps {
    pollId?: string; // If provided, specific poll. If not, fetch latest active.
    className?: string;
}

export default function PollCard({ pollId, className }: PollCardProps) {
    const { session, loading: authLoading } = useAuth();
    const [poll, setPoll] = useState<Poll | null>(null);
    const [options, setOptions] = useState<PollOption[]>([]);
    const [userVote, setUserVote] = useState<string | null>(null); // option_id
    const [voteCounts, setVoteCounts] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [voting, setVoting] = useState(false);
    const [totalVotes, setTotalVotes] = useState(0);

    // Fetch Poll Data
    useEffect(() => {
        if (authLoading) return;

        async function loadPoll() {
            setLoading(true);
            try {
                let currentPoll = null;

                if (pollId) {
                    const { data } = await supabase.from('kb_polls').select('*').eq('id', pollId).single();
                    currentPoll = data;
                } else {
                    // Fetch latest active poll
                    const { data } = await supabase
                        .from('kb_polls')
                        .select('*')
                        .eq('is_active', true)
                        .order('created_at', { ascending: false })
                        .limit(1)
                        .single();
                    currentPoll = data;
                }

                if (!currentPoll) {
                    setLoading(false);
                    return;
                }

                setPoll(currentPoll);

                // Fetch Options
                const { data: opts } = await supabase
                    .from('kb_poll_options')
                    .select('*')
                    .eq('poll_id', currentPoll.id)
                    .order('sort_order', { ascending: true });

                if (opts) setOptions(opts);

                // Fetch User Vote
                if (session?.user) {
                    const { data: myVote } = await supabase
                        .from('kb_poll_votes')
                        .select('option_id')
                        .eq('poll_id', currentPoll.id)
                        .eq('user_id', session.user.id)
                        .single();
                    if (myVote) setUserVote(myVote.option_id);
                }

                // Fetch Vote Counts
                await fetchVoteCounts(currentPoll.id);

            } catch (error) {
                console.error('Error loading poll:', error);
            } finally {
                setLoading(false);
            }
        }

        loadPoll();
    }, [pollId, authLoading, session?.user]);

    // Realtime Subscription
    useEffect(() => {
        if (!poll) return;

        const channel = supabase
            .channel(`poll_votes_${poll.id}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'kb_poll_votes', filter: `poll_id=eq.${poll.id}` },
                () => {
                    fetchVoteCounts(poll.id);
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [poll]);

    async function fetchVoteCounts(targetPollId: string) {
        // This is a simple aggregation. For production with millions of votes, use a materialized view.
        const { data } = await supabase
            .from('kb_poll_votes')
            .select('option_id')
            .eq('poll_id', targetPollId);

        if (data) {
            const counts: Record<string, number> = {};
            data.forEach(v => {
                counts[v.option_id] = (counts[v.option_id] || 0) + 1;
            });
            setVoteCounts(counts);
            setTotalVotes(data.length);
        }
    }

    async function handleVote(optionId: string) {
        if (!session?.user || !poll) return;
        if (userVote) return; // Already voted (simplify for MVP: no vote changing)

        setVoting(true);
        try {
            const { error } = await supabase.from('kb_poll_votes').insert({
                poll_id: poll.id,
                option_id: optionId,
                user_id: session.user.id
            });

            if (error) throw error;
            setUserVote(optionId);
        } catch (error) {
            console.error('Error voting:', error);
            alert('Failed to vote. Try again.');
        } finally {
            setVoting(false);
        }
    }

    if (loading) return <div className="animate-pulse h-32 bg-surface-card rounded-xl"></div>;
    if (!poll) return null; // No active poll

    return (
        <div className={clsx("bg-surface-card border border-border rounded-xl p-5 shadow-sm", className)}>
            <div className="flex items-start justify-between mb-4">
                <div>
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wide bg-primary/10 px-2 py-1 rounded-full">
                        Live Poll
                    </span>
                    <h3 className="text-lg font-bold text-text-primary mt-2 leading-tight">
                        {poll.question}
                    </h3>
                </div>
                {userVote && (
                    <div className="flex items-center gap-1 text-green-400 text-xs font-medium">
                        <CheckCircle2 className="w-3 h-3" />
                        Voted
                    </div>
                )}
            </div>

            <div className="space-y-3">
                {options.map((opt) => {
                    const count = voteCounts[opt.id] || 0;
                    const percent = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
                    const isSelected = userVote === opt.id;
                    const isWinning = totalVotes > 0 && count === Math.max(...Object.values(voteCounts));

                    return (
                        <button
                            key={opt.id}
                            disabled={!!userVote || voting}
                            onClick={() => handleVote(opt.id)}
                            className={clsx(
                                "relative w-full text-left p-3 rounded-lg border transition-all overflow-hidden group",
                                userVote
                                    ? isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border bg-charcoal/50 opacity-70"
                                    : "border-border hover:border-primary/50 hover:bg-charcoal-light active:scale-[0.99]"
                            )}
                        >
                            {/* Progress Bar Background */}
                            {userVote && (
                                <div
                                    className={clsx(
                                        "absolute top-0 left-0 bottom-0 h-full transition-all duration-500 ease-out opacity-20",
                                        isSelected || isWinning ? "bg-primary" : "bg-gray-600"
                                    )}
                                    style={{ width: `${percent}%` }}
                                />
                            )}

                            <div className="relative flex justify-between items-center z-10">
                                <span className={clsx("font-medium text-sm", isSelected ? "text-primary" : "text-text-primary")}>
                                    {opt.option_text}
                                </span>
                                {userVote && (
                                    <span className="text-xs font-bold text-text-muted">
                                        {percent}%
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="mt-4 flex justify-end">
                <span className="text-xs text-text-muted font-medium">
                    {totalVotes} {totalVotes === 1 ? 'vote' : 'votes'}
                </span>
            </div>

            {!session?.user && (
                <div className="mt-3 text-center p-2 bg-ember/10 rounded-lg border border-ember/20 flex items-center justify-center gap-2">
                    <AlertCircle className="w-4 h-4 text-ember" />
                    <span className="text-xs text-ember font-medium">Login to vote</span>
                </div>
            )}
        </div>
    );
}
