import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Map, MapPin, Navigation, TrendingUp, Info, Loader2, ExternalLink } from 'lucide-react';
import type { Database } from '../types/supabase';
import clsx from 'clsx';

type Route = Database['public']['Tables']['kb_routes']['Row'];

export default function RoutesPage() {
    const [routes, setRoutes] = useState<Route[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'All' | 'Easy' | 'Moderate' | 'Hard'>('All');

    useEffect(() => {
        fetchRoutes();
    }, []);

    async function fetchRoutes() {
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

    const filteredRoutes = routes.filter(r => filter === 'All' || r.difficulty === filter);

    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'text-green-500 bg-green-500/10';
            case 'moderate': return 'text-yellow-500 bg-yellow-500/10';
            case 'hard': return 'text-red-500 bg-red-500/10';
            default: return 'text-text-muted bg-surface';
        }
    };

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-black text-text-primary tracking-tight">ROUTE LIBRARY</h1>
                <p className="text-sm text-text-muted italic">Koleksi route padu Merayap Malam.</p>
            </div>

            {/* Filter */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-none">
                {['All', 'Easy', 'Moderate', 'Hard'].map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f as any)}
                        className={clsx(
                            "px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap",
                            filter === f
                                ? "bg-primary text-charcoal border-primary"
                                : "bg-surface-card text-text-muted border-border hover:border-text-muted"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : filteredRoutes.length === 0 ? (
                <div className="text-center py-12 px-6 bg-surface-card rounded-2xl border border-border border-dashed">
                    <Map className="w-12 h-12 text-text-muted/20 mx-auto mb-3" />
                    <p className="text-text-muted font-medium">Route library tengah kosong lagi.</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredRoutes.map((route) => (
                        <div key={route.id} className="bg-surface-card border border-border rounded-2xl overflow-hidden group hover:border-primary/30 transition-all active:scale-[0.98]">
                            {/* Preview Image Placeholder */}
                            <div className="aspect-[21/9] bg-surface relative">
                                {route.preview_url ? (
                                    <img src={route.preview_url} alt={route.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center opacity-10">
                                        <Map className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-3 left-3 flex gap-2">
                                    <span className={clsx("px-2 py-1 rounded text-[10px] font-black uppercase", getDifficultyColor(route.difficulty))}>
                                        {route.difficulty}
                                    </span>
                                    {route.is_vetted && (
                                        <span className="bg-primary text-charcoal px-2 py-1 rounded text-[10px] font-black uppercase flex items-center gap-1">
                                            <TrendingUp className="w-3 h-3" />
                                            Vetted
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className="p-4">
                                <h3 className="text-lg font-bold text-text-primary mb-1">{route.title}</h3>
                                <div className="flex items-center gap-4 text-xs text-text-muted mb-3">
                                    <div className="flex items-center gap-1">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        {route.distance_km}km
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <MapPin className="w-3.5 h-3.5" />
                                        {route.start_point || 'KB Area'}
                                    </div>
                                </div>
                                <p className="text-sm text-text-muted mb-4 line-clamp-2">
                                    {route.description || 'Tiada info tambahan.'}
                                </p>

                                <div className="grid grid-cols-2 gap-2">
                                    <a
                                        href={route.map_url || '#'}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center justify-center gap-2 bg-surface border border-border text-text-primary py-2.5 rounded-xl text-xs font-bold hover:bg-white/5"
                                    >
                                        <Navigation className="w-4 h-4" />
                                        Tengok Map
                                    </a>
                                    <button
                                        className="flex items-center justify-center gap-2 bg-primary text-charcoal py-2.5 rounded-xl text-xs font-bold hover:bg-primary-hover"
                                        onClick={() => window.open(route.strava_url || route.map_url || '', '_blank')}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Buka Strava
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Hint */}
            <div className="mt-8 p-4 bg-primary/5 border border-primary/10 rounded-2xl flex gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0" />
                <p className="text-[11px] text-text-muted leading-relaxed">
                    Nak suggest route padu? Share kat community feed nanti admin vetted dan masukkan kat sini!
                </p>
            </div>
        </div>
    );
}
