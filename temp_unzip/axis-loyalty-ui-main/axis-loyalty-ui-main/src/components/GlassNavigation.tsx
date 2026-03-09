import { Home, Gift, CreditCard, User } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  { id: "home", icon: Home, label: "Home", path: "/" },
  { id: "rewards", icon: Gift, label: "Rewards", path: "/rewards" },
  { id: "cards", icon: CreditCard, label: "Cards", path: "/cards" },
  { id: "profile", icon: User, label: "Profile", path: "/profile" },
];

export const GlassNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-4"
      style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
    >
      <div 
        className="mx-auto max-w-md glass rounded-2xl px-2 py-3"
        style={{
          boxShadow: "0 -4px 32px -8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
        }}
      >
        <div className="flex items-center justify-around">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all duration-300 ${
                  isActive 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-secondary"
                }`}
              >
                {/* Active indicator glow */}
                {isActive && (
                  <div 
                    className="absolute inset-0 rounded-xl opacity-20"
                    style={{
                      background: "radial-gradient(circle at center, hsl(191 100% 50%), transparent 70%)",
                    }}
                  />
                )}
                
                <Icon 
                  className={`w-6 h-6 relative z-10 transition-transform duration-300 ${
                    isActive ? "scale-110" : ""
                  }`}
                  style={{
                    filter: isActive ? "drop-shadow(0 0 8px hsl(191 100% 50% / 0.6))" : "none",
                  }}
                />
                
                <span 
                  className={`text-xs font-medium relative z-10 transition-all duration-300 ${
                    isActive ? "opacity-100" : "opacity-60"
                  }`}
                >
                  {item.label}
                </span>

                {/* Active dot */}
                {isActive && (
                  <div 
                    className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                    style={{
                      boxShadow: "0 0 8px 2px hsl(191 100% 50% / 0.6)",
                    }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
