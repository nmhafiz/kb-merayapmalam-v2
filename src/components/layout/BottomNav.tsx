import { Home, Calendar, Users, User, Map } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import clsx from 'clsx';

export default function BottomNav() {
    const navItems = [
        { name: 'Home', icon: Home, path: '/' },
        { name: 'Event', icon: Calendar, path: '/events' },
        { name: 'Feed', icon: Users, path: '/feed' },
        { name: 'Routes', icon: Map, path: '/routes' },
        { name: 'Profile', icon: User, path: '/profile' },
    ];

    return (
        <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-lg glass z-50 rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-around items-center h-16 px-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            clsx(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-all duration-300",
                                isActive
                                    ? "text-primary scale-110 drop-shadow-[0_0_8px_rgba(255,242,1,0.3)]"
                                    : "text-text-muted hover:text-text-primary hover:scale-105"
                            )
                        }
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={clsx("w-6 h-6 transition-transform", isActive ? "stroke-[2.5px]" : "stroke-[1.5px]")} />
                                <span className={clsx(
                                    "text-[10px] tracking-tight transition-all",
                                    isActive ? "font-bold opacity-100" : "font-medium opacity-70"
                                )}>
                                    {item.name}
                                </span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
