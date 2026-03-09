import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Loader2, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { apiCall } from '@/lib/api';
import { useWalletStore } from '@/stores/walletStore';

interface SnapCashModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface BillDetails {
  merchantName: string;
  location: string;
  totalAmount: number;
  hasCH17Discount: boolean;
  rawText?: string;
  image: string;
}

export const SnapCashModal = ({ isOpen, onClose }: SnapCashModalProps) => {
  const [step, setStep] = useState<'upload' | 'processing' | 'review' | 'result'>('upload');
  const [image, setImage] = useState<string | null>(null);
  const [details, setDetails] = useState<BillDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pointsEarned, setPointsEarned] = useState(0);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const compressImage = (base64: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const maxDim = 1600;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) { height = Math.round(height * maxDim / width); width = maxDim; }
          else { width = Math.round(width * maxDim / height); height = maxDim; }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = base64;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = async () => {
        const raw = reader.result as string;
        const compressed = await compressImage(raw);
        setImage(compressed);
        analyzeImage(compressed);
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const analyzeImage = async (base64: string) => {
    setStep('processing');
    try {
      const response = await apiCall('/snapcash/analyze', {
        method: 'POST',
        body: JSON.stringify({
          bill_image: base64
        })
      });

      const result = await response.json();
      if (result.success) {
        setDetails({
          merchantName: result.details.merchant_name,
          location: result.details.location,
          totalAmount: result.details.total_amount,
          hasCH17Discount: result.details.has_ch17_discount,
          rawText: result.details.raw_text,
          image: base64
        });
        setStep('review');
      } else {
        toast.error(result.message || result.rejection_reason || 'AI analysis failed. Please try a clearer image.', { duration: 5000 });
        setStep('upload');
      }
    } catch (error) {
      toast.error('Network error during AI analysis. Please try again.');
      setStep('upload');
    }
  };

  const handleSubmit = async () => {
    if (!details) return;

    setIsSubmitting(true);
    try {
      const response = await apiCall('/snapcash/submit', {
        method: 'POST',
        body: JSON.stringify({
          merchant_name: details.merchantName,
          location: details.location,
          total_amount: details.totalAmount,
          has_ch17_discount: details.hasCH17Discount,
          raw_text: details.rawText || 'AI Parsed',
          bill_image: details.image
        })
      });

      const result = await response.json();
      if (result.success) {
        setPointsEarned(result.points_earned || 0);
        setStep('result');
      } else {
        toast.error(result.message || 'Submission failed');
      }
    } catch (error) {
      toast.error('An error occurred during submission');
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setStep('upload');
    setImage(null);
    setDetails(null);
    setPointsEarned(0);
  };

  const triggerCamera = () => cameraInputRef.current?.click();
  const triggerUpload = () => galleryInputRef.current?.click();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md bg-[#0A0A0B] border-white/10 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="text-xl font-bold">SnapCash AI Bill Scanner</DialogTitle>
        </DialogHeader>

        <div className="p-6">
          {step === 'upload' && (
            <div className="space-y-6">
              <div
                onClick={triggerCamera}
                className="border-2 border-dashed border-white/10 rounded-2xl p-12 flex flex-col items-center justify-center gap-4 hover:bg-white/5 transition-colors cursor-pointer group"
              >
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Camera className="w-8 h-8 text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-foreground font-medium">Open Camera</p>
                  <p className="text-muted-foreground text-sm mt-1">Our AI will automatically extract bill details</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-white/5" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-[#0A0A0B] px-2 text-muted-foreground">Or</span>
                </div>
              </div>

              <Button
                onClick={triggerUpload}
                variant="secondary"
                className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 border-white/5"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload from Gallery
              </Button>

              <input
                type="file"
                ref={cameraInputRef}
                onChange={handleFileChange}
                accept="image/*"
                capture="environment"
                className="hidden"
              />
              <input
                type="file"
                ref={galleryInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />
            </div>
          )}

          {step === 'processing' && (
            <div className="py-12 flex flex-col items-center justify-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                <Loader2 className="w-8 h-8 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold">AI Analyzing Bill...</h3>
                <p className="text-muted-foreground animate-pulse">Extracting merchant, location and total values</p>
              </div>
            </div>
          )}

          {step === 'review' && details && (
            <div className="space-y-6">
              <div className="aspect-[3/4] rounded-xl overflow-hidden bg-black/40 border border-white/10">
                <img src={image!} alt="Bill" className="w-full h-full object-contain" />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Merchant</p>
                      <input
                        className="bg-white/10 border border-white/10 rounded px-2 py-1 text-sm text-foreground font-bold focus:outline-none focus:border-primary/50"
                        value={details.merchantName}
                        onChange={(e) => setDetails({ ...details, merchantName: e.target.value })}
                      />
                    </div>
                    {details.hasCH17Discount ? (
                      <div className="px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-red-500" />
                        <span className="text-[10px] font-bold text-red-500 uppercase">CH17 Detected</span>
                      </div>
                    ) : (
                      <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        <span className="text-[10px] font-bold text-emerald-500 uppercase">Valid Bill</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Location</p>
                      <input
                        className="w-full bg-white/10 border border-white/10 rounded px-2 py-1 text-sm text-foreground focus:outline-none focus:border-primary/50"
                        value={details.location}
                        onChange={(e) => setDetails({ ...details, location: e.target.value })}
                      />
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total Amount</p>
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-sm font-bold text-primary">LKR</span>
                        <input
                          type="number"
                          className="w-24 bg-white/10 border border-white/10 rounded px-2 py-1 text-sm text-primary font-bold focus:outline-none focus:border-primary/50 text-right"
                          value={details.totalAmount}
                          onChange={(e) => setDetails({ ...details, totalAmount: parseFloat(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {details.hasCH17Discount && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
                    <p className="text-sm text-red-200">
                      **CH17 Discount already applied.** This bill is ineligible for further rewards.
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12 rounded-xl" onClick={reset}>
                  Retake
                </Button>
                {!details.hasCH17Discount ? (
                  <Button
                    className="flex-[2] h-12 rounded-xl"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                    )}
                    Submit Bill
                  </Button>
                ) : (
                  <Button variant="destructive" className="flex-[2] h-12 rounded-xl" onClick={onClose}>
                    Close
                  </Button>
                )}
              </div>
            </div>
          )}

          {step === 'result' && (
            <div className="py-12 flex flex-col items-center justify-center gap-6 text-center">
              <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center animate-bounce">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold">Bill Submitted!</h3>
                {pointsEarned > 0 && (
                  <p className="text-lg font-bold text-emerald-400 mt-2">
                    +{pointsEarned.toLocaleString()} redeemable points earned!
                  </p>
                )}
                <p className="text-muted-foreground mt-2 px-6">
                  5% of your bill total has been added to your redeemable points.
                </p>
              </div>
              <Button onClick={() => { useWalletStore.getState().reset(); onClose(); }} className="w-full mt-4 h-12 rounded-xl">
                Done
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
