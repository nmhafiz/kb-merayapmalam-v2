import { ShieldAlert, Lightbulb, Phone } from 'lucide-react';

export default function SafetyChecklist() {
    const safetyItems = [
        { icon: <Lightbulb className="w-4 h-4" />, label: "Headlamp/Torchlight (Wajib!)", detail: "Laluan gelap, kena ada ni." },
        { icon: <ShieldAlert className="w-4 h-4" />, label: "Reflective Vest/Light", detail: "Supaya driver nampak kita." },
        { icon: <Droplets className="w-4 h-4" />, label: "Hydration (Air!)", detail: "Larian malam pun kena cukup air." },
        { icon: <Phone className="w-4 h-4" />, label: "Emergency Contact", detail: "Pastikan phone bateri penuh." }
    ];

    return (
        <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 mt-6">
            <h3 className="text-sm font-bold text-red-500 flex items-center gap-2 mb-3">
                <ShieldAlert className="w-4 h-4" />
                Safety Checklist (Mesti Ada)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {safetyItems.map((item, idx) => (
                    <div key={idx} className="flex gap-3">
                        <div className="bg-red-500/20 p-2 rounded-lg h-fit text-red-500">
                            {item.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-text-primary">{item.label}</p>
                            <p className="text-[10px] text-text-muted">{item.detail}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Inline re-export of Droplets since it's used in and out
function Droplets({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
        </svg>
    );
}
