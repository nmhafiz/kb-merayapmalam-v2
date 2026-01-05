import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, Trash2, BarChart2, CheckCircle, XCircle } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { format } from 'date-fns';

type Poll = Database['public']['Tables']['kb_polls']['Row'];


export default function PollManager() {
    const [polls, setPolls] = useState<Poll[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    // New Poll State
    const [newQuestion, setNewQuestion] = useState('');
    const [newOptions, setNewOptions] = useState(['Yes', 'No']);

    useEffect(() => {
        fetchPolls();
    }, []);

    async function fetchPolls() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('kb_polls')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPolls(data || []);
        } catch (error) {
            console.error('Error fetching polls:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreatePoll(e: React.FormEvent) {
        e.preventDefault();
        try {
            // 1. Create Poll
            const { data: pollData, error: pollError } = await supabase
                .from('kb_polls')
                .insert({
                    question: newQuestion,
                    is_active: true,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                })
                .select()
                .single();

            if (pollError) throw pollError;
            if (!pollData) throw new Error('Failed to create poll');

            // 2. Create Options
            const optionsToInsert = newOptions
                .filter(opt => opt.trim() !== '')
                .map((opt, index) => ({
                    poll_id: pollData.id,
                    option_text: opt,
                    sort_order: index
                }));

            const { error: optionsError } = await supabase
                .from('kb_poll_options')
                .insert(optionsToInsert);

            if (optionsError) throw optionsError;

            // Reset and Refresh
            setIsCreating(false);
            setNewQuestion('');
            setNewOptions(['Yes', 'No']);
            fetchPolls();

        } catch (error) {
            console.error('Error creating poll:', error);
            alert('Failed to create poll');
        }
    }

    async function toggleActive(poll: Poll) {
        try {
            await supabase
                .from('kb_polls')
                .update({ is_active: !poll.is_active })
                .eq('id', poll.id);
            fetchPolls();
        } catch (error) {
            console.error('Error updating poll:', error);
        }
    }

    async function deletePoll(id: string) {
        if (!confirm('Delete this poll?')) return;
        try {
            await supabase.from('kb_polls').delete().eq('id', id);
            fetchPolls();
        } catch (error) {
            console.error('Error deleting poll:', error);
        }
    }

    const addOptionField = () => setNewOptions([...newOptions, '']);
    const updateOption = (index: number, val: string) => {
        const updated = [...newOptions];
        updated[index] = val;
        setNewOptions(updated);
    };

    return (
        <div className="bg-surface border border-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-primary" />
                    Manage Polls
                </h2>
                <button
                    onClick={() => setIsCreating(!isCreating)}
                    className="bg-primary text-charcoal font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-hover transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    {isCreating ? 'Cancel' : 'New Poll'}
                </button>
            </div>

            {isCreating && (
                <div className="mb-8 p-4 bg-surface-card rounded-lg border border-border">
                    <form onSubmit={handleCreatePoll}>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-text-muted mb-1">Question</label>
                            <input
                                type="text"
                                className="w-full bg-surface border border-border rounded-lg p-2 text-text-primary text-sm focus:border-primary outline-none"
                                value={newQuestion}
                                onChange={e => setNewQuestion(e.target.value)}
                                placeholder="e.g. Run malam ni jadi tak?"
                                required
                            />
                        </div>
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-text-muted mb-1">Options</label>
                            {newOptions.map((opt, idx) => (
                                <input
                                    key={idx}
                                    type="text"
                                    className="w-full bg-surface border border-border rounded-lg p-2 text-text-primary text-sm mb-2 focus:border-primary outline-none"
                                    value={opt}
                                    onChange={e => updateOption(idx, e.target.value)}
                                    placeholder={`Option ${idx + 1}`}
                                    required
                                />
                            ))}
                            <button type="button" onClick={addOptionField} className="text-xs text-primary font-bold hover:underline">
                                + Add Option
                            </button>
                        </div>
                        <button type="submit" className="w-full bg-primary text-charcoal font-bold py-2 rounded-lg text-sm hover:opacity-90">
                            Create Poll
                        </button>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : polls.length === 0 ? (
                <div className="text-center py-8 text-text-muted text-sm">
                    No polls yet. Create one to engage members!
                </div>
            ) : (
                <div className="space-y-4">
                    {polls.map((poll) => (
                        <div key={poll.id} className="p-4 bg-surface-card rounded-lg border border-border flex justify-between items-center group">
                            <div>
                                <h4 className="font-bold text-text-primary text-sm">{poll.question}</h4>
                                <div className="flex items-center gap-3 mt-1 text-xs text-text-muted">
                                    <span>{format(new Date(poll.created_at), 'dd MMM yyyy')}</span>
                                    <span className={poll.is_active ? "text-green-500 font-bold" : "text-text-muted"}>
                                        {poll.is_active ? 'Active' : 'Ended'}
                                    </span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => toggleActive(poll)}
                                    className={`p-2 rounded-lg transition-colors ${poll.is_active ? 'text-green-500 hover:bg-green-500/10' : 'text-text-muted hover:text-text-primary hover:bg-white/5'}`}
                                    title={poll.is_active ? "End Poll" : "Activate Poll"}
                                >
                                    {poll.is_active ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => deletePoll(poll.id)}
                                    className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
