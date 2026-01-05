import { useState } from 'react';
import RSVPButton from '../events/RSVPButton';
import { clsx } from 'clsx';
import { MapPin, Calendar, Users, Clock, CalendarPlus } from 'lucide-react';

interface EventCardProps {
    id: string;
    title: string;
    date: string;
    time: string;
    location: string;
    attendees: number;
    highlight?: boolean;
    isCancelled?: boolean;
    userStatus?: 'going' | 'maybe' | 'not_going' | null;
}

export default function EventCard({ id, title, date, time, location, attendees, highlight = false, isCancelled = false, userStatus }: EventCardProps) {
    const [currentAttendees, setCurrentAttendees] = useState(attendees);
    const [currentStatus, setCurrentStatus] = useState(userStatus);

    const handleStatusChange = (newStatus: 'going' | 'maybe' | 'not_going') => {
        // Update attendee count optimistically
        if (newStatus === 'going' && currentStatus !== 'going') {
            setCurrentAttendees(prev => prev + 1);
        } else if (newStatus !== 'going' && currentStatus === 'going') {
            setCurrentAttendees(prev => Math.max(0, prev - 1));
        }
        setCurrentStatus(newStatus);
    };

    const addToCalendar = () => {

        // Fallback for demo: use current date parts if parsing fails
        const eventDate = new Date(date);
        if (isNaN(eventDate.getTime())) return;


        const titleEscaped = encodeURIComponent(title);
        const locationEscaped = encodeURIComponent(location);

        // Simple Google Calendar Link
        const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${titleEscaped}&location=${locationEscaped}&details=Merayap+Malam+Run&dates=${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${eventDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`;

        window.open(gCalUrl, '_blank');
    };

    return (
        <div className={`rounded-xl p-5 border shadow-lg transition-transform active:scale-[0.98] ${highlight
            ? 'bg-[#1F1F22] border-primary/30 shadow-primary/5'
            : 'bg-surface border-border shadow-black/20'
            }`}>
            <div className="flex justify-between items-start mb-3">
                {highlight && !isCancelled && (
                    <span className="bg-primary text-charcoal text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">
                        Next Run
                    </span>
                )}
                {isCancelled && (
                    <span className="bg-red-500/20 text-red-500 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide border border-red-500/50">
                        Cancel
                    </span>
                )}
                {!highlight && <span />} {/* Spacer */}
                <span className="flex items-center text-text-muted text-xs gap-1">
                    <Users className="w-3 h-3" />
                    {currentAttendees} onz
                </span>
            </div>

            <h3 className={clsx("text-xl font-bold mb-2 leading-tight", isCancelled ? "text-text-muted line-through" : "text-text-primary")}>{title}</h3>

            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-text-muted text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>{date}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted text-sm">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>{time}</span>
                </div>
                <div className="flex items-center gap-2 text-text-muted text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="truncate">{location}</span>
                </div>
            </div>

            {!isCancelled && (
                <div className="mt-4 flex gap-2">
                    <div className="flex-1">
                        <RSVPButton eventId={id} currentStatus={currentStatus} onStatusChange={handleStatusChange} />
                    </div>
                    <button
                        onClick={addToCalendar}
                        className="p-3 rounded-lg bg-surface-card border border-border text-text-muted hover:text-primary hover:border-primary transition-all active:scale-95"
                        title="Add to Calendar"
                    >
                        <CalendarPlus className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
