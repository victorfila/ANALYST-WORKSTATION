import { useState } from "react";
import { Search, Filter, Plus, Edit, Eye, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

const casesData = [
  {
    id: "CASE-001",
    codename: "Cheat YouTube 1 - Sakura",
    status: "Analisado",
    verdict: "Seguro", 
    threat: "Nível 1",
    signatures: ["fake-cheat", "no-payload", "clickbait", "safe-binary"]
  },
  {
    id: "CASE-002", 
    codename: "Cheat YouTube 2",
    status: "Analisado",
    verdict: "Malware",
    threat: "Nível 5",
    signatures: ["info-stealer", "rhadamanthys", "js-obfuscated", "powershell-injection", "+6"]
  },
  {
    id: "CASE-003",
    codename: "Cheat Russo",
    status: "Em Análise", 
    verdict: "Pendente",
    threat: "Nível 3",
    signatures: ["russian-origin", "packed-binary", "suspicious-behavior"]
  }
];

const getThreatColor = (level: string) => {
  if (level.includes("1")) return "text-neon-green";
  if (level.includes("3")) return "text-neon-orange"; 
  if (level.includes("5")) return "text-neon-red";
  return "text-muted-foreground";
};

const getStatusColor = (status: string) => {
  if (status === "Analisado") return "bg-green-500/20 text-neon-green";
  if (status === "Em Análise") return "bg-orange-500/20 text-neon-orange";
  return "bg-secondary text-muted-foreground";
};

const getVerdictColor = (verdict: string) => {
  if (verdict === "Seguro") return "bg-green-500/20 text-neon-green";
  if (verdict === "Malware") return "bg-red-500/20 text-neon-red";
  return "bg-secondary text-muted-foreground";
};

export default function MesaEvidencias() {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="min-h-screen bg-background bg-cyber-grid">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neon-cyan mb-2">Mesa de Evidências</h1>
          <p className="text-muted-foreground">O banco de amostras do caçador digital</p>
        </div>

        {/* New Case Section */}
        <div className="card-cyber p-6 rounded-lg mb-6">
          <h3 className="text-lg font-semibold text-neon-orange mb-4">Novo Caso</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Codinome</label>
              <Input placeholder="Ex: Cerberus Variant" className="bg-secondary border-border" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Origem (URL)</label>
              <Input placeholder="https://suspicious-site.com/malware.exe" className="bg-secondary border-border" />
            </div>
          </div>
          <Button className="mt-4 bg-primary hover:bg-primary/80 text-primary-foreground">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar à Mesa
          </Button>
        </div>

        {/* Active Cases */}
        <div className="card-cyber p-6 rounded-lg">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h3 className="text-lg font-semibold text-neon-orange mb-4 md:mb-0">Casos Ativos</h3>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar casos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-secondary border-border w-64"
                />
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Filtros:</span>
            </div>
            <Select defaultValue="todos">
              <SelectTrigger className="w-32 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="analisado">Analisado</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="todos">
              <SelectTrigger className="w-32 bg-secondary border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="seguro">Seguro</SelectItem>
                <SelectItem value="malware">Malware</SelectItem>
              </SelectContent>
            </Select>
            <span className="text-sm text-muted-foreground">{casesData.length} resultados</span>
          </div>

          {/* Cases Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Codinome</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Veredicto</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ameaça</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Assinaturas</th>
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ações</th>
                </tr>
              </thead>
              <tbody>
                {casesData.map((case_) => (
                  <tr key={case_.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-4 px-4 font-mono text-sm">{case_.id}</td>
                    <td className="py-4 px-4 font-medium">{case_.codename}</td>
                    <td className="py-4 px-4">
                      <Badge className={getStatusColor(case_.status)}>
                        {case_.status}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getVerdictColor(case_.verdict)}>
                        {case_.verdict}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <span className={getThreatColor(case_.threat)}>
                        {case_.threat}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {case_.signatures.slice(0, 3).map((sig, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {sig}
                          </Badge>
                        ))}
                        {case_.signatures.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{case_.signatures.length - 3}
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="w-8 h-8 p-0 text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}