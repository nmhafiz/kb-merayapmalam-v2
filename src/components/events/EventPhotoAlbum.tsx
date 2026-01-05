import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Image as ImageIcon, Plus, Loader2, X, Maximize2 } from 'lucide-react';
import type { Database } from '../../types/supabase';

type Photo = Database['public']['Tables']['kb_event_photos']['Row'];

interface EventPhotoAlbumProps {
    eventId: string;
}

export default function EventPhotoAlbum({ eventId }: EventPhotoAlbumProps) {
    const [photos, setPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

    const fetchPhotos = useCallback(async () => {
        try {
            const { data, error } = await supabase
                .from('kb_event_photos')
                .select('*')
                .eq('event_id', eventId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setPhotos(data || []);
        } catch (error) {
            console.error('Error fetching photos:', error);
        } finally {
            setLoading(false);
        }
    }, [eventId]);

    useEffect(() => {
        fetchPhotos();
    }, [fetchPhotos]);

    async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${eventId}/${Math.random()}.${fileExt}`;
            const filePath = `event-photos/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('event-assets')
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data: { publicUrl } } = supabase.storage
                .from('event-assets')
                .getPublicUrl(filePath);

            const { error: dbError } = await supabase
                .from('kb_event_photos')
                .insert([{
                    event_id: eventId,
                    url: publicUrl,
                    caption: '',
                }]);

            if (dbError) throw dbError;
            fetchPhotos();
        } catch (error) {
            console.error('Error uploading photo:', error);
            alert('Upload failed. Did you check storage bucket "event-assets" exists?');
        } finally {
            setUploading(false);
        }
    }

    return (
        <div className="mt-8 space-y-4">
            <div className="flex items-center justify-between border-t border-border pt-6">
                <div className="flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-primary" />
                    <h4 className="text-sm font-bold text-text-primary uppercase tracking-tight">Run Photos</h4>
                </div>
                <label className="cursor-pointer flex items-center gap-2 bg-surface border border-border px-3 py-1.5 rounded-lg text-xs font-bold text-text-primary hover:border-primary transition-colors">
                    {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                    <span>Add Photo</span>
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={uploading} />
                </label>
            </div>

            {loading ? (
                <div className="flex justify-center py-4">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
            ) : photos.length === 0 ? (
                <div className="bg-background border border-dashed border-border rounded-xl p-6 text-center">
                    <p className="text-xs text-text-muted">No photos yet. Be the first to share!</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {photos.map(photo => (
                        <div
                            key={photo.id}
                            className="relative aspect-square rounded-lg overflow-hidden bg-background border border-border group cursor-pointer"
                            onClick={() => setSelectedPhoto(photo.url)}
                        >
                            <img src={photo.url} alt="Event" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Lightbox / Preview */}
            {selectedPhoto && (
                <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <button
                        onClick={() => setSelectedPhoto(null)}
                        className="absolute top-6 right-6 p-2 text-white hover:text-primary transition-colors"
                    >
                        <X className="w-8 h-8" />
                    </button>
                    <img src={selectedPhoto} alt="Preview" className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                </div>
            )}
        </div>
    );
}
