import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Send, Loader2, X } from 'lucide-react';
import RequireProfile from '../auth/RequireProfile';

export default function CreatePostForm() {
    const { session, profile } = useAuth();
    const [content, setContent] = useState('');
    const [isExpanded, setIsExpanded] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!content.trim() || !session) return; // Should be blocked by RequireProfile, but safety first

        setLoading(true);
        try {
            const { error } = await supabase.from('kb_posts').insert({
                user_id: session.user.id,
                content: content.trim()
            } as any);

            if (error) throw error;

            setContent('');
            setIsExpanded(false);
            // Optionally trigger a refresh via context or prop if needed, 
            // but the realtime listener in FeedList handles it naturally? 
            // Actually Realtime in FeedList will pick it up!
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isExpanded) {
        return (
            <div className="mb-6">
                <div
                    onClick={() => setIsExpanded(true)}
                    className="bg-surface border border-border rounded-xl p-4 flex items-center gap-3 cursor-text hover:border-primary/50 transition-colors shadow-sm"
                >
                    <div className="w-8 h-8 rounded-full bg-surface-card flex items-center justify-center text-text-muted text-xs font-bold border border-border">
                        {profile?.nickname?.[0]?.toUpperCase() || '?'}
                    </div>
                    <span className="text-text-muted text-sm truncate">Tengah fikir apa tu, {profile?.nickname || 'Runner'}?</span>
                </div>
            </div>
        );
    }

    return (
        <div className="mb-6 bg-surface border border-border rounded-xl p-4 shadow-md animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-bold text-text-primary">Buat Post Baru</span>
                <button onClick={() => setIsExpanded(false)} className="text-text-muted hover:text-text-primary">
                    <X className="w-4 h-4" />
                </button>
            </div>

            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share run tadi, stats, atau apa-apa je..."
                className="w-full bg-surface-card border border-border rounded-lg p-3 text-text-primary text-sm min-h-[100px] focus:outline-none focus:border-primary resize-none placeholder:text-text-muted/50 mb-3"
                autoFocus
            />

            <div className="flex justify-end">
                <RequireProfile>
                    <button
                        onClick={() => handleSubmit()}
                        disabled={loading || !content.trim()}
                        className="bg-primary text-charcoal font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        Hantar
                    </button>
                </RequireProfile>
            </div>
        </div>
    );
}
