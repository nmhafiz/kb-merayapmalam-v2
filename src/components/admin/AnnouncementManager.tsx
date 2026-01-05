import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader2, Plus, Edit2, Trash2, Megaphone, AlertTriangle, Pin } from 'lucide-react';
import type { Database } from '../../types/supabase';
import clsx from 'clsx';

type Announcement = Database['public']['Tables']['kb_announcements']['Row'];

export default function AnnouncementManager() {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState<Partial<Announcement> | null>(null);

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    async function fetchAnnouncements() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('kb_announcements')
                .select('*')
                .order('is_pinned', { ascending: false })
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAnnouncements(data || []);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        } finally {
            setLoading(false);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!editingAnnouncement) return;

        setLoading(true);
        try {
            if (editingAnnouncement.id) {
                const { error } = await supabase
                    .from('kb_announcements')
                    .update(editingAnnouncement)
                    .eq('id', editingAnnouncement.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('kb_announcements')
                    .insert([editingAnnouncement as Database['public']['Tables']['kb_announcements']['Insert']]);
                if (error) throw error;
            }
            setIsEditing(false);
            setEditingAnnouncement(null);
            fetchAnnouncements();
        } catch (error) {
            console.error('Error saving announcement:', error);
            alert('Failed to save announcement');
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this announcement?')) return;
        try {
            const { error } = await supabase
                .from('kb_announcements')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchAnnouncements();
        } catch (error) {
            console.error('Error deleting announcement:', error);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    Announcements
                </h2>
                {!isEditing && (
                    <button
                        onClick={() => {
                            setEditingAnnouncement({ title: '', content: '', is_pinned: false, is_urgent: false });
                            setIsEditing(true);
                        }}
                        className="bg-primary text-charcoal font-bold text-sm px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Announcement
                    </button>
                )}
            </div>

            {isEditing && editingAnnouncement ? (
                <div className="bg-surface border border-border rounded-xl p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1">Title</label>
                            <input
                                required
                                type="text"
                                value={editingAnnouncement.title || ''}
                                onChange={e => setEditingAnnouncement({ ...editingAnnouncement, title: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none transition-colors"
                                placeholder="Main Title"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-text-muted uppercase mb-1">Content</label>
                            <textarea
                                required
                                rows={4}
                                value={editingAnnouncement.content || ''}
                                onChange={e => setEditingAnnouncement({ ...editingAnnouncement, content: e.target.value })}
                                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-text-primary focus:border-primary outline-none transition-colors"
                                placeholder="What's happening?"
                            />
                        </div>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editingAnnouncement.is_pinned || false}
                                    onChange={e => setEditingAnnouncement({ ...editingAnnouncement, is_pinned: e.target.checked })}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                                />
                                <span className="text-sm text-text-primary">Pinned to top</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={editingAnnouncement.is_urgent || false}
                                    onChange={e => setEditingAnnouncement({ ...editingAnnouncement, is_urgent: e.target.checked })}
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-background"
                                />
                                <span className="text-sm text-text-primary">Urgent (Red Alert)</span>
                            </label>
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
                                {loading ? 'Saving...' : 'Save Announcement'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid gap-4">
                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                        </div>
                    ) : announcements.length === 0 ? (
                        <div className="text-center py-12 bg-surface border border-dashed border-border rounded-xl">
                            <p className="text-text-muted">No announcements yet.</p>
                        </div>
                    ) : (
                        announcements.map(item => (
                            <div key={item.id} className={clsx(
                                "p-4 rounded-xl border transition-colors",
                                item.is_urgent ? "bg-red-500/5 border-red-500/20" : "bg-surface border-border hover:border-border-hover"
                            )}>
                                <div className="flex justify-between items-start gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            {item.is_pinned && <Pin className="w-3.5 h-3.5 text-primary fill-primary" />}
                                            {item.is_urgent && <AlertTriangle className="w-3.5 h-3.5 text-red-500" />}
                                            <h3 className="font-bold text-text-primary truncate">{item.title}</h3>
                                        </div>
                                        <p className="text-sm text-text-muted line-clamp-2">{item.content}</p>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => {
                                                setEditingAnnouncement(item);
                                                setIsEditing(true);
                                            }}
                                            className="p-2 text-text-muted hover:text-primary hover:bg-surface-card rounded-lg transition-colors"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
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
