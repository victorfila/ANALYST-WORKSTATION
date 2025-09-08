import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Database, Search, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataManager } from "@/utils/dataManager";

export default function QuickAccess() {
  const [savedResults, setSavedResults] = useState<any[]>([]);

  useEffect(() => {
    setSavedResults(DataManager.getSavedResults());
  }, []);

  const activeCases = savedResults.length;
  const hasAnalysisInProgress = savedResults.some(result => 
    !result.hybridAnalysis || !result.virusTotal
  );

  const quickAccessItems = [
    {
      title: "Mesa de Evidências",
      href: "/evidencias",
      icon: Database,
      status: activeCases > 0 ? `${activeCases} casos` : "Vazio",
      variant: "cyber" as const
    },
    {
      title: "Sala de Análise", 
      href: "/analise",
      icon: Search,
      status: hasAnalysisInProgress ? "Em andamento" : "Pronto",
      variant: hasAnalysisInProgress ? "warning" as const : "success" as const
    },
    {
      title: "Mural Investigativo",
      href: "/mural",
      icon: Target,
      status: "Disponível",
      variant: "success" as const
    }
  ];

  return (
    <div className="card-cyber p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-neon-orange mb-4">Acesso Rápido</h3>
      <div className="space-y-3">
        {quickAccessItems.map((item) => (
          <Link key={item.href} to={item.href}>
            <div className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-secondary/50 transition-all hover-glow">
              <div className="flex items-center space-x-3">
                <item.icon className="w-5 h-5 text-primary" />
                <span className="font-medium">{item.title}</span>
              </div>
              <div className="text-sm px-2 py-1 rounded-full bg-secondary text-primary">
                {item.status}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}