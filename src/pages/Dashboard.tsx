import { useEffect, useState } from "react";
import { FileText, Skull, Target, Activity, AlertTriangle, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import StatsCard from "@/components/dashboard/StatsCard";
import QuickAccess from "@/components/dashboard/QuickAccess";
import RecentActivity from "@/components/dashboard/RecentActivity";
import { DataManager } from "@/utils/dataManager";

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [savedResults, setSavedResults] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setSavedResults(DataManager.getSavedResults());
  }, []);

  const handleClearAllData = () => {
    DataManager.clearAllData();
    setSavedResults([]);
    
    toast({
      title: "Sistema Limpo",
      description: "Todos os dados foram removidos do sistema. Dashboard zerado.",
    });
  };

  // Calculate real stats from saved data
  const analysisCount = savedResults.length;
  const threatsDetected = savedResults.filter(result => 
    (result.hybridAnalysis?.threat_score > 70) || 
    (result.virusTotal?.stats?.malicious > 0)
  ).length;
  const cluesCollected = savedResults.reduce((acc, result) => 
    acc + (result.hybridAnalysis ? 1 : 0) + (result.virusTotal ? 1 : 0), 0
  );
  const completedAnalyses = savedResults.filter(result => 
    result.hybridAnalysis && result.virusTotal
  ).length;

  const stats = [
    { label: "Casos Ativos", value: analysisCount.toString(), icon: FileText, variant: "default" as const },
    { label: "Ameaças Detectadas", value: threatsDetected.toString(), icon: Skull, variant: "danger" as const },
    { label: "Pistas Coletadas", value: cluesCollected.toString(), icon: Target, variant: "warning" as const },
    { label: "Análises Completas", value: completedAnalyses.toString(), icon: Shield, variant: "success" as const },
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
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="text-right">
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
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-red-500/50 text-neon-red hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar Tudo
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-neon-red">Limpar Todo o Sistema</AlertDialogTitle>
                    <AlertDialogDescription>
                      <div>
                        Esta ação irá remover permanentemente:
                        <ul className="list-disc list-inside mt-2 space-y-1">
                          <li>Todas as API keys salvas</li>
                          <li>Histórico de análises</li>
                          <li>Notas e relatórios</li>
                          <li>Configurações do painel</li>
                        </ul>
                        <div className="mt-2 text-neon-orange">Esta ação não pode ser desfeita!</div>
                      </div>
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-border">Cancelar</AlertDialogCancel>
                    <AlertDialogAction 
                      onClick={handleClearAllData}
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      Sim, Limpar Tudo
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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