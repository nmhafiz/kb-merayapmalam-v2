import { useState, type ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import CreateProfileModal from './CreateProfileModal';

interface RequireProfileProps {
    children: ReactNode;
    fallback?: ReactNode; // Optional custom fallback UI instead of just blocking
    initialMode?: 'signup' | 'login';
}

export default function RequireProfile({ children, initialMode = 'signup' }: RequireProfileProps) {
    const { profile, loading } = useAuth();
    const [showModal, setShowModal] = useState(false);

    // If executing children directly (e.g. as a route wrapper), we might want to block render.
    // But for "Action Gate" (click button -> show modal), we wrap the button with logic.
    // This component assumes it WRAPS the action content but intercepts usage? 
    // Actually, a better pattern for this specific "Guest browse, Member action" is a wrapper that 
    // overlays or intercepts interaction.

    // SIMPLER PATTERN:
    // Render children normally. But provide a Context or Hook to trigger the gate?
    // Let's stick to the "Action Guard" wrapper for specific buttons for now.

    if (loading) return null; // Or a spinner

    if (!profile) {
        return (
            <>
                <div onClickCapture={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setShowModal(true);
                }}>
                    {children}
                </div>
                <CreateProfileModal
                    isOpen={showModal}
                    onClose={() => setShowModal(false)}
                    onSuccess={() => setShowModal(false)}
                    initialMode={initialMode}
                />
            </>
        )
    }

    return <>{children}</>;
}
