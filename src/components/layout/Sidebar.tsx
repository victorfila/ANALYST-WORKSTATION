import { NavLink, useLocation } from "react-router-dom";
import { 
  Shield, 
  Database, 
  Search, 
  Target, 
  Activity, 
  AlertTriangle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Shield,
    color: "text-neon-cyan"
  },
  {
    title: "Mesa de Evidências",
    href: "/evidencias",
    icon: Database,
    color: "text-neon-orange"
  },
  {
    title: "Sala de Análise",
    href: "/analise",
    icon: Search,
    color: "text-neon-purple"
  },
  {
    title: "Mural Investigativo",
    href: "/mural",
    icon: Target,
    color: "text-neon-green"
  }
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <div className="w-64 bg-card border-r border-border h-screen fixed left-0 top-0 z-50">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center space-x-2">
          <Shield className="w-8 h-8 text-neon-cyan" />
          <div>
            <h1 className="text-xl font-bold text-neon-cyan">ANALYST</h1>
            <p className="text-sm text-muted-foreground">WORKSTATION</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="p-4 space-y-2">
        {navigationItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200",
                "hover:bg-secondary/50 hover-glow",
                isActive
                  ? "bg-secondary border border-primary/50 shadow-lg"
                  : "hover:bg-secondary/30"
              )}
            >
              <item.icon className={cn("w-5 h-5", item.color)} />
              <span className={cn(
                "font-medium",
                isActive ? "text-foreground" : "text-muted-foreground"
              )}>
                {item.title}
              </span>
            </NavLink>
          );
        })}
      </nav>

      {/* Status */}
      <div className="absolute bottom-0 left-0 right-0 p-4">
        <div className="bg-secondary/50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-neon-green animate-pulse" />
            <span className="text-sm text-muted-foreground">Sistema Online</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Última atualização: {new Date().toLocaleTimeString('pt-BR')}
          </div>
        </div>
      </div>
    </div>
  );
}