import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '../../lib/supabase';
import { Loader2, Calendar, MapPin, Clock, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import type { Database } from '../../types/supabase';

type Event = Database['public']['Tables']['kb_events']['Row'];

const eventSchema = z.object({
    title: z.string().min(3, 'Title is too short'),
    description: z.string().optional(),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    location_name: z.string().min(3, 'Location name is required'),
    location_map_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
    existingEvent?: Event;
}

export default function EventForm({ existingEvent }: EventFormProps) {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>({
        resolver: zodResolver(eventSchema),
        defaultValues: existingEvent ? {
            title: existingEvent.title,
            description: existingEvent.description || '',
            date: existingEvent.date,
            time: existingEvent.time, // Ensure format is HH:MM:SS or HH:MM
            location_name: existingEvent.location_name,
            location_map_url: existingEvent.location_map_url || '',
        } : {
            date: new Date().toISOString().split('T')[0],
            time: '21:00'
        }
    });

    const onSubmit = async (data: EventFormData) => {
        setLoading(true);
        setError(null);
        try {
            if (existingEvent) {
                // Update
                const { error: updateError } = await supabase
                    .from('kb_events')
                    // @ts-ignore
                    .update({
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        time: data.time,
                        location_name: data.location_name,
                        location_map_url: data.location_map_url || null,
                    } as any)
                    .eq('id', existingEvent.id);

                if (updateError) throw updateError;
            } else {
                // Create
                const { error: insertError } = await supabase
                    .from('kb_events')
                    // @ts-ignore
                    .insert({
                        title: data.title,
                        description: data.description,
                        date: data.date,
                        time: data.time,
                        location_name: data.location_name,
                        location_map_url: data.location_map_url || null,
                    } as any);

                if (insertError) throw insertError;
            }

            // Redirect back to dashboard or event list
            navigate('/admin');

        } catch (err: any) {
            console.error('Error saving event:', err);
            setError(err.message || 'Failed to save event');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-lg mx-auto pb-24">

            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
                <button type="button" onClick={() => navigate('/admin')} className="p-2 -ml-2 text-text-muted hover:text-text-primary">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-bold text-text-primary">
                    {existingEvent ? 'Edit Event' : 'New Event'}
                </h1>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Inputs */}
            <div className="space-y-4">
                <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">Event Title</label>
                    <input
                        {...register('title')}
                        className="w-full bg-surface-card border border-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g. Merayap Malam: Loop Bandar"
                    />
                    {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Date
                        </label>
                        <input
                            type="date"
                            {...register('date')}
                            className="w-full bg-surface-card border border-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                        />
                        {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date.message}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Time (24h)
                        </label>
                        <input
                            type="time"
                            {...register('time')}
                            className="w-full bg-surface-card border border-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-primary transition-colors [color-scheme:dark]"
                        />
                        {errors.time && <p className="text-red-500 text-xs mt-1">{errors.time.message}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Location Name
                    </label>
                    <input
                        {...register('location_name')}
                        className="w-full bg-surface-card border border-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                        placeholder="e.g. Dataran KB Checkpoint"
                    />
                    {errors.location_name && <p className="text-red-500 text-xs mt-1">{errors.location_name.message}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">Map URL (Optional)</label>
                    <input
                        {...register('location_map_url')}
                        className="w-full bg-surface-card border border-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-primary transition-colors"
                        placeholder="https://maps.google.com/..."
                    />
                    {errors.location_map_url && <p className="text-red-500 text-xs mt-1">{errors.location_map_url.message}</p>}
                </div>

                <div>
                    <label className="block text-xs font-semibold text-text-muted mb-1 uppercase tracking-wider">Description</label>
                    <textarea
                        {...register('description')}
                        className="w-full bg-surface-card border border-border rounded-lg p-3 text-text-primary focus:outline-none focus:border-primary transition-colors min-h-[120px]"
                        placeholder="Details about pace, requirements, etc."
                    />
                </div>
            </div>

            {/* Actions */}
            <div className="pt-4">
                <button
                    type="submit"
                    disabled={loading}
                    className={clsx(
                        "w-full bg-primary text-charcoal font-bold p-4 rounded-xl flex items-center justify-center gap-2 hover:bg-primary-hover transition-all active:scale-[0.98]",
                        loading && "opacity-70 cursor-wait"
                    )}
                >
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    {existingEvent ? 'Save Changes' : 'Create Event'}
                </button>
            </div>

        </form>
    );
}
