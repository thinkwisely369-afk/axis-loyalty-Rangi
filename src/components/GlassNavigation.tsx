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
      style={{ paddingBottom: "max(1.5rem, env(safe-area-inset-bottom))" }}
    >
      <div
        className="mx-auto max-w-md bg-[#0a0f16]/90 backdrop-blur-2xl rounded-[2rem] border border-white/5 py-3 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center justify-around px-2">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center gap-1.5 px-3 py-2 transition-all duration-300 ${isActive
                    ? "text-cyan-400"
                    : "text-gray-500 hover:text-white"
                  }`}
              >
                <Icon
                  className={`w-6 h-6 relative z-10 transition-all duration-300 ${isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" : "opacity-80"
                    }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />

                <span
                  className={`text-[10px] font-bold uppercase tracking-widest relative z-10 transition-all duration-300 ${isActive ? "opacity-100" : "opacity-50"
                    }`}
                >
                  {item.label}
                </span>

                {/* Active indicator dot and glow */}
                {isActive && (
                  <div className="absolute -bottom-1 flex flex-col items-center">
                    <div className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,1)]" />
                    <div className="w-8 h-8 rounded-full bg-cyan-400/10 blur-md absolute -bottom-4" />
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
