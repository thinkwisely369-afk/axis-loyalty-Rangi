import { Bell, QrCode, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "@/stores/authStore";

interface UserHeaderProps {
  name: string;
  greeting?: string;
  onScanClick?: () => void;
}

export const UserHeader = ({ name, greeting = "Welcome back", onScanClick }: UserHeaderProps) => {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  return (
    <header className="flex items-center justify-between px-6 pt-8 pb-4">
      {/* User greeting */}
      <div className="flex flex-col">
        <span className="text-[12px] text-gray-500 font-medium">Welcome back,</span>
        <h1 className="text-2xl font-black text-white tracking-tight -mt-1">{name}</h1>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        {isAdmin && (
          <Link
            to="/admin"
            className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
          >
            <Shield className="w-5 h-5" />
          </Link>
        )}

        <button
          onClick={onScanClick}
          className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
        >
          <QrCode className="w-5 h-5" />
        </button>

        <button className="relative flex items-center justify-center w-10 h-10 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
          <Bell className="w-5 h-5 fill-cyan-400/20" />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]" />
        </button>

        <Link
          to="/profile"
          className="relative block w-11 h-11 rounded-full p-[2px] bg-gradient-to-tr from-cyan-500/50 to-blue-500/50"
        >
          <div className="w-full h-full rounded-full bg-[#0a0f16] p-[1px] overflow-hidden">
            {user?.profile_photo_url ? (
              <img
                src={`${user.profile_photo_url}?t=${Date.now()}`}
                alt={name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-xs ring-1 ring-white/10 rounded-full">
                {name.charAt(0)}
              </div>
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};
