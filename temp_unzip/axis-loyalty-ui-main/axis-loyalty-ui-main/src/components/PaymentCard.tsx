import { MoreVertical, Trash2, Star, StarOff } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface PaymentCardProps {
  id: string;
  cardNumber: string;
  cardHolder: string;
  expiryDate: string;
  cardType: "visa" | "mastercard" | "amex";
  isDefault?: boolean;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
}

const cardTypeStyles = {
  visa: {
    gradient: "from-blue-600/30 via-blue-500/20 to-indigo-600/30",
    logo: "VISA",
    accent: "text-blue-400",
  },
  mastercard: {
    gradient: "from-orange-600/30 via-red-500/20 to-yellow-600/30",
    logo: "MC",
    accent: "text-orange-400",
  },
  amex: {
    gradient: "from-slate-400/30 via-zinc-300/20 to-slate-500/30",
    logo: "AMEX",
    accent: "text-slate-300",
  },
};

export const PaymentCard = ({
  id,
  cardNumber,
  cardHolder,
  expiryDate,
  cardType,
  isDefault,
  onSetDefault,
  onDelete,
}: PaymentCardProps) => {
  const styles = cardTypeStyles[cardType];
  const lastFour = cardNumber.slice(-4);

  return (
    <div 
      className="relative rounded-2xl overflow-hidden"
      style={{
        boxShadow: "0 8px 32px -8px rgba(0, 0, 0, 0.6)",
        aspectRatio: "1.586",
      }}
    >
      {/* Card background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${styles.gradient}`} />
      <div className="absolute inset-0 card-gradient opacity-90" />
      <div 
        className="absolute inset-0 rounded-2xl"
        style={{
          border: "1px solid rgba(255, 255, 255, 0.08)",
        }}
      />

      {/* Decorative circles */}
      <div 
        className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: "radial-gradient(circle, white, transparent)" }}
      />
      <div 
        className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full opacity-5"
        style={{ background: "radial-gradient(circle, white, transparent)" }}
      />

      {/* Content */}
      <div className="relative p-5 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-auto">
          <div className="flex items-center gap-2">
            {isDefault && (
              <span className="text-xs font-medium bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                Default
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${styles.accent}`}>
              {styles.logo}
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1 rounded-lg hover:bg-white/10 transition-colors">
                  <MoreVertical className="w-4 h-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass border-border/50">
                <DropdownMenuItem 
                  onClick={() => onSetDefault(id)}
                  className="cursor-pointer"
                >
                  {isDefault ? (
                    <>
                      <StarOff className="w-4 h-4 mr-2" />
                      Remove as default
                    </>
                  ) : (
                    <>
                      <Star className="w-4 h-4 mr-2" />
                      Set as default
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => onDelete(id)}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete card
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Card Number */}
        <div className="mb-4">
          <div className="flex items-center gap-3 text-lg font-mono tracking-wider text-foreground">
            <span className="opacity-60">••••</span>
            <span className="opacity-60">••••</span>
            <span className="opacity-60">••••</span>
            <span>{lastFour}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Card Holder
            </p>
            <p className="text-sm font-medium text-foreground uppercase tracking-wide">
              {cardHolder}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
              Expires
            </p>
            <p className="text-sm font-medium text-foreground">
              {expiryDate}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
