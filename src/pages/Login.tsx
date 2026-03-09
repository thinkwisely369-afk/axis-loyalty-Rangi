import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Phone, Lock } from "lucide-react";
import { toast } from "sonner";
import { apiCall } from "@/lib/api";
import { useAuthStore } from "@/stores/authStore";

const Login = () => {
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();
    const [step, setStep] = useState<"mobile" | "otp" | "policy">("mobile");
    const [mobileNumber, setMobileNumber] = useState("");
    const [otp, setOtp] = useState("");
    const [policyNumber, setPolicyNumber] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSendOtp = async () => {
        if (!mobileNumber || mobileNumber.length < 10) {
            toast.error("Please enter a valid mobile number");
            return;
        }

        setLoading(true);
        try {
            const response = await apiCall("/auth/send-otp", {
                method: "POST",
                body: JSON.stringify({ mobile_number: mobileNumber }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                try {
                    const errorData = JSON.parse(errorText);
                    toast.error(errorData.message || "Failed to send OTP");
                } catch {
                    toast.error(`Server error (${response.status})`);
                }
                return;
            }

            const data = await response.json();

            if (data.success) {
                toast.success("OTP sent successfully!");
                // In development, show OTP
                if (data.otp) {
                    toast.info(`Development OTP: ${data.otp}`);
                }
                setStep("otp");
            } else {
                toast.error(data.message || "Failed to send OTP");
            }
        } catch (error: any) {
            console.error("OTP Send Error:", error);
            toast.error(error?.message || "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (!otp || otp.length !== 6) {
            toast.error("Please enter a valid 6-digit OTP");
            return;
        }

        setLoading(true);
        try {
            const response = await apiCall("/auth/verify-otp", {
                method: "POST",
                body: JSON.stringify({
                    mobile_number: mobileNumber,
                    otp: otp,
                }),
            });

            const data = await response.json();

            if (data.success) {
                if (data.requires_policy) {
                    // Customer - needs policy verification
                    setStep("policy");
                    toast.info("Please enter your policy number");
                } else {
                    // Management or Staff - direct access
                    setAuth(data.user, data.token);
                    localStorage.setItem("is_first_login", data.is_first_login ? "true" : "false");
                    toast.success(`Welcome ${data.user.name}!`);
                    navigate("/");
                }
            } else {
                toast.error(data.message || "Invalid OTP");
            }
        } catch (error: any) {
            console.error("OTP Verify Error:", error);
            toast.error(error?.message || "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyPolicy = async () => {
        if (!policyNumber) {
            toast.error("Please enter your policy number");
            return;
        }

        setLoading(true);
        try {
            const response = await apiCall("/auth/verify-policy", {
                method: "POST",
                body: JSON.stringify({
                    mobile_number: mobileNumber,
                    policy_number: policyNumber,
                }),
            });

            const data = await response.json();

            if (data.success) {
                setAuth(data.user, data.token);
                localStorage.setItem("is_first_login", data.is_first_login ? "true" : "false");
                toast.success(`Welcome ${data.user.name}!`);
                navigate("/");
            } else {
                toast.error(data.message || "Invalid policy number");
            }
        } catch (error: any) {
            console.error("Policy Verify Error:", error);
            toast.error(error?.message || "Network error. Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <div className="flex justify-center mb-4">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <Shield className="w-8 h-8 text-primary" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl font-bold">
                        {step === "mobile" && "Welcome to Axis"}
                        {step === "otp" && "Verify OTP"}
                        {step === "policy" && "Verify Policy"}
                    </CardTitle>
                    <CardDescription>
                        {step === "mobile" && "Enter your mobile number to continue"}
                        {step === "otp" && `Enter the OTP sent to ${mobileNumber}`}
                        {step === "policy" && "Enter your insurance policy number"}
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {step === "mobile" && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Mobile Number</label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="tel"
                                        placeholder="Enter your mobile number"
                                        value={mobileNumber}
                                        onChange={(e) => setMobileNumber(e.target.value)}
                                        className="pl-10"
                                        maxLength={15}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleSendOtp}
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Sending..." : "Send OTP"}
                            </Button>
                        </>
                    )}

                    {step === "otp" && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">OTP</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                                    <Input
                                        type="text"
                                        placeholder="Enter 6-digit OTP"
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                        className="pl-10 text-center text-lg tracking-widest"
                                        maxLength={6}
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleVerifyOtp}
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify OTP"}
                            </Button>
                            <Button
                                onClick={() => setStep("mobile")}
                                variant="ghost"
                                className="w-full"
                            >
                                Change Mobile Number
                            </Button>
                        </>
                    )}

                    {step === "policy" && (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Policy Number</label>
                                <div className="relative">
                                    <Input
                                        type="text"
                                        placeholder="Enter your policy number"
                                        value={policyNumber}
                                        onChange={(e) => setPolicyNumber(e.target.value)}
                                        className="w-full"
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleVerifyPolicy}
                                className="w-full"
                                disabled={loading}
                            >
                                {loading ? "Verifying..." : "Verify Policy"}
                            </Button>
                            <Button
                                onClick={() => setStep("otp")}
                                variant="ghost"
                                className="w-full"
                            >
                                Back
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>

        </div>
    );
};

export default Login;
