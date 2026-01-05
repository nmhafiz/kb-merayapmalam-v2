import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import EventCard from '../components/ui/EventCard';
import { Megaphone, AlertTriangle, Pin, Loader2, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import clsx from 'clsx';
import type { Database } from '../types/supabase';
import { useAuth } from '../context/AuthContext';
import PollsWidget from '../components/home/PollsWidget';

type Announcement = Database['public']['Tables']['kb_announcements']['Row'];
type Event = Database['public']['Tables']['kb_events']['Row'] & {
    kb_checkins?: { count: number }[];
    userStatus?: 'going' | 'maybe' | 'not_going';
    rsvpCount?: number;
};

export default function HomePage() {
    const { profile } = useAuth();
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                // Fetch latest urgent or pinned announcement
                const { data: announcementsData } = await supabase
                    .from('kb_announcements')
                    .select('*')
                    .order('is_urgent', { ascending: false })
                    .order('is_pinned', { ascending: false })
                    .order('created_at', { ascending: false })
                    .limit(3);

                if (announcementsData) {
                    setAnnouncements(announcementsData);
                }

                // Fetch upcoming events (including today)
                const today = new Date().toISOString().split('T')[0];
                const { data: eventsData, error: eventsError } = await supabase
                    .from('kb_events')
                    .select('*')
                    .gte('date', today)
                    .order('date', { ascending: true })
                    .limit(5);

                if (eventsError) throw eventsError;

                if (eventsData) {
                    // Fetch check-ins for these events separately to avoid relationship errors
                    const { data: checkinsData, error: checkinsError } = await supabase
                        .from('kb_checkins')
                        .select('event_id, id');

                    if (checkinsError) {
                        console.warn('Error fetching check-ins:', checkinsError);
                    }

                    // Fetch current user's RSVPs
                    const { data: { session } } = await supabase.auth.getSession();
                    let userRSVPs: { event_id: string; status: string }[] = [];
                    if (session?.user) {
                        const { data: rsvps } = await supabase
                            .from('kb_event_rsvps')
                            .select('event_id, status')
                            .eq('user_id', session.user.id);
                        if (rsvps) userRSVPs = rsvps;
                    }

                    // Fetch all "going" RSVPs for attendee count
                    const { data: allRSVPs } = await supabase
                        .from('kb_event_rsvps')
                        .select('event_id')
                        .eq('status', 'going');

                    const mergedEvents = (eventsData || []).map(event => ({
                        ...event,
                        kb_checkins: (checkinsData || []).filter(c => c.event_id === event.id),
                        rsvpCount: (allRSVPs || []).filter(r => r.event_id === event.id).length,
                        userStatus: userRSVPs.find(r => r.event_id === event.id)?.status as 'going' | 'maybe' | 'not_going' | undefined
                    }));

                    setUpcomingEvents(mergedEvents as unknown as Event[]);
                }
            } catch (error) {
                console.error('Error fetching home data:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="p-4 pt-10 pb-24 space-y-8 animate-in fade-in duration-500">
            <header className="flex justify-between items-start">
                <div>
                    <span className="text-text-muted text-sm uppercase tracking-wider font-medium">Welcome Back Geng</span>
                    <h1 className="text-3xl font-bold text-primary">{profile?.nickname || profile?.handle || 'Runner'}</h1>
                </div>
                <div className="w-12 h-12 rounded-full bg-surface-card border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                    {profile?.avatar_url ? (
                        <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile?.handle || 'Runner'}`} alt="Avatar" className="w-full h-full object-cover" />
                    )}
                </div>
            </header>

            {/* Announcement Section */}
            {announcements.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                        <Megaphone className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-bold text-text-muted uppercase tracking-tight">Announcements</h2>
                    </div>
                    <div className="space-y-3">
                        {announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={clsx(
                                    "rounded-2xl p-4 border shadow-sm transition-all",
                                    announcement.is_urgent
                                        ? "bg-red-500/10 border-red-500/20 shadow-red-500/5"
                                        : "bg-surface border-border shadow-black/5"
                                )}>
                                <div className="flex items-start gap-3">
                                    <div className={clsx(
                                        "mt-0.5 p-1.5 rounded-lg shrink-0",
                                        announcement.is_urgent ? "bg-red-500 text-white" : "bg-primary text-charcoal"
                                    )}>
                                        {announcement.is_urgent ? <AlertTriangle className="w-4 h-4" /> : (announcement.is_pinned ? <Pin className="w-4 h-4" /> : <Megaphone className="w-4 h-4" />)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-text-primary mb-1 text-sm">{announcement.title}</h3>
                                        <p className="text-xs text-text-muted leading-relaxed line-clamp-2">
                                            {announcement.content}
                                        </p>
                                        <span className="text-[10px] text-text-muted/60 mt-2 block">
                                            {format(new Date(announcement.created_at || ''), 'd MMM yyyy, h:mm a')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}


            {/* Polls Widget */}
            <PollsWidget />

            {/* Upcoming Run Section */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-primary" />
                        <h2 className="text-sm font-bold text-text-muted uppercase tracking-tight">Upcoming Runs</h2>
                    </div>
                    {upcomingEvents.length > 0 && (
                        <span className="text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                            {upcomingEvents.length} {upcomingEvents.length === 1 ? 'Event' : 'Events'}
                        </span>
                    )}
                </div>

                <div className="space-y-4">
                    {upcomingEvents.length > 0 ? (
                        upcomingEvents.map((event, index) => (
                            <EventCard
                                key={event.id}
                                id={event.id}
                                title={event.title}
                                date={format(new Date(event.date), 'EEEE, dd MMM')}
                                time={format(new Date(`2000-01-01T${event.time}`), 'p')}
                                location={event.location_name}
                                attendees={event.rsvpCount || 0}
                                highlight={index === 0}
                                userStatus={event.userStatus}
                            />
                        ))
                    ) : (
                        <div className="bg-surface border border-dashed border-border rounded-2xl p-8 text-center">
                            <Calendar className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-20" />
                            <p className="text-text-muted text-sm">No scheduled runs found.</p>
                            <button className="mt-4 text-xs font-bold text-primary hover:underline">Check past events &rarr;</button>
                        </div>
                    )}
                </div>
            </section>
        </div >
    );
}
