import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { Loader2, Plus, Trash2, Utensils, Droplets, Package } from 'lucide-react';

type Event = Database['public']['Tables']['kb_events']['Row'];
type PotluckItem = Database['public']['Tables']['kb_potluck_items']['Row'];

export default function PotluckManager() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string>('');
    const [items, setItems] = useState<PotluckItem[]>([]);
    const [loading, setLoading] = useState(false);

    // Form state
    const [newItemName, setNewItemName] = useState('');
    const [newItemQty, setNewItemQty] = useState(1);
    const [newItemCategory, setNewItemCategory] = useState<'food' | 'drink' | 'other'>('other');
    const [newItemDesc, setNewItemDesc] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

    useEffect(() => {
        if (selectedEventId) {
            fetchItems(selectedEventId);
        } else {
            setItems([]);
        }
    }, [selectedEventId]);

    async function fetchEvents() {
        const { data } = await supabase
            .from('kb_events')
            .select('*')
            .order('date', { ascending: false });
        if (data) setEvents(data);
    }

    async function fetchItems(eventId: string) {
        setLoading(true);
        const { data } = await supabase
            .from('kb_potluck_items')
            .select('*')
            .eq('event_id', eventId)
            .order('created_at', { ascending: true });
        if (data) setItems(data);
        setLoading(false);
    }

    async function handleAddItem(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedEventId || !newItemName) return;

        try {
            const { error } = await supabase
                .from('kb_potluck_items')
                .insert({
                    event_id: selectedEventId,
                    name: newItemName,
                    quantity_required: newItemQty,
                    category: newItemCategory,
                    description: newItemDesc || null,
                    is_suggested: true,
                    created_by: (await supabase.auth.getUser()).data.user?.id
                });

            if (error) throw error;

            setNewItemName('');
            setNewItemQty(1);
            setNewItemDesc('');
            fetchItems(selectedEventId);
        } catch (error) {
            console.error('Error adding item:', error);
            alert('Gagal tambah barang.');
        }
    }

    async function handleDeleteItem(id: string) {
        if (!window.confirm('Betul ke nak buang barang ni?')) return;

        const { error } = await supabase
            .from('kb_potluck_items')
            .delete()
            .eq('id', id);

        if (!error) fetchItems(selectedEventId);
    }

    return (
        <div className="space-y-6">
            <div className="bg-surface border border-border rounded-xl p-6">
                <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
                    <Utensils className="w-5 h-5 text-primary" />
                    Potluck Wishlist Manager
                </h2>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-text-muted uppercase mb-1.5 ml-1">Pilih Event</label>
                        <select
                            value={selectedEventId}
                            onChange={(e) => setSelectedEventId(e.target.value)}
                            className="w-full bg-charcoal border border-border rounded-xl px-4 py-3 text-sm focus:border-primary transition-all outline-none"
                        >
                            <option value="">-- Pilih Event Dulu --</option>
                            {events.map((ev: Event) => (
                                <option key={ev.id} value={ev.id}>{ev.title} ({ev.date})</option>
                            ))}
                        </select>
                    </div>

                    {selectedEventId && (
                        <form onSubmit={handleAddItem} className="p-4 bg-charcoal-light/30 border border-dashed border-border rounded-xl space-y-3">
                            <p className="text-xs font-bold text-primary italic mb-2">Tambah barang baru untuk event ni:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <input
                                    placeholder="Nama barang (cth: Air Mineral 1.5L)"
                                    value={newItemName}
                                    onChange={e => setNewItemName(e.target.value)}
                                    className="bg-charcoal border border-border rounded-lg px-3 py-2 text-sm"
                                    required
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="number"
                                        min="1"
                                        value={newItemQty}
                                        onChange={e => setNewItemQty(parseInt(e.target.value))}
                                        className="w-20 bg-charcoal border border-border rounded-lg px-3 py-2 text-sm"
                                        required
                                    />
                                    <select
                                        value={newItemCategory}
                                        onChange={e => setNewItemCategory(e.target.value as 'food' | 'drink' | 'other')}
                                        className="flex-1 bg-charcoal border border-border rounded-lg px-3 py-2 text-sm"
                                    >
                                        <option value="other">Lain-lain</option>
                                        <option value="food">Makanan</option>
                                        <option value="drink">Minuman</option>
                                    </select>
                                </div>
                            </div>
                            <input
                                placeholder="Nota tambahan (optional)"
                                value={newItemDesc}
                                onChange={e => setNewItemDesc(e.target.value)}
                                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm"
                            />
                            <button
                                type="submit"
                                className="w-full bg-primary text-charcoal font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-2 hover:bg-primary-hover active:scale-[0.98] transition-all"
                            >
                                <Plus className="w-4 h-4" />
                                Simpan Barang
                            </button>
                        </form>
                    )}
                </div>
            </div>

            {selectedEventId && (
                <div className="bg-surface border border-border rounded-xl p-6">
                    <h3 className="text-sm font-bold text-text-primary mb-4">Senarai Barang (Wishlist)</h3>

                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        </div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-6 text-text-muted text-sm border border-dashed border-border rounded-xl italic">
                            Belum ada wishlist. Tambah barang kat atas tu.
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {items.map((item: PotluckItem) => (
                                <div key={item.id} className="flex items-center justify-between p-3 bg-charcoal-light/50 border border-border rounded-lg hover:border-border-hover transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="text-primary opacity-60">
                                            {item.category === 'food' ? <Utensils className="w-4 h-4" /> :
                                                item.category === 'drink' ? <Droplets className="w-4 h-4" /> :
                                                    <Package className="w-4 h-4" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-text-primary">
                                                {item.name} <span className="text-primary font-black ml-1">x{item.quantity_required}</span>
                                            </p>
                                            {item.description && <p className="text-[10px] text-text-muted italic">{item.description}</p>}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteItem(item.id)}
                                        className="p-1.5 text-text-muted hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
