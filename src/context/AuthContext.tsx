import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, isMissingConfig } from '../lib/supabase';
import type { Session, AuthError, PostgrestError, AuthResponse } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

type Profile = Database['public']['Tables']['kb_profiles']['Row'];

interface AuthContextType {
    session: Session | null;
    profile: Profile | null;
    loading: boolean;
    signInWithEmail: (creds: { email: string; password: string }) => Promise<AuthResponse>;
    signUpWithEmail: (creds: { email: string; password: string }) => Promise<AuthResponse>;
    signOut: () => Promise<void>;
    updateProfile: (data: { handle: string; nickname: string; phone?: string; userId?: string; avatar_url?: string }) => Promise<{ error: PostgrestError | null }>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isMissingConfig || !supabase) {
            setLoading(false);
            return;
        }

        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) fetchProfile(session.user.id);
            else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    async function fetchProfile(userId: string) {
        if (!supabase) return;
        try {
            const { data, error } = await supabase
                .from('kb_profiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (!error && data) {
                setProfile(data);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    }

    async function signInWithEmail({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
        if (!supabase) return { error: { message: 'Supabase not configured' } as AuthError, data: { user: null, session: null } };
        return await supabase.auth.signInWithPassword({ email, password });
    }

    async function signUpWithEmail({ email, password }: { email: string; password: string }): Promise<AuthResponse> {
        if (!supabase) return { error: { message: 'Supabase not configured' } as AuthError, data: { user: null, session: null } };
        return await supabase.auth.signUp({ email, password });
    }

    async function signOut() {
        if (!supabase) return;
        await supabase.auth.signOut();
        setProfile(null);
        setSession(null);
    }

    async function updateProfile({ handle, nickname, phone, userId, avatar_url }: { handle: string; nickname: string; phone?: string; userId?: string; avatar_url?: string }) {
        const targetUserId = userId || session?.user?.id;

        if (!supabase || !targetUserId) return { error: { message: 'No user session' } as PostgrestError };

        const { error } = await supabase.from('kb_profiles').upsert({
            id: targetUserId,
            handle,
            nickname,
            phone,
            avatar_url
            // Removed role: 'member' to prevent downgrading admins on update
        });

        if (!error) {
            // Only fetch profile if we are updating the current user's profile
            if (targetUserId === session?.user?.id) {
                await fetchProfile(targetUserId);
            }
        }

        return { error };
    }

    async function refreshProfile() {
        if (session?.user) {
            await fetchProfile(session.user.id);
        }
    }

    if (isMissingConfig) {
        return (
            <div className="min-h-screen bg-[#1B1B1D] text-white flex flex-col items-center justify-center p-8 text-center font-sans">
                <h1 className="text-3xl font-bold text-[#FFF201] mb-6">Setup Required</h1>
                <p className="max-w-md text-gray-400 mb-8">
                    The app is running, but it's not connected to Supabase yet.
                </p>

                <div className="bg-[#2A2A2C] p-6 rounded-xl border border-gray-700 w-full max-w-lg text-left">
                    <h3 className="font-bold mb-4 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#FFF201] text-black flex items-center justify-center text-xs">1</span>
                        Connect Supabase
                    </h3>
                    <p className="text-sm text-gray-400 mb-4">
                        Open <code>.env</code> in your project folder and replace the placeholders:
                    </p>
                    <pre className="bg-black p-4 rounded text-xs overflow-x-auto text-green-400 font-mono">
                        VITE_SUPABASE_URL=...
                        VITE_SUPABASE_ANON_KEY=...
                    </pre>
                </div>

                <button
                    onClick={() => window.location.reload()}
                    className="mt-8 bg-[#FFF201] text-black font-bold py-3 px-8 rounded-xl hover:opacity-90 transition-opacity glow-primary"
                >
                    I've Updated .env
                </button>
            </div>
        )
    }

    return (
        <AuthContext.Provider value={{ session, profile, loading, signInWithEmail, signUpWithEmail, signOut, updateProfile, refreshProfile }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
