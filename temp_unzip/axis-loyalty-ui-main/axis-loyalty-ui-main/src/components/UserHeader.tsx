import { Bell, Settings } from "lucide-react";

interface UserHeaderProps {
  name: string;
  greeting?: string;
}

export const UserHeader = ({ name, greeting = "Welcome back" }: UserHeaderProps) => {
  return (
    <header className="flex items-center justify-between px-6 pt-6 pb-4">
      {/* User greeting */}
      <div className="flex flex-col">
        <span className="text-sm text-muted-foreground">{greeting},</span>
        <h1 className="text-xl font-bold text-foreground">{name}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button 
          className="relative p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-5 h-5 text-secondary" />
          {/* Notification dot */}
          <span 
            className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-primary"
            style={{
              boxShadow: "0 0 8px 2px hsl(191 100% 50% / 0.5)",
            }}
          />
        </button>
        
        <button 
          className="p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
          aria-label="Settings"
        >
          <Settings className="w-5 h-5 text-secondary" />
        </button>
      </div>
    </header>
  );
};
