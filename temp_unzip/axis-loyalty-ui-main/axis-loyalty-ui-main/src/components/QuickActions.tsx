import { QrCode, Wallet, ArrowUpRight, History } from "lucide-react";

const actions = [
  { id: "scan", icon: QrCode, label: "Scan" },
  { id: "wallet", icon: Wallet, label: "Wallet" },
  { id: "transfer", icon: ArrowUpRight, label: "Transfer" },
  { id: "history", icon: History, label: "History" },
];

export const QuickActions = () => {
  return (
    <div className="px-6 py-4">
      <div className="flex items-center justify-between">
        {actions.map((action, index) => {
          const Icon = action.icon;
          
          return (
            <button
              key={action.id}
              className="group flex flex-col items-center gap-2 animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div 
                className="p-4 rounded-2xl bg-muted/50 border border-border/50 
                          group-hover:border-primary/30 group-hover:bg-muted 
                          transition-all duration-300"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.02)",
                }}
              >
                <Icon className="w-6 h-6 text-secondary group-hover:text-primary transition-colors" />
              </div>
              <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                {action.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
