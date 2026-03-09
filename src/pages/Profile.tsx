import { useState } from "react";
import { ArrowLeft, Camera, Bell, Shield, CreditCard, LogOut, ChevronRight, Moon, Globe, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GlassNavigation } from "@/components/GlassNavigation";
import { toast } from "sonner";
import { apiCall } from "@/lib/api";
import ImageCropper from "@/components/ImageCropper";
import { useAuthStore } from "@/stores/authStore";
import { useWalletStore } from "@/stores/walletStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface SettingItemProps {
  icon: React.ElementType;
  label: string;
  description?: string;
  hasToggle?: boolean;
  toggleValue?: boolean;
  onToggleChange?: (value: boolean) => void;
  onClick?: () => void;
}

const SettingItem = ({ icon: Icon, label, description, hasToggle, toggleValue, onToggleChange, onClick }: SettingItemProps) => (
  <button
    onClick={onClick}
    className="w-full flex items-center justify-between p-4 rounded-xl bg-card/50 border border-border/30 hover:bg-card/80 transition-all duration-200"
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div className="text-left">
        <p className="text-foreground font-medium">{label}</p>
        {description && <p className="text-muted-foreground text-sm">{description}</p>}
      </div>
    </div>
    {hasToggle ? (
      <Switch checked={toggleValue} onCheckedChange={onToggleChange} />
    ) : (
      <ChevronRight className="w-5 h-5 text-muted-foreground" />
    )}
  </button>
);

const Profile = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuthStore();
  const walletReset = useWalletStore((s) => s.reset);

  const [name, setName] = useState(user?.name || "User");
  const [email, setEmail] = useState(user?.email || "");
  const [avatar, setAvatar] = useState<string | null>(user?.profile_photo_url || null);
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [newPolicyNumber, setNewPolicyNumber] = useState("");
  const [isAddingPolicy, setIsAddingPolicy] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setSelectedImage(reader.result as string);
        setIsCropperOpen(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = (croppedImage: string) => {
    setAvatar(croppedImage);
    setIsCropperOpen(false);
    // Automatically save photo when cropped
    updateProfile({ avatar: croppedImage });
  };

  const updateProfile = async (data: any) => {
    setLoading(true);
    try {
      const response = await apiCall("/user/profile", {
        method: "POST",
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        updateUser(result.user);
        if (result.user.profile_photo_url) {
          setAvatar(`${result.user.profile_photo_url}?t=${Date.now()}`);
        }
      } else {
        toast.error(result.message || "Update failed");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    updateProfile({ name, email });
  };

  const handleAddPolicy = async () => {
    if (!newPolicyNumber) {
      toast.error("Please enter a policy number");
      return;
    }
    setLoading(true);
    try {
      const response = await apiCall("/user/policy", {
        method: "POST",
        body: JSON.stringify({ policy_number: newPolicyNumber }),
      });
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        updateUser(result.user);
        setNewPolicyNumber("");
        setIsAddingPolicy(false);
      } else {
        toast.error(result.message || "Failed to add policy");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="relative px-6 pt-12 pb-6">
        <button
          onClick={() => navigate("/")}
          className="absolute left-6 top-12 w-10 h-10 rounded-full glass flex items-center justify-center"
        >
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <h1 className="text-xl font-bold text-foreground text-center">Profile</h1>
      </header>

      {/* Avatar Section */}
      <section className="flex flex-col items-center px-6 mb-8">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-primary/30">
            <AvatarImage src={avatar || ""} alt={name} className="object-cover" />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg cursor-pointer hover:bg-primary-glow transition-colors">
            <Camera className="w-4 h-4 text-primary-foreground" />
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg font-bold text-foreground">{name}</p>
          <p className="text-muted-foreground text-sm">
            {user?.role === 'admin' ? 'System Administrator' :
              user?.role === 'management' ? 'Company Management' :
                user?.role === 'staff' ? 'Staff Member' : 'Valued Customer'}
          </p>
        </div>
      </section>

      {selectedImage && (
        <ImageCropper
          image={selectedImage}
          isOpen={isCropperOpen}
          onCropComplete={handleCropComplete}
          onCancel={() => setIsCropperOpen(false)}
        />
      )}

      {/* Edit Profile Section */}
      <section className="px-6 mb-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Account Details</h2>
            {!isEditing ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="text-primary hover:text-primary-glow"
              >
                Edit
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSave}
                className="text-emerald-400 hover:text-emerald-300"
              >
                Save
              </Button>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Full Name</label>
              {isEditing ? (
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              ) : (
                <p className="text-foreground font-medium py-2">{name}</p>
              )}
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email</label>
              {isEditing ? (
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-border/50"
                />
              ) : (
                <p className="text-foreground font-medium py-2">{email}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="px-6 mb-8">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Registered Policies</h2>
            <Dialog open={isAddingPolicy} onOpenChange={setIsAddingPolicy}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary-glow">
                  <Plus className="w-4 h-4 mr-1" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10">
                <DialogHeader>
                  <DialogTitle>Add New Policy</DialogTitle>
                  <DialogDescription>
                    Enter your insurance policy number to register it under your account.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <Input
                    placeholder="e.g. HNBA-001"
                    value={newPolicyNumber}
                    onChange={(e) => setNewPolicyNumber(e.target.value)}
                    className="bg-background/50"
                  />
                </div>
                <DialogFooter>
                  <Button
                    onClick={handleAddPolicy}
                    disabled={loading}
                    className="w-full sm:w-auto"
                  >
                    {loading ? "Verifying..." : "Register Policy"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {(user as any)?.policies?.length > 0 ? (
              (user as any).policies.map((p: any) => (
                <div key={p.id ?? p.policy_number} className="p-4 rounded-xl bg-background/30 border border-white/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Shield className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{p.policy_number}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{p.customer_name || 'Verified Policy'}</p>
                      </div>
                    </div>
                    <div className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold">ACTIVE</div>
                  </div>
                  {(p.policy_duration || p.maturity_value || p.started_date) && (
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Duration</p>
                        <p className="text-xs font-semibold text-foreground">{p.policy_duration || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Maturity Value</p>
                        <p className="text-xs font-semibold text-foreground">{p.maturity_value || '—'}</p>
                      </div>
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-0.5">Started</p>
                        <p className="text-xs font-semibold text-foreground">{p.started_date ? new Date(p.started_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : user?.policy_number ? (
              <div className="flex items-center justify-between p-3 rounded-xl bg-background/30 border border-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{user.policy_number}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Primary Policy</p>
                  </div>
                </div>
                <div className="px-2 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold">ACTIVE</div>
              </div>
            ) : (
              <div className="text-center py-6 glass rounded-xl border-dashed border-white/10">
                <p className="text-sm text-muted-foreground italic">No policies registered yet</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Settings Section */}
      <section className="px-6">
        <h2 className="text-lg font-bold text-foreground mb-4">Settings</h2>
        <div className="space-y-3">
          <SettingItem
            icon={Bell}
            label="Notifications"
            description="Push notifications & alerts"
            hasToggle
            toggleValue={notifications}
            onToggleChange={setNotifications}
          />
          <SettingItem
            icon={Moon}
            label="Dark Mode"
            description="Toggle dark theme"
            hasToggle
            toggleValue={darkMode}
            onToggleChange={setDarkMode}
          />
          <SettingItem
            icon={Shield}
            label="Privacy & Security"
            description="Manage your security settings"
          />
          <SettingItem
            icon={CreditCard}
            label="Payment Methods"
            description="Manage cards & accounts"
          />
          <SettingItem
            icon={Globe}
            label="Language"
            description="English (US)"
          />
        </div>
      </section>

      {/* Logout Button */}
      <section className="px-6 mt-8">
        <button
          onClick={() => { walletReset(); logout(); navigate("/login"); }}
          className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Log Out</span>
        </button>
      </section>

      {/* Bottom Navigation */}
      <GlassNavigation />
    </div>
  );
};

export default Profile;
