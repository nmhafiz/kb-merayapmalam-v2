import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export default function RequireAdmin({ children }: { children: ReactNode }) {
    const { session, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    // Must be logged in AND have 'admin' role
    if (!session || !profile || profile.role !== 'admin') {
        // Ideally show a "Access Denied" page or redirect home
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
