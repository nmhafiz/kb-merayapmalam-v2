import { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';

interface QRScannerProps {
    onClose: () => void;
    onSuccess: () => void;
}

export default function QRScanner({ onClose, onSuccess }: QRScannerProps) {
    const { session } = useAuth();
    const [scanResult, setScanResult] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const scannerRef = useRef<Html5QrcodeScanner | null>(null);
    const processingRef = useRef(false); // Use ref to avoid closure staleness in scanner callback

    useEffect(() => {
        // Initialize Scanner
        // Note: html5-qrcode creates DOM elements, so we need a container with id "reader"
        const scanner = new Html5QrcodeScanner(
            "reader",
            {
                fps: 10,
                qrbox: { width: 250, height: 250 },
                aspectRatio: 1.0,
                showTorchButtonIfSupported: true
            },
            /* verbose= */ false
        );

        function onScanSuccess(decodedText: string) {
            if (processingRef.current) return;
            processingRef.current = true;

            setScanResult(decodedText);
            handleCheckIn(decodedText);
        }

        function onScanFailure() {
            // Ignore failures until success
        }

        scanner.render(onScanSuccess, onScanFailure);
        scannerRef.current = scanner;

        return () => {
            scanner.clear().catch(error => {
                console.error("Failed to clear html5-qrcode scanner. ", error);
            });
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleCheckIn = async (qrData: string) => {
        setErrorMsg(null);

        try {
            // Parse QR Data
            let eventId = '';
            try {
                const data = JSON.parse(qrData);
                if (data.action === 'kb-checkin' && data.eventId) {
                    eventId = data.eventId;
                } else {
                    throw new Error('Invalid QR Code Format');
                }
            } catch {
                throw new Error('Invalid QR Code. Make sure you are scanning the official Event Check-in QR.');
            }

            // Perform Check-in
            const { error } = await supabase.from('kb_checkins').insert({
                event_id: eventId,
                user_id: session?.user.id as string // Cast to string, RLS will fail if null
            });

            if (error) {
                if (error.code === '23505') { // Unique violation
                    throw new Error('You have already checked in to this event!');
                }
                throw error;
            }

            // Determine Success UI locally
            // Wait a moment then close
            setTimeout(() => {
                onSuccess();
            }, 2000);

        } catch (err: any) {
            console.error('Check-in failed', err);
            setErrorMsg(err.message || 'Check-in failed. Please try again.');
            processingRef.current = false; // Reset processing on error so user can try again
        } finally {
            if (scannerRef.current) {
                scannerRef.current.pause(true); // Pause scanning while showing result
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 z-[60] flex flex-col items-center justify-center p-4 backdrop-blur-sm">
            <button
                onClick={onClose}
                className="absolute top-6 right-6 p-2 bg-white/10 rounded-full text-white hover:bg-white/20"
            >
                <X className="w-6 h-6" />
            </button>

            <div className="w-full max-w-sm bg-surface rounded-xl overflow-hidden border border-border shadow-2xl relative">
                {/* Result Overlay */}
                {scanResult && (
                    <div className="absolute inset-0 z-20 bg-surface flex flex-col items-center justify-center p-6 text-center animate-in fade-in">
                        {errorMsg ? (
                            <>
                                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mb-4 text-red-500">
                                    <AlertTriangle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">Check-in Failed</h3>
                                <p className="text-sm text-text-muted mb-6">{errorMsg}</p>
                                <button
                                    onClick={() => {
                                        setScanResult(null);
                                        setErrorMsg(null);
                                        processingRef.current = false;
                                        // Resume scanning
                                        if (scannerRef.current) scannerRef.current.resume();
                                    }}
                                    className="px-6 py-2 bg-charcoal border border-border rounded-lg text-text-primary hover:bg-charcoal/80"
                                >
                                    Try Again
                                </button>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4 text-green-500 animate-bounce">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-bold text-text-primary mb-2">Checked In!</h3>
                                <p className="text-sm text-text-muted">Enjoy the run!</p>
                            </>
                        )}
                    </div>
                )}

                <div className="p-4 bg-surface border-b border-border">
                    <h3 className="font-bold text-text-primary text-center">Scan Event QR</h3>
                </div>

                <div className="bg-black relative">
                    <div id="reader" className="w-full"></div>
                </div>

                <div className="p-4 text-center text-xs text-text-muted">
                    Point your camera at the Check-in QR code displayed by the admin.
                </div>
            </div>
        </div>
    );
}
