import { useEffect, useState } from "react";
import { FileText, Skull, Target, Activity, AlertTriangle, Shield } from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickAccess from "@/components/dashboard/QuickAccess";
import RecentActivity from "@/components/dashboard/RecentActivity";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const stats = [
    { label: "Casos Ativos", value: "3", icon: FileText, variant: "default" as const },
    { label: "Ameaças Detectadas", value: "2", icon: Skull, variant: "danger" as const },
    { label: "Pistas Coletadas", value: "12", icon: Target, variant: "warning" as const },
    { label: "Análises Completas", value: "3", icon: Shield, variant: "success" as const },
  ];

  return (
    <div className="min-h-screen bg-background bg-cyber-grid">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neon-cyan mb-2">Dashboard</h1>
              <p className="text-muted-foreground">Central de controle do analista de segurança</p>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <div className="text-2xl font-mono text-neon-cyan">
                {currentTime.toLocaleTimeString('pt-BR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
              <div className="text-sm text-muted-foreground">
                {currentTime.toLocaleDateString('pt-BR', { 
                  weekday: 'long', 
                  day: 'numeric',
                  month: 'long'
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => (
            <StatsCard
              key={stat.label}
              title={stat.label}
              value={stat.value}
              icon={stat.icon}
              variant={stat.variant}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <QuickAccess />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}