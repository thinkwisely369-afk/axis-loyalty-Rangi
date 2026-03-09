import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, QrCode, RefreshCw, AlertCircle } from "lucide-react";

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (errorMessage: string) => void;
    isOpen: boolean;
    onClose: () => void;
}

export const QRScanner = ({ onScanSuccess, onScanError, isOpen, onClose }: QRScannerProps) => {
    const [, setIsScanning] = useState(false);
    const [cameraStatus, setCameraStatus] = useState<"initializing" | "ready" | "error" | "no-camera">("initializing");
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
    const scannerId = "qr-reader-container";

    const startScanner = async () => {
        setCameraStatus("initializing");
        setErrorMsg(null);

        await new Promise(resolve => setTimeout(resolve, 300));

        const element = document.getElementById(scannerId);
        if (!element) {
            setCameraStatus("error");
            setErrorMsg("Scanner container missing");
            return;
        }

        try {
            const devices = await Html5Qrcode.getCameras().catch(() => []);

            if (!devices || devices.length === 0) {
                setCameraStatus("no-camera");
                return;
            }

            const html5QrCode = new Html5Qrcode(scannerId);
            html5QrCodeRef.current = html5QrCode;

            const config = { fps: 10, qrbox: { width: 220, height: 220 }, aspectRatio: 1.0 };

            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                (decodedText) => { onScanSuccess(decodedText); stopScanner(); onClose(); },
                (errorMessage) => {
                    if (onScanError && !errorMessage.includes("NotFoundException")) { }
                }
            ).catch(async () => {
                return await html5QrCode.start(
                    devices[0].id,
                    config,
                    (decodedText) => { onScanSuccess(decodedText); stopScanner(); onClose(); },
                    () => { }
                );
            });

            setIsScanning(true);
            setCameraStatus("ready");
        } catch (err: any) {
            setCameraStatus("error");
            setErrorMsg(err?.message || "Could not access camera. Please check permissions.");
        }
    };

    const stopScanner = async () => {
        if (html5QrCodeRef.current) {
            try {
                if (html5QrCodeRef.current.isScanning) await html5QrCodeRef.current.stop();
                html5QrCodeRef.current.clear();
                html5QrCodeRef.current = null;
            } catch { }
        }
        setIsScanning(false);
    };

    useEffect(() => {
        if (isOpen) startScanner();
        else stopScanner();
        return () => {
            if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
                html5QrCodeRef.current.stop().catch(console.error);
            }
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-xl">
            <div className="bg-[#0a0f16] border border-white/10 rounded-t-3xl sm:rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-300">

                {/* Header */}
                <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-white/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.2)]">
                            <QrCode className="w-5 h-5 text-cyan-400" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-white">Scan QR Code</h3>
                            <p className="text-[11px] text-gray-500">Align the code within the frame</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Scanner viewport */}
                <div className="px-6 pt-6 pb-4 flex flex-col items-center">
                    <div className="relative w-full aspect-square max-w-[260px] rounded-2xl overflow-hidden bg-black border border-white/10">
                        <div id={scannerId} className="w-full h-full" />

                        {/* Initializing */}
                        {cameraStatus === "initializing" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 z-10">
                                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
                                <p className="text-xs font-medium text-gray-400">Opening camera...</p>
                            </div>
                        )}

                        {/* No camera */}
                        {cameraStatus === "no-camera" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-20">
                                <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                                <p className="text-sm font-semibold text-white">No camera detected</p>
                                <p className="text-xs text-gray-500 mt-1">Grant camera permissions and try again</p>
                                <button
                                    onClick={startScanner}
                                    className="mt-4 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-colors"
                                >
                                    Try Again
                                </button>
                            </div>
                        )}

                        {/* Error */}
                        {cameraStatus === "error" && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90 p-6 text-center z-20">
                                <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
                                <p className="text-sm font-semibold text-white">Camera Error</p>
                                <p className="text-xs text-gray-500 mt-1 px-4">{errorMsg}</p>
                                <button
                                    onClick={startScanner}
                                    className="mt-4 px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/20 transition-colors"
                                >
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Scan corners + animated line */}
                        {cameraStatus === "ready" && (
                            <div className="absolute inset-0 pointer-events-none z-10">
                                <div className="absolute top-3 left-3 w-8 h-8 border-t-2 border-l-2 border-cyan-400 rounded-tl-lg shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 border-cyan-400 rounded-tr-lg shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 border-cyan-400 rounded-bl-lg shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                <div className="absolute bottom-3 right-3 w-8 h-8 border-b-2 border-r-2 border-cyan-400 rounded-br-lg shadow-[0_0_10px_rgba(34,211,238,0.5)]" />
                                <div className="absolute left-3 right-3 h-[1px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_10px_rgba(34,211,238,0.8)] animate-scan-line" />
                            </div>
                        )}
                    </div>

                    <p className="mt-5 text-xs text-gray-500 text-center">
                        Point your camera at a QR code to scan automatically
                    </p>
                </div>

                {/* Footer */}
                <div className="px-6 pb-8 flex justify-center">
                    <button
                        onClick={onClose}
                        className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        Enter Code Manually
                    </button>
                </div>
            </div>
        </div>
    );
};
