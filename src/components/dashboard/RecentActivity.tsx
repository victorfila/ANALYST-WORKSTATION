import { ArrowUp, Clock } from "lucide-react";

const recentActivities = [
  {
    time: "15:45",
    action: "Novo caso adicionado",
    case: "CASE-003: Cheat Russo",
    type: "new"
  },
  {
    time: "14:28", 
    action: "Análise concluída",
    case: "CASE-002: Cheat YouTube 2 - Rhadamanthys",
    type: "analysis"
  },
  {
    time: "11:30",
    action: "Caso arquivado", 
    case: "CASE-001: Cheat YouTube 1 - Sakura",
    type: "archive"
  },
  {
    time: "Ontem",
    action: "Mural atualizado",
    case: "Conexões GitHub hackeado mapeadas",
    type: "map"
  }
];

const getTypeColor = (type: string) => {
  switch (type) {
    case "new": return "text-neon-cyan";
    case "analysis": return "text-neon-purple";
    case "archive": return "text-muted-foreground";
    case "map": return "text-neon-green";
    default: return "text-foreground";
  }
};

export default function RecentActivity() {
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