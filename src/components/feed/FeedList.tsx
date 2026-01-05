import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { Loader2, MessageSquare, Heart, Share2 } from 'lucide-react';

type Post = Database['public']['Tables']['kb_posts']['Row'] & {
    kb_profiles: {
        nickname: string;
        handle: string;
        avatar_url: string | null;
        role: string;
    } | null;
};

// Simple time formatter until date-fns is installed
function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
}

export default function FeedList() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPosts();

        // Setup realtime subscription (Optional for MVP but good for demo)
        const channel = supabase
            .channel('public:posts')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'kb_posts' }, () => {
                // Simplest way: refresh whole list or unshift payload (but payload lacks profile relation)
                // For now, let's just re-fetch to be safe and accurate
                fetchPosts();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    async function fetchPosts() {
        try {
            const { data, error } = await supabase
                .from('kb_posts')
                .select(`
                    *,
                    kb_profiles (
                        nickname,
                        handle,
                        avatar_url,
                        role
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            // The type assertion is needed because Supabase join types are sometimes deep
            setPosts((data as any) || []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className="text-center py-16 px-4">
                <p className="text-text-muted mb-2">Senyap je ni...</p>
                <p className="text-sm text-text-muted">Jadilah yang first start conversation!</p>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-20">
            {posts.map((post) => (
                <div key={post.id} className="bg-surface border border-border rounded-xl p-4 shadow-sm">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-surface-card border border-border flex items-center justify-center text-lg font-bold text-text-muted overflow-hidden">
                                {post.kb_profiles?.avatar_url ? (
                                    <img src={post.kb_profiles.avatar_url} alt={post.kb_profiles.nickname} className="w-full h-full object-cover" />
                                ) : (
                                    post.kb_profiles?.nickname?.[0]?.toUpperCase() || '?'
                                )}
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="text-text-primary font-bold text-sm">
                                        {post.kb_profiles?.nickname || 'Misteri Runner'}
                                    </span>
                                    {post.kb_profiles?.role === 'admin' && (
                                        <span className="bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded font-bold">ADMIN</span>
                                    )}
                                </div>
                                <div className="text-text-muted text-xs">
                                    @{post.kb_profiles?.handle || 'anon'} · {timeAgo(post.created_at)}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="mb-4 text-text-primary text-sm whitespace-pre-wrap leading-relaxed">
                        {post.content}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-6 border-t border-border pt-3">
                        <button className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-xs font-medium group">
                            <Heart className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            <span>Like Sikit</span>
                        </button>

                        <button className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-xs font-medium">
                            <MessageSquare className="w-4 h-4" />
                            <span>Komen</span>
                        </button>

                        <button className="flex items-center gap-1.5 text-text-muted hover:text-primary transition-colors text-xs font-medium ml-auto">
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}
