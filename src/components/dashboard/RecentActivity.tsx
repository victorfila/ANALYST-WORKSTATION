import { useEffect, useState } from "react";
import { ArrowUp, Clock } from "lucide-react";
import { DataManager } from "@/utils/dataManager";

export default function RecentActivity() {
  const [recentActivities, setRecentActivities] = useState<any[]>([]);

  useEffect(() => {
    const savedResults = DataManager.getSavedResults();
    
    // Convert saved results to activity format
    const activities = savedResults.slice(-4).reverse().map((result, index) => ({
      time: new Date(result.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      action: "Análise realizada",
      case: `${result.fileName}`,
      type: result.hybridAnalysis && result.virusTotal ? "analysis" : "new"
    }));
    
    setRecentActivities(activities);
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case "new": return "text-neon-cyan";
      case "analysis": return "text-neon-purple"; 
      case "archive": return "text-muted-foreground";
      case "map": return "text-neon-green";
      default: return "text-foreground";
    }
  };

  if (recentActivities.length === 0) {
    return (
      <div className="card-cyber p-6 rounded-lg">
        <h3 className="text-lg font-semibold text-neon-green mb-4">Atividade Recente</h3>
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p>Nenhuma atividade recente</p>
          <p className="text-sm">Execute algumas análises para ver o histórico aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card-cyber p-6 rounded-lg">
      <h3 className="text-lg font-semibold text-neon-green mb-4">Atividade Recente</h3>
      <div className="space-y-4">
        {recentActivities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <ArrowUp className={`w-4 h-4 mt-1 ${getTypeColor(activity.type)}`} />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="font-medium">{activity.action}</span>
              </div>
              <p className="text-sm text-muted-foreground">{activity.case}</p>
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}