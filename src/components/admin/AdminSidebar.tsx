import {
    Calendar,
    BarChart3,
    Users,
    UserCheck,
    Map,
    Megaphone,
    ShieldCheck,
    Utensils,
    X,
    LayoutDashboard,
    type LucideIcon
} from 'lucide-react';
import clsx from 'clsx';

export type AdminTab = 'events' | 'polls' | 'checkins' | 'potluck' | 'users' | 'routes' | 'announcements' | 'sponsors';

interface AdminSidebarProps {
    activeTab: AdminTab;
    onTabChange: (tab: AdminTab) => void;
    onClose?: () => void;
    className?: string;
}

export default function AdminSidebar({ activeTab, onTabChange, onClose, className }: AdminSidebarProps) {
    const navItems: { name: string; id: AdminTab; icon: LucideIcon; beta?: boolean }[] = [
        { name: 'Events', id: 'events', icon: Calendar },
        { name: 'Polls', id: 'polls', icon: BarChart3 },
        { name: 'Potluck', id: 'potluck', icon: Utensils },
        { name: 'Check-ins', id: 'checkins', icon: UserCheck, beta: true },
        { name: 'Users', id: 'users', icon: Users },
        { name: 'Routes', id: 'routes', icon: Map },
        { name: 'Announcements', id: 'announcements', icon: Megaphone },
        { name: 'Sponsors', id: 'sponsors', icon: ShieldCheck },
    ];

    return (
        <aside className={clsx(
            "flex flex-col bg-surface border-r border-border h-full transition-all duration-300",
            className
        )}>
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-6 h-6 text-primary" />
                    <h2 className="font-display text-xl tracking-tight text-text-primary">Admin Control</h2>
                </div>
                {onClose && (
                    <button onClick={onClose} className="lg:hidden p-1 hover:bg-surface-card rounded-lg transition-colors">
                        <X className="w-5 h-5 text-text-muted" />
                    </button>
                )}
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1 custom-scrollbar">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => {
                            onTabChange(item.id);
                            onClose?.();
                        }}
                        className={clsx(
                            "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group relative",
                            activeTab === item.id
                                ? "bg-primary text-charcoal shadow-[0_4px_12px_rgba(255,242,1,0.2)]"
                                : "text-text-muted hover:text-text-primary hover:bg-surface-card"
                        )}
                    >
                        <item.icon className={clsx(
                            "w-5 h-5 transition-transform duration-200",
                            activeTab === item.id ? "scale-110" : "group-hover:scale-110"
                        )} />
                        <span className="flex-1 text-left">{item.name}</span>
                        {item.beta && (
                            <span className={clsx(
                                "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md",
                                activeTab === item.id ? "bg-charcoal/20 text-charcoal/80" : "bg-primary/10 text-primary"
                            )}>
                                Beta
                            </span>
                        )}
                        {activeTab === item.id && (
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-charcoal rounded-l-full" />
                        )}
                    </button>
                ))}
            </nav>

            <div className="p-4 border-t border-border">
                <div className="bg-surface-card rounded-xl p-4 border border-border/50">
                    <p className="text-[10px] uppercase font-bold text-text-muted mb-1 tracking-wider">System Status</p>
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium text-text-primary">All Systems Nominal</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
