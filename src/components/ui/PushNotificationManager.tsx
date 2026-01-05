import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Bell, BellOff, Loader2, Info } from 'lucide-react';
import clsx from 'clsx';
import type { Json } from '../../types/supabase';

export default function PushNotificationManager() {
    const [permission, setPermission] = useState<NotificationPermission>('default');
    const [loading, setLoading] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        if ('Notification' in window) {
            setPermission(Notification.permission);
            checkSubscription();
        }
    }, []);

    const checkSubscription = async () => {
        if (!('serviceWorker' in navigator)) return;

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
    };

    const subscribe = async () => {
        setLoading(true);
        try {
            const permission = await Notification.requestPermission();
            setPermission(permission);

            if (permission !== 'granted') return;

            const registration = await navigator.serviceWorker.ready;

            // Note: In a real app, you'd get this from your env/server
            // This is a placeholder VAPID public key
            const vapidPublicKey = 'BEl62fvRjXmc9H_R_9Y_D1Id8S998_p208B_S001_A';

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidPublicKey
            });

            // Store in Supabase
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { error } = await supabase
                    .from('kb_push_subscriptions')
                    .upsert({
                        user_id: user.id,
                        subscription_json: subscription.toJSON() as Json,
                        updated_at: new Date().toISOString()
                    });

                if (error) throw error;
            }

            setIsSubscribed(true);
        } catch (error) {
            console.error('Push subscription failed:', error);
            alert('Push subscription failed. Ensure you have a valid VAPID key and Service Worker is running.');
        } finally {
            setLoading(false);
        }
    };

    if (!('Notification' in window)) return null;

    return (
        <div className="p-4 bg-surface border border-border rounded-2xl shadow-sm mb-6">
            <div className="flex items-start gap-4">
                <div className={clsx(
                    "p-3 rounded-xl",
                    isSubscribed ? "bg-green-500/10 text-green-500" : "bg-primary/10 text-primary"
                )}>
                    {isSubscribed ? <Bell className="w-6 h-6" /> : <BellOff className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-text-primary mb-1">
                        {isSubscribed ? 'Notifications Active' : 'Enable Push Notifications'}
                    </h3>
                    <p className="text-sm text-text-muted leading-relaxed mb-3">
                        {isSubscribed
                            ? "You'll get alerts for new runs, urgent announcements, and SOS calls."
                            : "Don't miss a run! Enable notifications to get live updates from the community."}
                    </p>

                    {!isSubscribed && (
                        <button
                            onClick={subscribe}
                            disabled={loading || permission === 'denied'}
                            className="w-full sm:w-auto bg-primary text-charcoal font-bold px-6 py-2 rounded-lg text-sm flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                            {permission === 'denied' ? 'Permission Denied' : 'Enable Now'}
                        </button>
                    )}

                    {permission === 'denied' && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-red-500">
                            <Info className="w-3 h-3" />
                            Please enable notifications in your browser settings.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

