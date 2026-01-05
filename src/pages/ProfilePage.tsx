import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { User, Shield, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import RequireProfile from '../components/auth/RequireProfile';
import EditProfileModal from '../components/profile/EditProfileModal';
import UserBadge from '../components/common/UserBadge';
import PushNotificationManager from '../components/ui/PushNotificationManager';

export default function ProfilePage() {
    const { profile, loading } = useAuth();
    const navigate = useNavigate();
    const [showEditModal, setShowEditModal] = useState(false);
    const [tapCount, setTapCount] = useState(0);

    const handleLogoClick = () => {
        setTapCount(prev => {
            const next = prev + 1;
            if (next >= 5) {
                // Visual feedback
                const logo = document.getElementById('branding-logo');
                if (logo) {
                    logo.classList.add('scale-150', 'rotate-[360deg]', 'opacity-0');
                    setTimeout(() => {
                        navigate('/admin');
                        setTapCount(0);
                    }, 500);
                } else {
                    navigate('/admin');
                    return 0;
                }
            }
            return next;
        });
    };

    // Reset tap count after 2 seconds of inactivity
    useEffect(() => {
        if (tapCount > 0) {
            const timer = setTimeout(() => {
                setTapCount(0);
            }, 2000);
            return () => clearTimeout(timer);
        }
    }, [tapCount]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        window.location.reload();
    };

    if (loading) return <div className="p-4 pt-10 text-text-muted">Tunggu jap...</div>;

    return (
        <div className="p-4 pt-10 pb-24 space-y-6">
            <div className="flex flex-col items-center justify-center py-4 mb-2">
                <div
                    id="branding-logo"
                    onClick={handleLogoClick}
                    className="w-20 h-20 bg-charcoal-light rounded-3xl flex items-center justify-center border border-border cursor-pointer active:scale-95 transition-all duration-500 overflow-hidden shadow-2xl"
                >
                    <img src="/logo.png" alt="Merayap Malam Logo" className="w-full h-full object-contain p-2" />
                </div>
                <h1 className="mt-3 text-sm font-black text-text-muted uppercase tracking-[0.2em]">Merayap Malam</h1>
            </div>

            <h1 className="text-2xl font-bold text-primary">Profile Saya</h1>

            {profile ? (
                <div className="bg-surface rounded-xl p-6 border border-border shadow-lg space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-charcoal-light rounded-full flex items-center justify-center border border-border overflow-hidden">
                            {profile.avatar_url ? (
                                <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                <User className="w-8 h-8 text-primary" />
                            )}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-text-primary capitalize flex items-center gap-2">
                                {profile.nickname}
                                {profile.role === 'admin' && <UserBadge badge="admin" />}
                            </h2>
                            <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-text-muted text-sm mr-2">@{profile.handle}</span>
                                {profile.badges?.map((b: string) => (
                                    <UserBadge key={b} badge={b as any} />
                                ))}
                            </div>
                        </div>
                        <button
                            onClick={() => setShowEditModal(true)}
                            className="text-xs bg-charcoal hover:bg-white/10 text-white px-3 py-1.5 rounded-lg border border-border transition-colors font-medium"
                        >
                            Edit
                        </button>
                    </div>

                    {(profile.role === 'admin' || (profile.badges && profile.badges.length > 0)) && (
                        <div className="flex flex-wrap gap-2 py-2 border-y border-border/50">
                            {profile.role === 'admin' && (
                                <span className="bg-primary/10 text-primary px-2 py-1 rounded text-[10px] font-black uppercase border border-primary/20 flex items-center gap-1">
                                    <Shield className="w-3 h-3" />
                                    HQ Verified
                                </span>
                            )}
                            {profile.badges?.map((b: string) => (
                                <UserBadge key={b} badge={b as any} className="!text-[10px]" />
                            ))}
                        </div>
                    )}

                    {profile.role === 'admin' && (
                        <a
                            href="/admin"
                            className="block w-full text-center bg-charcoal-light border border-dashed border-border text-text-muted hover:text-primary hover:border-primary p-3 rounded-xl transition-all"
                        >
                            Masuk Admin Dashboard
                        </a>
                    )}

                    <button
                        onClick={handleLogout}
                        className="w-full mt-4 flex items-center justify-center gap-2 text-ember hover:bg-ember/10 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut className="w-4 h-4" />
                        Gerak Dulu
                    </button>

                    <EditProfileModal
                        isOpen={showEditModal}
                        onClose={() => setShowEditModal(false)}
                    />
                    <PushNotificationManager />
                </div>
            ) : (
                <div className="bg-surface rounded-xl p-6 border border-border text-center space-y-4">
                    <div className="w-16 h-16 bg-charcoal-light rounded-full flex items-center justify-center border border-border mx-auto">
                        <User className="w-8 h-8 text-text-muted" />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-text-primary">Belum Join Lagi</h2>
                        <p className="text-text-muted text-sm">Join geng kitorang untuk RSVP event & track run.</p>
                    </div>

                    <RequireProfile>
                        <div className="w-full bg-primary hover:bg-primary-hover text-charcoal font-bold py-3 px-6 rounded-xl transition-colors glow-primary text-center">
                            Buat Profile & Join
                        </div>
                    </RequireProfile>

                    <RequireProfile initialMode="login">
                        <div className="w-full text-text-muted hover:text-text-primary text-sm font-medium py-2 transition-colors text-center cursor-pointer">
                            Dah ada akaun? Login Sini
                        </div>
                    </RequireProfile>
                </div>
            )}
        </div>
    );
}
