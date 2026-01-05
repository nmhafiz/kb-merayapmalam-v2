import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Search, Shield, User as UserIcon, Loader2, Check, Plus } from 'lucide-react';
import clsx from 'clsx';
import type { Database } from '../../types/supabase';

type Profile = Database['public']['Tables']['kb_profiles']['Row'];

export default function UserManager() {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchProfiles();
    }, []);

    async function fetchProfiles() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('kb_profiles')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProfiles(data || []);
        } catch (error) {
            console.error('Error fetching profiles:', error);
        } finally {
            setLoading(false);
        }
    }

    async function toggleBadge(profileId: string, badge: string) {
        setUpdatingId(profileId);
        try {
            const profile = profiles.find(p => p.id === profileId);
            if (!profile) return;

            let currentBadges = profile.badges || [];
            if (typeof currentBadges === 'string') {
                try {
                    currentBadges = JSON.parse(currentBadges);
                } catch {
                    currentBadges = [];
                }
            }

            const newBadges = currentBadges.includes(badge)
                ? currentBadges.filter((b: string) => b !== badge)
                : [...currentBadges, badge];

            const { error } = await supabase
                .from('kb_profiles')
                .update({ badges: newBadges })
                .eq('id', profileId);

            if (error) throw error;

            setProfiles(profiles.map(p =>
                p.id === profileId ? { ...p, badges: newBadges } : p
            ));
        } catch (error) {
            console.error('Error updating badge:', error);
        } finally {
            setUpdatingId(null);
        }
    }

    const filteredProfiles = profiles.filter(p =>
        p.nickname?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.handle?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const availableBadges = ['verified', 'pacer', 'medic', 'trusted', 'otai', 'supporter', 'champion'];

    return (
        <div className="space-y-6">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
                <input
                    type="text"
                    placeholder="Cari runner (nama or handle)..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full bg-surface border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:border-primary outline-none transition-all"
                />
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid gap-3">
                    {filteredProfiles.map(profile => (
                        <div key={profile.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-charcoal-light rounded-full border border-border overflow-hidden flex items-center justify-center">
                                    {profile.avatar_url ? (
                                        <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-5 h-5 text-text-muted" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-text-primary">{profile.nickname}</span>
                                        {profile.role === 'admin' && <Shield className="w-3 h-3 text-primary" />}
                                    </div>
                                    <span className="text-xs text-text-muted">@{profile.handle}</span>
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                {availableBadges.map(badge => {
                                    const hasBadge = (profile.badges || []).includes(badge);
                                    return (
                                        <button
                                            key={badge}
                                            onClick={() => toggleBadge(profile.id, badge)}
                                            disabled={updatingId === profile.id}
                                            className={clsx(
                                                "px-2 py-1 rounded text-[10px] font-bold border transition-all flex items-center gap-1",
                                                hasBadge
                                                    ? "bg-primary/20 border-primary text-primary"
                                                    : "bg-surface border-border text-text-muted hover:border-text-muted/50"
                                            )}
                                        >
                                            {hasBadge ? <Check className="w-2.5 h-2.5" /> : <Plus className="w-2.5 h-2.5" />}
                                            {badge.toUpperCase()}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
