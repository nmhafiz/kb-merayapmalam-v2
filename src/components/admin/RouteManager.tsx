import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Plus, Map, TrendingUp, Trash2, Edit2, Loader2, Link as LinkIcon, Image as ImageIcon } from 'lucide-react';
import type { Database } from '../../types/supabase';
import clsx from 'clsx';

type Route = Database['public']['Tables']['kb_routes']['Row'];
type RouteInsert = Database['public']['Tables']['kb_routes']['Insert'];

export default function RouteManager() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingRoute, setEditingRoute] = useState<Partial<Route> | null>(null);

    useEffect(() => {
        fetchRoutes();
    }, []);

    async function fetchRoutes() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('kb_routes')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setRoutes(data || []);
        } catch (error) {
            console.error('Error fetching routes:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingRoute) return;
        setLoading(true);
        try {
            if (editingRoute.id) {
                const { error } = await supabase
                    .from('kb_routes')
                    .update(editingRoute)
                    .eq('id', editingRoute.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('kb_routes')
                    .insert([editingRoute as RouteInsert]);
                if (error) throw error;
            }
            setIsEditing(false);
            setEditingRoute(null);
            fetchRoutes();
        } catch (error) {
            console.error('Error saving route:', error);
            alert('Failed to save route. Check console.');
        } finally {
            setLoading(false);
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this route?')) return;
        try {
            const { error } = await supabase.from('kb_routes').delete().eq('id', id);
            if (error) throw error;
            fetchRoutes();
        } catch (error) {
            console.error('Error deleting route:', error);
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
                    <Map className="w-5 h-5 text-primary" />
                    Route Library
                </h2>
                <button
                    onClick={() => {
                        setEditingRoute({
                            title: '',
                            distance_km: 5,
                            difficulty: 'Easy',
                            is_vetted: true,
                            description: '',
                            map_url: '',
                            preview_url: '',
                            start_point: ''
                        });
                        setIsEditing(true);
                    }}
                    className="bg-primary text-charcoal font-bold text-xs px-3 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-hover transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    Add New Route
                </button>
            </div>

            {isEditing && (
                <div className="bg-surface border border-border p-6 rounded-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase">Route Title</label>
                            <input
                                required
                                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                value={editingRoute?.title || ''}
                                onChange={e => setEditingRoute({ ...editingRoute, title: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase">Distance (KM)</label>
                            <input
                                type="number"
                                step="0.1"
                                required
                                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                value={editingRoute?.distance_km || ''}
                                onChange={e => setEditingRoute({ ...editingRoute, distance_km: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase">Difficulty</label>
                            <select
                                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                value={editingRoute?.difficulty || 'Easy'}
                                onChange={e => setEditingRoute({ ...editingRoute, difficulty: e.target.value as any })}
                            >
                                <option value="Easy">Easy</option>
                                <option value="Moderate">Moderate</option>
                                <option value="Hard">Hard</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase">Start Point</label>
                            <input
                                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                value={editingRoute?.start_point || ''}
                                onChange={e => setEditingRoute({ ...editingRoute, start_point: e.target.value })}
                                placeholder="Cth: KB Mall"
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="text-xs font-bold text-text-muted uppercase">Description</label>
                            <textarea
                                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none h-20"
                                value={editingRoute?.description || ''}
                                onChange={e => setEditingRoute({ ...editingRoute, description: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1">
                                <LinkIcon className="w-3 h-3" /> Map URL (Strava/Waze)
                            </label>
                            <input
                                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                value={editingRoute?.map_url || ''}
                                onChange={e => setEditingRoute({ ...editingRoute, map_url: e.target.value })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-text-muted uppercase flex items-center gap-1">
                                <ImageIcon className="w-3 h-3" /> Preview Image URL
                            </label>
                            <input
                                className="w-full bg-charcoal border border-border rounded-lg px-3 py-2 text-sm focus:border-primary outline-none"
                                value={editingRoute?.preview_url || ''}
                                onChange={e => setEditingRoute({ ...editingRoute, preview_url: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 flex justify-end gap-3 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-xs font-bold text-text-muted hover:text-text-primary transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-charcoal font-bold px-6 py-2 rounded-lg text-xs hover:bg-primary-hover active:scale-95 transition-all flex items-center gap-2"
                            >
                                {loading && <Loader2 className="w-3 h-3 animate-spin" />}
                                Save Route
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {loading && routes.length === 0 ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : routes.map(route => (
                    <div key={route.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-charcoal-light rounded-lg border border-border flex items-center justify-center text-primary group-hover:scale-110 transition-transform overflow-hidden">
                                {route.preview_url ? (
                                    <img src={route.preview_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Map className="w-6 h-6" />
                                )}
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary">{route.title}</h3>
                                <div className="flex items-center gap-3 text-[10px] text-text-muted mt-0.5">
                                    <span className="flex items-center gap-1 uppercase font-bold">
                                        <TrendingUp className="w-3 h-3" /> {route.distance_km}km
                                    </span>
                                    <span className={clsx(
                                        "px-1.5 py-0.5 rounded text-[8px] font-black uppercase border",
                                        route.difficulty === 'Easy' && "bg-green-500/10 text-green-500 border-green-500/20",
                                        route.difficulty === 'Moderate' && "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
                                        route.difficulty === 'Hard' && "bg-red-500/10 text-red-500 border-red-500/20"
                                    )}>
                                        {route.difficulty}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => {
                                    setEditingRoute(route);
                                    setIsEditing(true);
                                }}
                                className="p-2 text-text-muted hover:text-primary hover:bg-white/5 rounded-lg transition-colors"
                            >
                                <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDelete(route.id)}
                                className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
