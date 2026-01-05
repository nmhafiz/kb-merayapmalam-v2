import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { QRCodeSVG } from 'qrcode.react';
import { Loader2, Users, QrCode as QrIcon, RefreshCw, Download } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { format } from 'date-fns';

type Event = Database['public']['Tables']['kb_events']['Row'];
type Checkin = Database['public']['Tables']['kb_checkins']['Row'] & {
    user: Database['public']['Tables']['kb_profiles']['Row']
};

export default function CheckinManager() {
    const [events, setEvents] = useState<Event[]>([]);
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
    const [checkins, setCheckins] = useState<Checkin[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchEvents = useCallback(async () => {
        // Only show recent/active events for check-in management
        const { data, error } = await supabase
            .from('kb_events')
            .select('*')
            .order('date', { ascending: false });

        if (!error && data) {
            setEvents(data);
            if (data.length > 0 && !selectedEventId) {
                setSelectedEventId(data[0].id);
            }
        }
        setLoading(false);
    }, [selectedEventId]);

    const fetchCheckins = useCallback(async (eventId: string) => {
        setRefreshing(true);
        // We need to join with profiles to get user details. 
        // Supabase select query syntax:
        const { data, error } = await supabase
            .from('kb_checkins')
            .select(`
                *,
                user:kb_profiles(*)
            `)
            .eq('event_id', eventId)
            .order('created_at', { ascending: false });

        if (!error && data) {
            // Cast to Checkin type (manual casting often needed with complex joins in simple clients)
            setCheckins(data as unknown as Checkin[]);
        }
        setRefreshing(false);
    }, []);

    useEffect(() => {
        const loadEvents = async () => {
            await fetchEvents();
        };
        loadEvents();
    }, [fetchEvents]);

    useEffect(() => {
        if (selectedEventId) {
            const loadData = async () => {
                await fetchCheckins(selectedEventId);
            };
            loadData();

            // Realtime listener for new check-ins
            const channel = supabase
                .channel(`checkins_${selectedEventId}`)
                .on(
                    'postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'kb_checkins', filter: `event_id=eq.${selectedEventId}` },
                    () => fetchCheckins(selectedEventId)
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            }
        }
    }, [selectedEventId, fetchCheckins]);

    const downloadCSV = () => {
        if (!checkins.length || !selectedEvent) return;

        const headers = ['Nickname', 'Handle', 'Check-in Time'];
        const rows = checkins.map(c => [
            c.user?.nickname || 'Unknown',
            c.user?.handle || '',
            format(new Date(c.created_at), 'yyyy-MM-dd HH:mm:ss')
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `Attendance_${selectedEvent.title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd_HHmm')}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const selectedEvent = events.find(e => e.id === selectedEventId);

    // QR Code Value: We'll use a simple JSON format.
    // In production, you might sign this to prevent fake QR generation, but for this MVP, raw ID is fine.
    const qrValue = selectedEvent ? JSON.stringify({
        action: 'kb-checkin',
        eventId: selectedEvent.id,
        eventName: selectedEvent.title
    }) : '';

    return (
        <div className="bg-surface border border-border rounded-xl p-6">
            <h2 className="text-lg font-bold text-text-primary mb-6 flex items-center gap-2">
                <QrIcon className="w-5 h-5 text-primary" />
                Check-in Manager
            </h2>

            {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" /></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left: Event Selection & QR */}
                    <div className="md:col-span-1 space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-text-muted mb-2">Select Event</label>
                            <select
                                className="w-full bg-surface-card border border-border rounded-lg p-2 text-text-primary text-sm outline-none focus:border-primary"
                                value={selectedEventId || ''}
                                onChange={(e) => setSelectedEventId(e.target.value)}
                            >
                                {events.map(e => (
                                    <option key={e.id} value={e.id}>
                                        {format(new Date(e.date), 'dd MMM')} - {e.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {selectedEvent && (
                            <div className="bg-white p-4 rounded-xl flex flex-col items-center justify-center text-center shadow-lg">
                                <QRCodeSVG value={qrValue} size={200} level="H" />
                                <p className="mt-4 text-black font-bold text-sm uppercase tracking-wider">
                                    Display to Runners
                                </p>
                                <p className="text-xs text-gray-500 font-medium mt-1">
                                    Scan to Check-in
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Right: Live Attendance List */}
                    <div className="md:col-span-2 bg-surface-card rounded-xl border border-border flex flex-col overflow-hidden max-h-[500px]">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-surface-card sticky top-0 z-10">
                            <h3 className="font-bold text-text-primary flex items-center gap-2">
                                <Users className="w-4 h-4 text-primary" />
                                Live Attendance ({checkins.length})
                            </h3>
                            <button
                                onClick={() => selectedEventId && fetchCheckins(selectedEventId)}
                                className={`p-2 rounded-lg hover:bg-white/5 transition-colors ${refreshing ? 'animate-spin' : ''}`}
                            >
                                <RefreshCw className="w-4 h-4 text-text-muted" />
                            </button>
                            <button
                                onClick={downloadCSV}
                                disabled={checkins.length === 0}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-30"
                                title="Download Attendee List (CSV)"
                            >
                                <Download className="w-4 h-4 text-text-muted" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2 space-y-2">
                            {checkins.length === 0 ? (
                                <div className="text-center py-12 text-text-muted text-sm">
                                    No check-ins yet for this event.
                                </div>
                            ) : (
                                checkins.map((checkin) => (
                                    <div key={checkin.id} className="p-3 bg-surface rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-8 h-8 rounded-full bg-charcoal flex items-center justify-center text-xs font-bold text-primary border border-border overflow-hidden">
                                            {checkin.user?.avatar_url ? (
                                                <img src={checkin.user.avatar_url} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                checkin.user?.nickname?.substring(0, 2).toUpperCase() || '??'
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start">
                                                <span className="font-bold text-text-primary text-sm">
                                                    {checkin.user?.nickname || 'Unknown Runner'}
                                                </span>
                                                <span className="text-[10px] font-mono text-text-muted">
                                                    {format(new Date(checkin.created_at), 'HH:mm:ss')}
                                                </span>
                                            </div>
                                            <div className="text-[10px] text-text-muted">
                                                {checkin.user?.handle || 'No Handle'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
