import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../types/supabase';
import { format } from 'date-fns';
import { MapPin, Calendar, Clock, ScanLine, Loader2, ShieldCheck } from 'lucide-react';
import QRScanner from '../components/checkin/QRScanner';
import PotluckList from '../components/potluck/PotluckList';
import SafetyChecklist from '../components/events/SafetyChecklist';
import AttendeeList from '../components/events/AttendeeList';
import EventPhotoAlbum from '../components/events/EventPhotoAlbum';
import RSVPButton from '../components/events/RSVPButton';

type Event = Database['public']['Tables']['kb_events']['Row'] & {
    currentUserRSVP?: 'going' | 'maybe' | 'not_going';
    kb_event_sponsors: {
        tier: string;
        kb_sponsors: {
            name: string;
            logo_url: string | null;
            website_url: string | null;
        } | null;
    }[];
};

export default function EventsPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [showScanner, setShowScanner] = useState(false);

    const fetchEvents = useCallback(async () => {
        try {
            // Fetch events first
            const { data: eventsData, error: eventsError } = await supabase
                .from('kb_events')
                .select('*')
                .order('date', { ascending: false });

            if (eventsError) throw eventsError;

            // Fetch sponsors for these events
            const { data: sponsorsData, error: sponsorsError } = await supabase
                .from('kb_event_sponsors')
                .select('event_id, tier, kb_sponsors(name, logo_url, website_url)');

            if (sponsorsError) {
                console.warn('Error fetching event sponsors:', sponsorsError);
            }

            // Fetch user's RSVPs if logged in
            const { data: { session } } = await supabase.auth.getSession();
            let userRSVPs: Database['public']['Tables']['kb_event_rsvps']['Row'][] = [];
            if (session?.user) {
                const { data: rsvps, error: rsvpError } = await supabase
                    .from('kb_event_rsvps')
                    .select('event_id, status')
                    .eq('user_id', session.user.id);

                if (rsvps) userRSVPs = rsvps;
                if (rsvpError) console.warn('Error fetching RSVPs:', rsvpError);
            }

            const mergedEvents = (eventsData || []).map(event => ({
                ...event,
                currentUserRSVP: userRSVPs.find(r => r.event_id === event.id)?.status, // Add user's RSVP status
                kb_event_sponsors: (sponsorsData || [])
                    .filter(s => s.event_id === event.id)
                    .map(s => ({
                        tier: s.tier,
                        kb_sponsors: s.kb_sponsors
                    }))
            }));

            setEvents(mergedEvents as unknown as Event[]);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    return (
        <div className="p-4 pt-20 min-h-screen bg-background pb-24">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-primary">Events</h1>
                    <p className="text-text-muted text-sm">Join our upcoming runs</p>
                </div>

                <button
                    onClick={() => setShowScanner(true)}
                    className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:shadow-xl transition-all active:scale-95 border border-primary/20"
                >
                    <ScanLine className="w-5 h-5" />
                    <span>Check In</span>
                </button>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="space-y-4">
                    {events.map(event => (
                        <div key={event.id} className="bg-surface rounded-xl p-5 border border-border shadow-sm hover:border-primary/50 transition-colors">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="font-bold text-lg text-text-primary">{event.title}</h3>
                                {new Date(event.date) >= new Date() && (
                                    <span className="px-2 py-1 bg-green-500/10 text-green-500 text-xs font-bold rounded-full border border-green-500/20">
                                        UPCOMING
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3 text-sm text-text-muted mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-primary border border-border">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <span>{format(new Date(event.date), 'EEEE, MMMM d, yyyy')}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-primary border border-border">
                                        <Clock className="w-4 h-4" />
                                    </div>
                                    <span>{event.time}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-background flex items-center justify-center text-primary border border-border">
                                        <MapPin className="w-4 h-4" />
                                    </div>
                                    <span>{event.location_name}</span>
                                </div>
                            </div>

                            {/* RSVP Button */}
                            <div className="mb-6">
                                <RSVPButton
                                    eventId={event.id}
                                    currentStatus={event.currentUserRSVP}
                                />
                            </div>

                            {/* Sponsors Section */}
                            {event.kb_event_sponsors && event.kb_event_sponsors.length > 0 && (
                                <div className="mb-6 p-4 bg-background border border-border rounded-xl">
                                    <div className="flex items-center gap-2 mb-3">
                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                        <h4 className="text-xs font-bold text-text-muted uppercase">Event Sponsors</h4>
                                    </div>
                                    <div className="flex flex-wrap gap-4">
                                        {event.kb_event_sponsors.map((es, idx) => es.kb_sponsors && (
                                            <a
                                                key={idx}
                                                href={es.kb_sponsors.website_url || '#'}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex flex-col items-center gap-1 group"
                                            >
                                                <div className="w-12 h-12 rounded-lg bg-surface border border-border flex items-center justify-center overflow-hidden group-hover:border-primary transition-colors">
                                                    {es.kb_sponsors.logo_url ? (
                                                        <img src={es.kb_sponsors.logo_url} alt={es.kb_sponsors.name} className="w-full h-full object-contain p-1" />
                                                    ) : (
                                                        <ShieldCheck className="w-6 h-6 text-text-muted" />
                                                    )}
                                                </div>
                                                <span className="text-[10px] text-text-muted font-medium">{es.kb_sponsors.name}</span>
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <SafetyChecklist />
                            <AttendeeList eventId={event.id} />
                            <PotluckList eventId={event.id} />
                            <EventPhotoAlbum eventId={event.id} />
                        </div>
                    ))}

                    {events.length === 0 && (
                        <div className="text-center py-16 bg-surface rounded-xl border border-dashed border-border">
                            <Calendar className="w-12 h-12 text-text-muted mx-auto mb-4 opacity-50" />
                            <h3 className="text-lg font-medium text-text-primary mb-1">No Events Found</h3>
                            <p className="text-text-muted text-sm">Check back later for upcoming runs.</p>
                        </div>
                    )}
                </div>
            )}

            {showScanner && (
                <QRScanner
                    onClose={() => setShowScanner(false)}
                    onSuccess={() => setShowScanner(false)}
                />
            )}
        </div>
    );
}
