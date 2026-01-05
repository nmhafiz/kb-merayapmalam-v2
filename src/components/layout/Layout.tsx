import { Outlet } from 'react-router-dom';
import BottomNav from './BottomNav';

export default function Layout() {
    return (
        <div className="min-h-screen bg-charcoal text-text-primary font-sans flex flex-col">
            <main className="flex-1 w-full max-w-md mx-auto relative pb-20">
                <Outlet />
            </main>
            <div className="max-w-md mx-auto w-full fixed bottom-0 left-0 right-0 z-50">
                <BottomNav />
            </div>
        </div>
    );
}
