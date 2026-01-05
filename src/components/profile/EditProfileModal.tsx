import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { X, User, Phone, Loader2, Camera, AtSign } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const editProfileSchema = z.object({
    nickname: z.string().min(1, 'Nama kena ada la bro'),
    phone: z.string().min(10, 'No phone pendek sangat tu.').optional().or(z.literal('')),
    // Handle is read-only usually, or editable? Let's generic it.
});

type EditProfileFormValues = z.infer<typeof editProfileSchema>;

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
    const { profile, updateProfile, refreshProfile } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Preview state
    const [previewUrl, setPreviewUrl] = useState<string | null>(profile?.avatar_url || null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, formState: { errors } } = useForm<EditProfileFormValues>({
        resolver: zodResolver(editProfileSchema),
        defaultValues: {
            nickname: profile?.nickname || '',
            phone: profile?.phone || '',
        }
    });

    if (!isOpen || !profile) return null;

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return;
        }

        const file = e.target.files[0];
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${profile.id}/${fileName}`;

        setUploading(true);
        setSubmitError(null);

        try {
            // Upload to Supabase Storage
            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, file, {
                    upsert: true
                });

            if (uploadError) {
                console.error('Upload error:', uploadError);
                throw uploadError;
            }

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('avatars')
                .getPublicUrl(filePath);

            setPreviewUrl(publicUrl);

            // Update Profile immediately with new avatar
            const { error: updateError } = await updateProfile({
                handle: profile?.handle || '', // Handle required by type but won't be changed if using existing
                nickname: profile?.nickname || '', // same
                userId: profile.id,
                avatar_url: publicUrl
            });

            if (updateError) throw updateError;

        } catch (error: any) {
            console.error('Error uploading avatar:', error);
            setSubmitError('Gagal upload gambar. Try again or file size besar sangat kot?');
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: EditProfileFormValues) => {
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            const { error } = await updateProfile({
                handle: profile.handle, // Read-only, passthrough
                nickname: data.nickname,
                phone: data.phone,
                userId: profile.id,
                avatar_url: previewUrl || profile.avatar_url || undefined // Keep existing if not changed
            });

            if (error) throw error;

            await refreshProfile();
            onClose();
        } catch (error) {
            console.error('Error updating profile:', error);
            const message = error instanceof Error ? error.message : 'Error update profile. Try again.';
            setSubmitError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#1B1B1D] w-full max-w-sm rounded-2xl border border-gray-800 shadow-2xl overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[85dvh] flex flex-col">

                {/* Header */}
                <div className="px-6 pt-6 pb-2 flex justify-between items-center shrink-0 bg-[#1B1B1D] z-10">
                    <h2 className="text-xl font-bold text-white tracking-tight">Edit Profile</h2>
                    <button onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 min-h-0 p-6 pt-2 space-y-6 overscroll-contain">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Avatar Selection */}
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                <div className="w-24 h-24 rounded-full bg-charcoal border-2 border-border overflow-hidden flex items-center justify-center relative">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 text-text-muted" />
                                    )}

                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Camera className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                                {uploading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full">
                                        <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                    </div>
                                )}
                            </div>
                            <p className="text-xs text-text-muted">Tap to change</p>
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                        </div>

                        {submitError && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
                                <p className="text-red-400 text-xs font-medium">{submitError}</p>
                            </div>
                        )}

                        <div className="space-y-4">
                            {/* Username (Read Only) */}
                            <div className="space-y-1.5 opacity-60">
                                <label className="text-xs font-semibold text-text-muted">USERNAME (Takleh tukar)</label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        value={profile.handle || ''}
                                        readOnly
                                        className="input-field pl-10 w-full bg-charcoal border border-border rounded-xl py-2.5 text-text-muted focus:outline-none cursor-not-allowed lowercase"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted">NAMA PANGGILAN</label>
                                <div className="relative">
                                    <User className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        {...register('nickname')}
                                        autoComplete="off"
                                        placeholder="Nickname"
                                        className="input-field pl-10 w-full bg-charcoal border border-border rounded-xl py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted/50 capitalize"
                                    />
                                </div>
                                {errors.nickname && <p className="text-ember text-xs">{errors.nickname.message}</p>}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-text-muted">NO PHONE</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-text-muted" />
                                    <input
                                        {...register('phone')}
                                        type="tel"
                                        placeholder="0123456789"
                                        className="input-field pl-10 w-full bg-charcoal border border-border rounded-xl py-2.5 text-text-primary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary placeholder:text-text-muted/50"
                                    />
                                </div>
                                {errors.phone && <p className="text-ember text-xs">{errors.phone.message}</p>}
                            </div>
                        </div>

                        <div className="pt-2 pb-4">
                            <button
                                type="submit"
                                disabled={isSubmitting || uploading}
                                className="w-full bg-[#FFF201] text-black font-bold py-3 px-4 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed glow-primary"
                            >
                                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Profile'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
