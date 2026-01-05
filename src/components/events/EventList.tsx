import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import EventCard from '../ui/EventCard';
import { Loader2 } from 'lucide-react';

type Event = Database['public']['Tables']['kb_events']['Row'];

export default function EventList() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    async function fetchEvents() {
        try {
            const { data, error } = await supabase
                .from('kb_events')
                .select('*')
                .order('date', { ascending: true })
                .order('time', { ascending: true });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (events.length === 0) {
        return (
            <div className="text-center py-12 text-text-muted">
                <p>Takde event lagi, rilek lu.</p>
                <p className="text-sm mt-2">Nanti check balik k?</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {events.map((event) => (
                <EventCard
                    key={event.id}
                    id={event.id}
                    title={event.title}
                    date={event.date}
                    time={event.time}
                    location={event.location_name}
                    attendees={0} // Placeholder for now
                    userStatus={null} // Placeholder for now
                    isCancelled={event.is_cancelled}
                />
            ))}
        </div>
    );
}
