import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "default" | "danger" | "success" | "warning";
  className?: string;
}

const variantStyles = {
  default: "border-primary/50 text-neon-cyan",
  danger: "border-red-500/50 text-neon-red card-danger",
  success: "border-green-500/50 text-neon-green card-success", 
  warning: "border-orange-500/50 text-neon-orange card-warning",
};

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  variant = "default",
  className 
}: StatsCardProps) {
  return (
    <div className={cn(
      "card-cyber p-6 rounded-lg border-2 hover-glow",
      variantStyles[variant],
      className
    )}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground mb-1">{title}</p>
          <p className="text-3xl font-bold">{value}</p>
        </div>
        <Icon className="w-8 h-8 opacity-80" />
      </div>
    </div>
  );
}