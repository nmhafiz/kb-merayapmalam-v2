import { useState } from 'react';
import { AlertCircle, Phone, ShieldAlert } from 'lucide-react';
import clsx from 'clsx';

export default function SOSButton() {
    const [isOpen, setIsOpen] = useState(false);

    const emergencyContacts = [
        { name: 'Ambulans / Polis', number: '999' },
        { name: 'Lead Runner (Hafiz)', number: '60123456789' },
        { name: 'Sweeper (Zul)', number: '60987654321' },
    ];

    return (
        <>
            {/* Pulsing Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-24 right-4 z-40 bg-red-600 text-white p-4 rounded-full shadow-2xl animate-pulse hover:animate-none active:scale-95 transition-all border-4 border-white/20"
            >
                <AlertCircle className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </span>
            </button>

            {/* Emergency Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-surface w-full max-w-sm rounded-3xl border-2 border-red-500/30 overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                        <div className="bg-red-600 p-6 text-white text-center">
                            <ShieldAlert className="w-12 h-12 mx-auto mb-2" />
                            <h2 className="text-2xl font-bold">EMERGENCY SOS</h2>
                            <p className="text-red-100 text-sm">Stay calm. Help is available.</p>
                        </div>

                        <div className="p-6 space-y-4">
                            <div className="space-y-3">
                                {emergencyContacts.map((contact, idx) => (
                                    <a
                                        key={idx}
                                        href={`tel:${contact.number}`}
                                        className={clsx(
                                            "flex items-center justify-between p-4 rounded-2xl transition-all active:scale-[0.98]",
                                            idx === 0 ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-background border border-border text-text-primary"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Phone className={clsx("w-5 h-5", idx === 0 ? "text-white" : "text-primary")} />
                                            <div>
                                                <div className="font-bold">{contact.name}</div>
                                                <div className={clsx("text-xs", idx === 0 ? "text-red-100" : "text-text-muted")}>{contact.number}</div>
                                            </div>
                                        </div>
                                        <div className={clsx("text-xs font-bold uppercase", idx === 0 ? "bg-white/20 px-2 py-1 rounded" : "")}>
                                            Call Now
                                        </div>
                                    </a>
                                ))}
                            </div>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full py-4 text-text-muted font-bold text-sm hover:text-text-primary transition-colors"
                            >
                                Dismiss
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
