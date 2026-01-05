import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../types/supabase';
import { Loader2, Plus, Calendar, Edit2, Trash2, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import PollManager from '../../components/admin/PollManager';
import CheckinManager from '../../components/admin/CheckinManager';
import PotluckManager from '../../components/admin/PotluckManager';
import UserManager from '../../components/admin/UserManager';
import RouteManager from '../../components/admin/RouteManager';
import AnnouncementManager from '../../components/admin/AnnouncementManager';
import SponsorManager from '../../components/admin/SponsorManager';
import AdminSidebar, { type AdminTab } from '../../components/admin/AdminSidebar';
import clsx from 'clsx';

type Event = Database['public']['Tables']['kb_events']['Row'];

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<AdminTab>('events');
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (activeTab === 'events') {
            fetchEvents();
        }
    }, [activeTab]);

    async function fetchEvents() {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('kb_events')
                .select('*')
                .order('date', { ascending: false });

            if (error) throw error;
            setEvents(data || []);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;

        try {
            const { error } = await supabase
                .from('kb_events')
                .delete()
                .eq('id', id);

            if (error) throw error;
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event');
        }
    };

    return (
        <div className="flex min-h-screen bg-background pb-20 lg:pb-0">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] lg:hidden animate-in fade-in duration-300"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <AdminSidebar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                onClose={() => setIsSidebarOpen(false)}
                className={clsx(
                    "fixed inset-y-0 left-0 z-[70] w-64 lg:relative lg:translate-x-0 transition-transform duration-300",
                    isSidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            />

            {/* Main Content */}
            <main className="flex-1 min-w-0 overflow-y-auto">
                {/* Mobile Header */}
                <header className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-surface sticky top-0 z-50">
                    <div className="flex items-center gap-2">
                        <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-surface-card rounded-lg border border-border">
                            <Menu className="w-5 h-5 text-primary" />
                        </button>
                        <h1 className="font-display text-lg tracking-tight uppercase">Admin</h1>
                    </div>
                </header>

                <div className="p-4 lg:p-10 max-w-6xl mx-auto">
                    <header className="mb-8 hidden lg:block">
                        <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
                        <p className="text-text-muted mt-1">Manage your community and events</p>
                    </header>

                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {activeTab === 'events' && (
                            <>
                                <div className="flex justify-between items-center mb-6">
                                    <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-primary" />
                                        Manage Events
                                    </h2>
                                    <button
                                        onClick={() => navigate('/admin/events/new')}
                                        className="bg-primary text-charcoal font-bold text-sm px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-primary-hover transition-all active:scale-95 shadow-lg shadow-primary/10"
                                    >
                                        <Plus className="w-4 h-4" />
                                        New Event
                                    </button>
                                </div>

                                <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-xl shadow-black/5">
                                    {loading ? (
                                        <div className="flex justify-center py-12">
                                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        </div>
                                    ) : events.length === 0 ? (
                                        <div className="text-center py-12 text-text-muted">
                                            No events found. Create your first one!
                                        </div>
                                    ) : (
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left text-sm">
                                                <thead>
                                                    <tr className="border-b border-border bg-surface-card/50 text-text-muted uppercase text-[10px] font-bold tracking-widest">
                                                        <th className="py-4 px-6">Date</th>
                                                        <th className="py-4 px-6">Title</th>
                                                        <th className="py-4 px-6">Location</th>
                                                        <th className="py-4 px-6 text-right">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-border">
                                                    {events.map((event) => (
                                                        <tr key={event.id} className="hover:bg-surface-card transition-colors group">
                                                            <td className="py-4 px-6 text-text-primary font-medium">
                                                                {format(new Date(event.date), 'dd MMM yyyy')}
                                                            </td>
                                                            <td className="py-4 px-6">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="text-text-primary font-bold">{event.title}</span>
                                                                    {event.is_cancelled && (
                                                                        <span className="text-[10px] font-display bg-red-500/10 text-red-500 px-1.5 py-0.5 rounded border border-red-500/20">CANCELLED</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="py-4 px-6 text-text-muted">
                                                                {event.location_name}
                                                            </td>
                                                            <td className="py-4 px-6 text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button
                                                                        onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                                                                        className="p-2 text-text-muted hover:text-primary hover:bg-surface-card rounded-lg border border-transparent hover:border-border transition-all"
                                                                        title="Edit"
                                                                    >
                                                                        <Edit2 className="w-4 h-4" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => handleDelete(event.id)}
                                                                        className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg border border-transparent hover:border-red-500/20 transition-all"
                                                                        title="Delete"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {activeTab === 'polls' && <PollManager />}
                        {activeTab === 'potluck' && <PotluckManager />}
                        {activeTab === 'checkins' && <CheckinManager />}
                        {activeTab === 'users' && <UserManager />}
                        {activeTab === 'routes' && <RouteManager />}
                        {activeTab === 'announcements' && <AnnouncementManager />}
                        {activeTab === 'sponsors' && <SponsorManager />}
                    </div>
                </div>
            </main>
        </div>
    );
}
