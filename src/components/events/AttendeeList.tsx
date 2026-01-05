import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Users } from 'lucide-react';
import type { Database } from '../../types/supabase';

type Profile = Database['public']['Tables']['kb_profiles']['Row'];

interface Attendee {
    id: string;
    profiles: Profile;
}

export default function AttendeeList({ eventId }: { eventId: string }) {
    const [attendees, setAttendees] = useState<Attendee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAttendees();

        // Subscribe to changes
        const channel = supabase
            .channel(`checkins_${eventId}`)
            .on(
                'postgres_changes',
                {
                    event: 'INSERT',
                    schema: 'public',
                    table: 'kb_checkins',
                    filter: `event_id=eq.${eventId}`
                },
                () => {
                    fetchAttendees();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [eventId]);

    async function fetchAttendees() {
        try {
            const { data, error } = await supabase
                .from('kb_checkins')
                .select(`
                    id,
                    profiles:user_id (*)
                `)
                .eq('event_id', eventId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setAttendees(data as any || []);
        } catch (error) {
            console.error('Error fetching attendees:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading && attendees.length === 0) return null;
    if (attendees.length === 0) return null;

    return (
        <div className="mt-4 border-t border-border/50 pt-4">
            <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-text-muted uppercase flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    Runner On-Site ({attendees.length})
                </h4>
            </div>

            <div className="flex flex-wrap gap-2">
                {attendees.map((attendee) => (
                    <div
                        key={attendee.id}
                        className="group relative"
                        title={attendee.profiles.nickname}
                    >
                        {attendee.profiles.avatar_url ? (
                            <img
                                src={attendee.profiles.avatar_url}
                                alt={attendee.profiles.nickname}
                                className="w-8 h-8 rounded-full border border-border shadow-sm group-hover:border-primary transition-colors object-cover"
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-charcoal border border-border flex items-center justify-center text-[10px] font-bold text-text-muted group-hover:border-primary transition-colors">
                                {attendee.profiles.nickname.substring(0, 2).toUpperCase()}
                            </div>
                        )}
                        <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-green-500 border-2 border-surface rounded-full shadow-sm"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
