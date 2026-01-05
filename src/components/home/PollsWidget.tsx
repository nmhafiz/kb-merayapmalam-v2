import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { BarChart3 } from 'lucide-react';
import type { Database } from '../../types/supabase';
import clsx from 'clsx';

type Poll = Database['public']['Tables']['kb_polls']['Row'] & {
    options: Database['public']['Tables']['kb_poll_options']['Row'][];
    userVote?: string; // option_id
    totalVotes: number;
    votesByOption: Record<string, number>;
};

export default function PollsWidget() {
    const { session } = useAuth();
    const user = session?.user;
    const [poll, setPoll] = useState<Poll | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const fetchLatestPoll = useCallback(async () => {
        try {
            // 1. Get active poll
            const { data: pollData, error: pollError } = await supabase
                .from('kb_polls')
                .select('*')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (pollError) {
                if (pollError.code !== 'PGRST116') console.error('Error fetching poll:', pollError); // PGRST116 is "Row not found"
                setPoll(null);
                return;
            }

            // 2. Get options
            const { data: optionsData, error: optionsError } = await supabase
                .from('kb_poll_options')
                .select('*')
                .eq('poll_id', pollData.id)
                .order('sort_order', { ascending: true });

            if (optionsError) throw optionsError;

            // 3. Get votes stats
            const { data: votesData, error: votesError } = await supabase
                .from('kb_poll_votes')
                .select('option_id, user_id')
                .eq('poll_id', pollData.id);

            if (votesError) throw votesError;

            const totalVotes = votesData?.length || 0;
            const votesByOption: Record<string, number> = {};
            let userVote = undefined;

            (optionsData || []).forEach(opt => {
                votesByOption[opt.id] = 0;
            });

            (votesData || []).forEach(vote => {
                if (votesByOption[vote.option_id] !== undefined) {
                    votesByOption[vote.option_id]++;
                }
                if (user && vote.user_id === user.id) {
                    userVote = vote.option_id;
                }
            });

            setPoll({
                ...pollData,
                options: optionsData || [],
                userVote,
                totalVotes,
                votesByOption
            });

        } catch (error) {
            console.error('Error loading poll:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchLatestPoll();
    }, [fetchLatestPoll]);

    async function handleVote(optionId: string) {
        if (!user || !poll) return;

        // Optimistic update
        const prevPoll = { ...poll };
        const isChangingVote = !!poll.userVote;

        setPoll(curr => {
            if (!curr) return null;
            const newVotesByOption = { ...curr.votesByOption };
            let newTotal = curr.totalVotes;

            if (curr.userVote) {
                newVotesByOption[curr.userVote]--; // Remove old vote count
            } else {
                newTotal++;
            }
            newVotesByOption[optionId]++;

            return {
                ...curr,
                userVote: optionId,
                totalVotes: newTotal,
                votesByOption: newVotesByOption
            };
        });

        setSubmitting(true);
        try {
            if (isChangingVote) {
                await supabase
                    .from('kb_poll_votes')
                    .delete()
                    .eq('poll_id', poll.id)
                    .eq('user_id', user.id);
            }

            const { error } = await supabase
                .from('kb_poll_votes')
                .insert({
                    poll_id: poll.id,
                    option_id: optionId,
                    user_id: user.id
                });

            if (error) throw error;

            // Refetch to confirm
            fetchLatestPoll();

        } catch (error) {
            console.error('Error submitting vote:', error);
            alert('Failed to submit vote. Please try again.');
            setPoll(prevPoll); // Revert
        } finally {
            setSubmitting(false);
        }
    }

    if (loading) return null; // Don't show anything if loading or no poll
    if (!poll) return null;

    return (
        <section className="bg-surface-card border border-border p-5 rounded-2xl space-y-4">
            <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-bold text-text-primary">Poll Minggu Ini</h2>
            </div>

            <p className="text-sm text-text-muted font-medium mb-4">{poll.question}</p>

            <div className="space-y-2">
                {poll.options.map(option => {
                    const voteCount = poll.votesByOption[option.id] || 0;
                    const percentage = poll.totalVotes > 0 ? (voteCount / poll.totalVotes) * 100 : 0;
                    const isSelected = poll.userVote === option.id;

                    return (
                        <button
                            key={option.id}
                            onClick={() => !submitting && handleVote(option.id)}
                            disabled={!user || submitting}
                            className={clsx(
                                "w-full relative overflow-hidden rounded-xl border transition-all duration-300 group",
                                isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-border bg-surface hover:border-text-muted"
                            )}
                        >
                            {/* Progress Bar Background */}
                            <div
                                className={clsx(
                                    "absolute top-0 left-0 h-full transition-all duration-1000 ease-out opacity-20",
                                    isSelected ? "bg-primary" : "bg-text-muted"
                                )}
                                style={{ width: `${percentage}%` }}
                            />

                            <div className="relative flex items-center justify-between p-3 z-10">
                                <span className={clsx(
                                    "text-sm font-bold",
                                    isSelected ? "text-primary" : "text-text-primary"
                                )}>
                                    {option.option_text}
                                </span>
                                {(poll.userVote || poll.totalVotes > 0) && (
                                    <span className="text-xs text-text-muted font-mono">
                                        {Math.round(percentage)}%
                                    </span>
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex justify-between items-center text-[10px] text-text-muted px-1 mt-2">
                <span>Total Votes: {poll.totalVotes}</span>
                {!user && <span>Login to vote</span>}
            </div>
        </section>
    );
}
