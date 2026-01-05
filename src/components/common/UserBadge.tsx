
import { ShieldCheck, Wind, HeartPulse, ShieldAlert, Crown } from 'lucide-react';
import clsx from 'clsx';

export type BadgeType = 'verified' | 'pacer' | 'medic' | 'trusted' | 'admin';

interface UserBadgeProps {
    badge: string;
    className?: string;
}

export default function UserBadge({ badge, className }: UserBadgeProps) {
    const getBadgeConfig = (type: string) => {
        switch (type.toLowerCase()) {
            case 'verified':
                return {
                    icon: <ShieldCheck className="w-3 h-3" />,
                    label: 'Vetted',
                    classes: 'bg-green-500/10 text-green-500 border-green-500/20'
                };
            case 'pacer':
                return {
                    icon: <Wind className="w-3 h-3" />,
                    label: 'Pacer',
                    classes: 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                };
            case 'medic':
                return {
                    icon: <HeartPulse className="w-3 h-3" />,
                    label: 'Medic',
                    classes: 'bg-red-500/10 text-red-500 border-red-500/20'
                };
            case 'admin':
                return {
                    icon: <Crown className="w-3 h-3" />,
                    label: 'Admin HQ',
                    classes: 'bg-primary/10 text-primary border-primary/20'
                };
            case 'trusted':
                return {
                    icon: <ShieldAlert className="w-3 h-3" />,
                    label: 'Trusted',
                    classes: 'bg-purple-500/10 text-purple-500 border-purple-500/20'
                };
            case 'otai':
                return {
                    icon: <ShieldCheck className="w-3 h-3" />,
                    label: 'Otai Merayap',
                    classes: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                };
            case 'supporter':
                return {
                    icon: <HeartPulse className="w-3 h-3" />,
                    label: 'Support Geng',
                    classes: 'bg-ember/10 text-ember border-ember/20'
                };
            case 'champion':
                return {
                    icon: <Crown className="w-3 h-3" />,
                    label: 'Champ',
                    classes: 'bg-primary/20 text-primary border-primary/30 shadow-[0_0_10px_rgba(255,231,107,0.2)]'
                };
            default:
                return null;
        }
    };

    const config = getBadgeConfig(badge);
    if (!config) return null;

    return (
        <span className={clsx(
            "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase border",
            config.classes,
            className
        )}>
            {config.icon}
            {config.label}
        </span>
    );
}
