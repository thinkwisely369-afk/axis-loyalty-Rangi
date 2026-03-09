import { useState } from "react";
import { ArrowLeft, Camera, Bell, Shield, CreditCard, LogOut, ChevronRight, Moon, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { GlassNavigation } from "@/components/GlassNavigation";

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
  const [name, setName] = useState("Rangika");
  const [email, setEmail] = useState("rangika@example.com");
  const [isEditing, setIsEditing] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleSave = () => {
    setIsEditing(false);
    // Save logic would go here when backend is connected
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
            <AvatarImage src="/placeholder.svg" alt={name} />
            <AvatarFallback className="bg-primary/20 text-primary text-2xl font-bold">
              {name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </button>
        </div>
        <div className="mt-4 text-center">
          <p className="text-lg font-bold text-foreground">{name}</p>
          <p className="text-muted-foreground text-sm">Gold Member</p>
        </div>
      </section>

      {/* Edit Profile Section */}
      <section className="px-6 mb-8">
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
        <button className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-destructive/30 text-destructive hover:bg-destructive/10 transition-all duration-200">
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
