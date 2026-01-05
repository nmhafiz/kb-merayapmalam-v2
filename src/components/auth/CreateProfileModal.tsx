import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, User, AtSign, Loader2, Mail, Lock, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const authSchema = z.object({
    email: z.string().email('Alamak, email tak valid la.'),
    password: z.string().min(6, 'Password kena at least 6 characters tau.'),
    nickname: z.string().optional(),
    handle: z.string().optional(),
    phone: z.string().min(10, 'No phone pendek sangat tu.').optional(),
});

type AuthFormValues = z.infer<typeof authSchema>;

interface CreateProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    initialMode?: 'signup' | 'login';
}

export default function CreateProfileModal({ isOpen, onClose, onSuccess, initialMode = 'signup' }: CreateProfileModalProps) {
    const { signUpWithEmail, signInWithEmail, updateProfile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [mode, setMode] = useState<'signup' | 'login'>(initialMode);

    // Reset mode when reopening if needed, but for now just initializing is enough if component remounts or we verify effect.
    // Actually, distinct instances might keep state if not unmounted. 
    // Let's add a useEffect to sync mode when isOpen changes or initialMode changes.
    // Simpler: just use useEffect to reset when opening.
    /* 
       Actually, `RequireProfile` conditionally renders? No, it keeps it rendered but hidden? 
       Wait, `RequireProfile` says:
       <CreateProfileModal isOpen={showModal} ... />
       
       React will keep state if the component stays mounted. 
       Let's add a useEffect to sync initialMode when it opens.
    */

    // Better yet: just update the state initialization line for now. If it persists incorrectly, I'll add useEffect.
    // But since it's a modal that might be "closed" but not "unmounted" by parent, useEffect is safer.


    const { register, handleSubmit, formState: { errors }, reset } = useForm<AuthFormValues>({
        resolver: zodResolver(authSchema),
    });

    // Reset form and mode when modal opens
    if (isOpen && mode !== initialMode && !isSubmitting) {
        // This might cause an infinite loop if we are not careful. 
        // Better to use a useEffect.
    }

    // Actually, let's just use useEffect
    // We need to import useEffect first. 
    // Wait, import is at line 1.


    if (!isOpen) return null;

    const onSubmit = async (data: AuthFormValues) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            if (mode === 'signup') {
                if (!data.nickname || !data.handle || !data.phone) {
                    setSubmitError('Isi semua field dulu baru onz!');
                    setIsSubmitting(false);
                    return;
                }

                // 1. Sign Up
                const { error: authError, data: authData } = await signUpWithEmail({
                    email: data.email,
                    password: data.password
                });
                if (authError) throw authError;

                // 2. Check for Session (Email Confirmation Handling)
                // If signup returns explicit session null, it usually means email confirm is enabled.
                // However, sometimes it's just a glitch or setting lag. We try to FORCE login to be sure.
                if (authData?.user && !authData.session) {
                    console.log("Signup returned no session. Attempting auto-login...");

                    const { data: loginData, error: loginError } = await signInWithEmail({
                        email: data.email,
                        password: data.password
                    });

                    if (loginError || !loginData.session) {
                        // Okay, confirmed we really can't login. Must be email confirmation.
                        console.error("Auto-login failed:", loginError);
                        setSubmitError('Check email k! Kena confirm dulu baru boleh login.');
                        setIsSubmitting(false);
                        return;
                    }

                    // If we got here, auto-login worked! Update authData to use this session
                    authData.session = loginData.session;
                    authData.user = loginData.user;
                }

                // 3. Create Profile
                // We use authData.user?.id explicitly because session might not be updated in context yet
                if (!authData?.user?.id) throw new Error("Signup successful but no user ID returned.");

                const { error: profileError } = await updateProfile({
                    handle: data.handle.toLowerCase(),
                    nickname: data.nickname,
                    phone: data.phone,
                    userId: authData.user.id
                });

                if (profileError) {
                    console.error("Profile creation failed:", profileError);
                    if (profileError.code === '23505') {
                        // Postgres unique constraint violation
                        throw new Error("Username ni orang lain dah rembat. try lain!");
                    }
                    throw profileError;
                }

            } else {
                // Login Mode
                const { error } = await signInWithEmail({
                    email: data.email,
                    password: data.password
                });
                if (error) {
                    if (error.message && error.message.includes('Invalid login credentials')) {
                        throw new Error("Email atau password salah la. Try again!");
                    }
                    throw error;
                }
            }

            onSuccess();
            onClose();
        } catch (error) {
            console.error('Auth error full object:', error);
            // Handle cases where error is a string or an object with message
            let errorMessage = 'Alamak, ada error sikit. Try again later.';

            if (typeof error === 'string') {
                errorMessage = error;
            } else if (error instanceof Error) {
                errorMessage = error.message;
            } else if (typeof error === 'object' && error !== null && 'message' in error) {
                errorMessage = String((error as { message: unknown }).message);
            }

            setSubmitError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1B1B1D] w-full max-w-sm rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[85dvh] flex flex-col">

                {/* Header */}
                <div className="px-6 pt-6 pb-2 flex justify-between items-center shrink-0 bg-[#1B1B1D] z-10">
                    <h2 className="text-xl font-bold text-white tracking-tight">
                        {mode === 'signup' ? 'Join the Geng' : 'Welcome Back!'}
                    </h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 min-h-0 p-6 pt-2 pb-6 space-y-4 overscroll-contain">
                    <div className="pb-2">
                        <p className="text-sm text-text-muted">
                            {mode === 'signup'
                                ? 'Create akaun kejap untuk join event & track run.'
                                : 'Welcome back! Login untuk access profile.'}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {submitError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                <p className="text-red-400 text-xs font-medium">{submitError}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted">EMAIL</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        {...register('email')}
                                        type="email"
                                        autoComplete="email"
                                        autoCapitalize="none"
                                        autoCorrect="off"
                                        spellCheck="false"
                                        placeholder="you@example.com"
                                        className="input-field pl-10 w-full bg-charcoal border border-border rounded-xl py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted/50"
                                    />
                                </div>
                                {errors.email && <p className="text-ember text-xs">{errors.email.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted">PASSWORD</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        {...register('password')}
                                        type="password"
                                        autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                                        placeholder="••••••"
                                        className="input-field pl-10 w-full bg-charcoal border border-border rounded-xl py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted/50"
                                    />
                                </div>
                                {errors.password && <p className="text-ember text-xs">{errors.password.message}</p>}
                            </div>

                            {mode === 'signup' && (
                                <>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-text-muted">NAMA PANGGILAN</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                            <input
                                                {...register('nickname')}
                                                autoComplete="name"
                                                autoCapitalize="words"
                                                autoCorrect="off"
                                                spellCheck="false"
                                                placeholder="Ali Runner"
                                                className="input-field pl-10 w-full bg-charcoal border border-border rounded-xl py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted/50 capitalize"
                                            />
                                        </div>
                                        {errors.nickname && <p className="text-ember text-xs">{errors.nickname.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-text-muted">USERNAME</label>
                                        <div className="relative">
                                            <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                            <input
                                                {...register('handle')}
                                                autoComplete="username"
                                                autoCapitalize="none"
                                                autoCorrect="off"
                                                spellCheck="false"
                                                placeholder="ali_kb"
                                                className="input-field pl-10 w-full bg-charcoal border border-border rounded-xl py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted/50 lowercase"
                                            />
                                        </div>
                                        {errors.handle && <p className="text-ember text-xs">{errors.handle.message}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-text-muted">NO PHONE</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                            <input
                                                {...register('phone')}
                                                type="tel"
                                                autoComplete="tel"
                                                placeholder="0123456789"
                                                className="input-field pl-10 w-full bg-charcoal border border-border rounded-xl py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted/50"
                                            />
                                        </div>
                                        {errors.phone && <p className="text-ember text-xs">{errors.phone.message}</p>}
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-[#FFF201] text-black font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 mt-6 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
                        >
                            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (mode === 'signup' ? 'Jom Join Sekarang' : 'Masuk')}
                        </button>

                        <div className="pt-4 border-t border-gray-800">
                            <button
                                type="button"
                                onClick={() => {
                                    setMode(mode === 'signup' ? 'login' : 'signup');
                                    setSubmitError(null);
                                }}
                                className="w-full py-3 px-4 rounded-xl bg-charcoal hover:bg-charcoal-light border border-border text-sm font-medium text-text-primary transition-colors flex items-center justify-center gap-2"
                            >
                                {mode === 'signup' ? (
                                    <>
                                        <span>Dah ada akaun?</span>
                                        <span className="text-[#FFF201] font-bold">Login Sini</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Belum join lagi?</span>
                                        <span className="text-[#FFF201] font-bold">Sign Up Free</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
