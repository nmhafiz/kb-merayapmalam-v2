import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Package, Utensils, Droplets, Plus, Check, Loader2, User as UserIcon, Shield, Trash2 } from 'lucide-react';
import type { Database } from '../../types/supabase';
import clsx from 'clsx';

type Profile = Database['public']['Tables']['kb_profiles']['Row'];
type PotluckItem = Database['public']['Tables']['kb_potluck_items']['Row'] & { is_suggested?: boolean };
type PotluckClaim = Database['public']['Tables']['kb_potluck_claims']['Row'];

interface PotluckListProps {
    eventId: string;
}

interface ItemWithClaims extends PotluckItem {
    claims: (PotluckClaim & { profile?: Profile | null })[];
}

export default function PotluckList({ eventId }: PotluckListProps) {
    const { session } = useAuth();
    const user = session?.user;
    const [items, setItems] = useState<ItemWithClaims[]>([]);
    const [loading, setLoading] = useState(true);
    const [claimingId, setClaimingId] = useState<string | null>(null);
    const [isAddingCustom, setIsAddingCustom] = useState(false);
    const [newItemName, setNewItemName] = useState('');
    const [newItemCategory, setNewItemCategory] = useState<'food' | 'drink' | 'other'>('other');

    const fetchPotluckData = useCallback(async () => {
        if (!eventId) return;
        try {
            const { data: itemsData, error: itemsError } = await supabase
                .from('kb_potluck_items')
                .select('*')
                .eq('event_id', eventId)
                .order('created_at', { ascending: true });

            if (itemsError) throw itemsError;

            if (!itemsData || itemsData.length === 0) {
                setItems([]);
                return;
            }

            const { data: claimsData, error: claimsError } = await supabase
                .from('kb_potluck_claims')
                .select('*')
                .in('item_id', itemsData.map(i => i.id));

            if (claimsError) throw claimsError;

            // Fetch profiles for all claimants
            const userIds = Array.from(new Set(claimsData?.map(c => c.user_id) || [])) as string[];
            const { data: profilesData } = await supabase
                .from('kb_profiles')
                .select('*')
                .in('id', userIds);

            const itemsWithClaims = itemsData.map(item => ({
                ...item,
                claims: (claimsData || []).filter(c => c.item_id === item.id).map(claim => ({
                    ...claim,
                    profile: (profilesData || []).find(p => p.id === claim.user_id)
                }))
            }));

            setItems(itemsWithClaims);
        } catch (error) {
            console.error('Error fetching potluck data:', error);
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchPotluckData();

        const claimsChannel = supabase
            .channel(`potluck_claims_${eventId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'kb_potluck_claims' },
                () => fetchPotluckData()
            )
            .subscribe();

        const itemsChannel = supabase
            .channel(`potluck_items_${eventId}`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'kb_potluck_items', filter: `event_id=eq.${eventId}` },
                () => fetchPotluckData()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(claimsChannel);
            supabase.removeChannel(itemsChannel);
        };
    }, [eventId, fetchPotluckData]);

    async function handleClaim(itemId: string) {
        if (!user) return;
        setClaimingId(itemId);
        try {
            const { error } = await supabase
                .from('kb_potluck_claims')
                .insert({
                    item_id: itemId,
                    user_id: user.id,
                    quantity_promised: 1
                });

            if (error) throw error;
            fetchPotluckData();
        } catch (error) {
            console.error('Error claiming item:', error);
            alert('Failed to claim item. Maybe you already claimed it?');
        } finally {
            setClaimingId(null);
        }
    }

    async function handleUnclaim(claimId: string) {
        try {
            // If it's a custom item (not suggested) and this is the last claim, delete the item too?
            // For now just unclaim.
            const { error } = await supabase
                .from('kb_potluck_claims')
                .delete()
                .eq('id', claimId);

            if (error) throw error;

            // Optional: If item is not suggested and has no claims, we could delete it.
            // But let's keep it simple first.

            fetchPotluckData();
        } catch (error) {
            console.error('Error unclaiming item:', error);
        }
    }

    async function handleAddCustomItem(e: React.FormEvent) {
        e.preventDefault();
        if (!user || !newItemName) return;
        setLoading(true);

        try {
            // 1. Create the item
            const { data: item, error: itemError } = await supabase
                .from('kb_potluck_items')
                .insert({
                    event_id: eventId,
                    name: newItemName,
                    category: newItemCategory,
                    quantity_required: 1,
                    is_suggested: false,
                    created_by: user.id
                })
                .select()
                .single();

            if (itemError) throw itemError;

            // 2. Auto-claim it
            const { error: claimError } = await supabase
                .from('kb_potluck_claims')
                .insert({
                    item_id: item.id,
                    user_id: user.id,
                    quantity_promised: 1
                });

            if (claimError) throw claimError;

            setNewItemName('');
            setIsAddingCustom(false);
            fetchPotluckData();
        } catch (error) {
            console.error('Error adding custom item:', error);
            alert('Gagal tambah barang. Cube lagi!');
        } finally {
            setLoading(false);
        }
    }

    const getCategoryIcon = (category: string) => {
        switch (category.toLowerCase()) {
            case 'food': return <Utensils className="w-4 h-4" />;
            case 'drink': return <Droplets className="w-4 h-4" />;
            default: return <Package className="w-4 h-4" />;
        }
    };

    if (loading && items.length === 0) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
        );
    }

    const hqItems = items.filter(i => i.is_suggested);
    const communityItems = items.filter(i => !i.is_suggested);

    return (
        <div className="space-y-6 mt-8">
            {/* HQ Wishlist Section */}
            {hqItems.length > 0 && (
                <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2 px-1">
                        <Shield className="w-3 h-3 text-primary" />
                        HQ Wishlist (Sumbangan Diperlukan)
                    </h3>
                    <div className="grid gap-2">
                        {hqItems.map(item => {
                            const totalPromised = item.claims.reduce((sum, c) => sum + c.quantity_promised, 0);
                            const isFullyClaimed = totalPromised >= item.quantity_required;
                            const userClaim = item.claims.find(c => c.user_id === user?.id);

                            return (
                                <div key={item.id} className="bg-surface-card border border-border p-3 rounded-xl flex items-center justify-between group">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-primary opacity-70">
                                                {getCategoryIcon(item.category)}
                                            </span>
                                            <span className="text-sm font-bold text-text-primary">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-1 bg-surface rounded-full overflow-hidden">
                                                <div
                                                    className={clsx(
                                                        "h-full transition-all duration-500",
                                                        isFullyClaimed ? "bg-green-500" : "bg-primary"
                                                    )}
                                                    style={{ width: `${Math.min(100, (totalPromised / item.quantity_required) * 100)}%` }}
                                                />
                                            </div>
                                            <span className="text-[9px] font-bold text-text-muted">
                                                {totalPromised} / {item.quantity_required}
                                            </span>
                                        </div>

                                        {item.claims.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-2">
                                                {item.claims.map(claim => (
                                                    <div key={claim.id} className="flex items-center gap-1 bg-charcoal-light/30 px-1.5 py-0.5 rounded border border-border/50">
                                                        <div className="w-3 h-3 rounded-full overflow-hidden border border-border/50">
                                                            {claim.profile?.avatar_url ? (
                                                                <img src={claim.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <UserIcon className="w-full h-full p-0.5 text-text-muted" />
                                                            )}
                                                        </div>
                                                        <span className="text-[8px] font-bold text-text-muted">{claim.profile?.handle || 'Runner'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="ml-4">
                                        {userClaim ? (
                                            <button
                                                onClick={() => handleUnclaim(userClaim.id)}
                                                className="bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/20 transition-all font-inter"
                                            >
                                                <Check className="w-3 h-3" />
                                                Claimed
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleClaim(item.id)}
                                                disabled={isFullyClaimed || !user || claimingId === item.id}
                                                className={clsx(
                                                    "px-3 py-1.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all",
                                                    isFullyClaimed
                                                        ? "bg-surface text-text-muted cursor-not-allowed"
                                                        : "bg-primary text-charcoal hover:bg-primary-hover active:scale-95"
                                                )}
                                            >
                                                {claimingId === item.id ? (
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                ) : (
                                                    <Plus className="w-3 h-3" />
                                                )}
                                                Join
                                            </button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Community Contribution Section */}
            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <h3 className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] flex items-center gap-2">
                        <Utensils className="w-3 h-3 text-primary" />
                        Community Potluck (Dah Ready)
                    </h3>
                    <button
                        onClick={() => setIsAddingCustom(!isAddingCustom)}
                        className="text-[9px] font-bold text-primary hover:underline"
                    >
                        {isAddingCustom ? 'Cancel' : '+ Bawa Sesuatu'}
                    </button>
                </div>

                {isAddingCustom && (
                    <form onSubmit={handleAddCustomItem} className="p-4 bg-primary/5 border border-dashed border-primary/30 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="text-[11px] font-bold text-primary">Nak bawak apa bro? Orang lain boleh nampak.</p>
                        <div className="flex flex-col gap-2">
                            <input
                                placeholder="Cth: Nasi Lemak / Mee Goreng"
                                value={newItemName}
                                onChange={e => setNewItemName(e.target.value)}
                                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                required
                            />
                            <div className="flex gap-2">
                                <select
                                    value={newItemCategory}
                                    onChange={e => setNewItemCategory(e.target.value as any)}
                                    className="flex-1 bg-charcoal border border-border rounded-lg px-3 py-2 text-xs focus:border-primary outline-none"
                                >
                                    <option value="food">Makanan</option>
                                    <option value="drink">Minuman</option>
                                    <option value="other">Lain-lain</option>
                                </select>
                                <button
                                    type="submit"
                                    className="bg-primary text-charcoal font-bold px-4 py-2 rounded-lg text-xs hover:bg-primary-hover active:scale-95 transition-all"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {communityItems.length === 0 && !isAddingCustom ? (
                    <div className="p-8 text-center border border-dashed border-border rounded-xl">
                        <p className="text-[10px] text-text-muted italic">Belum ada community contribution. Be the first!</p>
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {communityItems.map(item => {
                            const userClaim = item.claims.find(c => c.user_id === user?.id);
                            return (
                                <div key={item.id} className="bg-surface border border-border/50 p-3 rounded-xl flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-text-muted">
                                            {getCategoryIcon(item.category)}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-text-primary">{item.name}</p>
                                                <span className="text-[10px] text-text-muted bg-surface-card px-1.5 py-0.5 rounded border border-border">
                                                    Qty: {item.quantity_required}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5 mt-1">
                                                {item.claims.map(claim => (
                                                    <div key={claim.id} className="flex items-center gap-1 bg-charcoal-light/30 px-1.5 py-0.5 rounded border border-border/50">
                                                        <div className="w-3 h-3 rounded-full overflow-hidden border border-border/50">
                                                            {claim.profile?.avatar_url ? (
                                                                <img src={claim.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <UserIcon className="w-full h-full p-0.5 text-text-muted" />
                                                            )}
                                                        </div>
                                                        <span className="text-[8px] font-bold text-text-muted">{claim.profile?.nickname || 'Runner'}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    {userClaim && (
                                        <button
                                            onClick={() => handleUnclaim(userClaim.id)}
                                            className="p-2 text-text-muted hover:text-ember transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
