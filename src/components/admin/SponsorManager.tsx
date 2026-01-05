import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, Edit2, Trash2, ShieldCheck, Globe, Image as ImageIcon } from 'lucide-react';
import type { Database } from '../../types/supabase';

type Sponsor = Database['public']['Tables']['kb_sponsors']['Row'];

export default function SponsorManager() {
    const [sponsors, setSponsors] = useState<Sponsor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingSponsor, setEditingSponsor] = useState<Partial<Sponsor> | null>(null);

    useEffect(() => {
        fetchSponsors();
    }, []);

    async function fetchSponsors() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('kb_sponsors')
                .select('*')
                .order('name');

            if (error) throw error;
            setSponsors(data || []);
        } catch (error) {
            console.error('Error fetching sponsors:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingSponsor) return;

        setLoading(true);
        try {
            if (editingSponsor.id) {
                const { error } = await supabase
                    .from('kb_sponsors')
                    .update(editingSponsor)
                    .eq('id', editingSponsor.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('kb_sponsors')
                    .insert([editingSponsor as Database['public']['Tables']['kb_sponsors']['Insert']]);
                if (error) throw error;
            }
            setIsEditing(false);
            setEditingSponsor(null);
            fetchSponsors();
        } catch (error) {
            console.error('Error saving sponsor:', error);
            alert('Failed to save sponsor');
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this sponsor?')) return;
        try {
            const { error } = await supabase
                .from('kb_sponsors')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchSponsors();
        } catch (error) {
            console.error('Error deleting sponsor:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-primary" />
                    Sponsors
                </h2>
                {!isEditing && (
                    <button
                        onClick={() => {
                            setEditingSponsor({ name: '', logo_url: '', website_url: '', description: '' });
                            setIsEditing(true);
                        }}
                        className="bg-primary text-charcoal font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Sponsor
                    </button>
                )}
            </div>

            {isEditing && editingSponsor ? (
                <div className="bg-surface border border-border rounded-xl p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1">Company Name</label>
                            <input
                                required
                                type="text"
                                value={editingSponsor.name || ''}
                                onChange={e => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none transition-colors"
                                placeholder="Brand Name"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Logo URL</label>
                                <div className="relative">
                                    <ImageIcon className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        type="url"
                                        value={editingSponsor.logo_url || ''}
                                        onChange={e => setEditingSponsor({ ...editingSponsor, logo_url: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-text-primary focus:border-primary outline-none transition-colors"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-text-muted uppercase mb-1">Website URL</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        type="url"
                                        value={editingSponsor.website_url || ''}
                                        onChange={e => setEditingSponsor({ ...editingSponsor, website_url: e.target.value })}
                                        className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-text-primary focus:border-primary outline-none transition-colors"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1">Description</label>
                            <textarea
                                rows={3}
                                value={editingSponsor.description || ''}
                                onChange={e => setEditingSponsor({ ...editingSponsor, description: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none transition-colors"
                                placeholder="Short bio..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button
                                type="button"
                                onClick={() => setIsEditing(false)}
                                className="px-4 py-2 text-sm text-text-muted hover:text-text-primary"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-primary text-charcoal font-bold px-6 py-2 rounded-lg text-sm disabled:opacity-50"
                            >
                                {loading ? 'Saving...' : 'Save Sponsor'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {loading ? (
                        <div className="col-span-full flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : sponsors.length === 0 ? (
                        <div className="col-span-full text-center py-12 bg-surface border border-dashed border-border rounded-xl">
                            <p className="text-text-muted">No sponsors added yet.</p>
                        </div>
                    ) : (
                        sponsors.map(sponsor => (
                            <div key={sponsor.id} className="bg-surface border border-border rounded-xl p-4 hover:border-border-hover transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-background border border-border flex items-center justify-center overflow-hidden">
                                        {sponsor.logo_url ? (
                                            <img src={sponsor.logo_url} alt={sponsor.name} className="w-full h-full object-contain" />
                                        ) : (
                                            <ImageIcon className="w-6 h-6 text-text-muted" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-text-primary truncate">{sponsor.name}</h3>
                                        <div className="flex items-center gap-2 text-xs text-text-muted">
                                            {sponsor.website_url && (
                                                <a href={sponsor.website_url} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                                                    <Globe className="w-3 h-3" />
                                                    Website
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingSponsor(sponsor);
                                                setIsEditing(true);
                                            }}
                                            className="p-2 text-text-muted hover:text-primary hover:bg-surface-card rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(sponsor.id)}
                                            className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
