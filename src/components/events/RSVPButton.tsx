import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { Check } from 'lucide-react';
import type { Database } from '../../types/supabase';
import { clsx } from 'clsx';

type RSVPStatus = 'going' | 'maybe' | 'not_going';

interface RSVPButtonProps {
    eventId: string;
    currentStatus?: RSVPStatus | null;
    onStatusChange?: (newStatus: RSVPStatus) => void;
}

export default function RSVPButton({ eventId, currentStatus, onStatusChange }: RSVPButtonProps) {
    const { session, profile } = useAuth();
    const [status, setStatus] = useState<RSVPStatus | null>(currentStatus || null);

    useEffect(() => {
        if (currentStatus !== undefined) {
            setStatus(currentStatus);
        }
    }, [currentStatus]);

    const handleRSVP = async (newStatus: RSVPStatus) => {
        if (!session || !profile) return; // Should be handled by RequireProfile wrapper logic if used externally, but safety check here.

        // Optimistic update
        const previousStatus = status;
        setStatus(newStatus);

        // Notify parent immediately for UI responsiveness
        if (onStatusChange) onStatusChange(newStatus);

        // Notify parent immediately for UI responsiveness
        if (onStatusChange) onStatusChange(newStatus);

        try {
            const { error } = await supabase
                .from('kb_event_rsvps')
                .upsert({
                    event_id: eventId,
                    user_id: session.user.id,
                    status: newStatus
                } as Database['public']['Tables']['kb_event_rsvps']['Insert'], { onConflict: 'event_id, user_id' });

            if (error) throw error;
            console.log('RSVP success:', newStatus);

        } catch (error) {
            console.error('Error updating RSVP detailed:', error);
            const errorMessage = error instanceof Error ? error.message : JSON.stringify(error);
            alert(`RSVP Failed: ${errorMessage}`);
            // Revert on error
            setStatus(previousStatus);
            if (onStatusChange && previousStatus) onStatusChange(previousStatus);
        }
    };





    return (
        <div className="flex gap-2">
            <button
                onClick={() => handleRSVP('going')}
                className={clsx(
                    "flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-medium text-sm transition-colors",
                    status === 'going'
                        ? "bg-primary text-charcoal"
                        : "bg-surface-card border border-border text-text-muted hover:border-primary/50 hover:text-primary"
                )}
            >
                {status === 'going' && <Check className="w-4 h-4" />}
                {status === 'going' ? 'Onz' : "Let's gooooo!"}
            </button>

            <button
                onClick={() => handleRSVP('maybe')}
                className={clsx(
                    "px-3 py-2 rounded-lg font-medium text-sm transition-colors border border-border",
                    status === 'maybe'
                        ? "text-text-primary bg-surface-card border-text-muted"
                        : "text-text-muted hover:text-text-primary hover:bg-surface-card"
                )}
            >
                Fikir Jap
            </button>
        </div>
    );
}
