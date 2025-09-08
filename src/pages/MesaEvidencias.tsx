import { useState, useEffect } from "react";
import { Search, Filter, Plus, Edit, Eye, Trash2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { DataManager } from "@/utils/dataManager";

export default function MesaEvidencias() {
  const [searchTerm, setSearchTerm] = useState("");
  const [realCases, setRealCases] = useState<any[]>([]);
  const [newCaseName, setNewCaseName] = useState("");
  const [newCaseUrl, setNewCaseUrl] = useState("");
  const { toast } = useToast();

  // Load real data from DataManager
  useEffect(() => {
    const savedResults = DataManager.getSavedResults();
    
    // Convert saved results to cases format
    const cases = savedResults.map((result, index) => ({
      id: `CASE-${String(index + 1).padStart(3, '0')}`,
      codename: result.fileName?.replace(/\.[^/.]+$/, "") || `Amostra ${index + 1}`,
      status: (result.hybridAnalysis && result.virusTotal) ? "Analisado" : "Em Análise",
      verdict: getThreatVerdict(result),
      threat: getThreatLevel(result),
      signatures: getSignatures(result),
      timestamp: result.timestamp,
      originalResult: result
    }));
    
    setRealCases(cases);
  }, []);

  const getThreatVerdict = (result: any) => {
    if (!result.hybridAnalysis && !result.virusTotal) return "Pendente";
    
    const hybridThreat = result.hybridAnalysis?.threat_score || 0;
    const vtMalicious = result.virusTotal?.stats?.malicious || 0;
    
    if (hybridThreat > 70 || vtMalicious > 5) return "Malware";
    if (hybridThreat > 30 || vtMalicious > 0) return "Suspeito";
    return "Seguro";
  };

  const getThreatLevel = (result: any) => {
    const verdict = getThreatVerdict(result);
    if (verdict === "Malware") return "Nível 5";
    if (verdict === "Suspeito") return "Nível 3";
    if (verdict === "Seguro") return "Nível 1";
    return "Nível 0";
  };

  const getSignatures = (result: any) => {
    const signatures = [];
    
    if (result.hybridAnalysis) {
      if (result.hybridAnalysis.threat_score > 70) signatures.push("high-threat");
      if (result.hybridAnalysis.environment_id) signatures.push("sandboxed");
    }
    
    if (result.virusTotal) {
      if (result.virusTotal.stats?.malicious > 0) signatures.push("multiple-detections");
      if (result.virusTotal.stats?.suspicious > 0) signatures.push("suspicious-behavior");
    }
    
    if (result.fileName) {
      if (result.fileName.includes('.exe')) signatures.push("executable");
      if (result.fileName.includes('.zip')) signatures.push("archived");
      if (result.fileName.includes('.js')) signatures.push("script");
    }
    
    return signatures.length > 0 ? signatures : ["unknown-sample"];
  };

  const handleAddCase = () => {
    if (!newCaseName.trim()) {
      toast({
        title: "Erro",
        description: "Digite um codinome para o caso",
        variant: "destructive"
      });
      return;
    }

    // Create a mock case entry
    const newCase = {
      fileName: newCaseName + ".unknown",
      fileSize: 0,
      timestamp: new Date().toISOString(),
      userAdded: true,
      caseUrl: newCaseUrl || undefined
    };

    DataManager.saveAnalysisResult(newCase);
    
    // Refresh the cases list
    const savedResults = DataManager.getSavedResults();
    const cases = savedResults.map((result, index) => ({
      id: `CASE-${String(index + 1).padStart(3, '0')}`,
      codename: result.fileName?.replace(/\.[^/.]+$/, "") || `Amostra ${index + 1}`,
      status: (result.hybridAnalysis && result.virusTotal) ? "Analisado" : "Em Análise",
      verdict: getThreatVerdict(result),
      threat: getThreatLevel(result),
      signatures: getSignatures(result),
      timestamp: result.timestamp,
      originalResult: result
    }));
    setRealCases(cases);

    // Clear inputs
    setNewCaseName("");
    setNewCaseUrl("");

    toast({
      title: "Caso Adicionado",
      description: `Caso "${newCaseName}" foi adicionado à mesa de evidências`,
    });
  };

  const getThreatColor = (level: string) => {
    if (level.includes("1")) return "text-neon-green";
    if (level.includes("3")) return "text-neon-orange"; 
    if (level.includes("5")) return "text-neon-red";
    return "text-muted-foreground";
  };

  const getStatusColor = (status: string) => {
    if (status === "Analisado") return "bg-green-500/20 text-neon-green";
    if (status === "Em Análise") return "bg-orange-500/20 text-neon-orange";
    if (status === "Vazio") return "bg-secondary text-muted-foreground";
    return "bg-secondary text-muted-foreground";
  };

  const getVerdictColor = (verdict: string) => {
    if (verdict === "Seguro") return "bg-green-500/20 text-neon-green";
    if (verdict === "Malware") return "bg-red-500/20 text-neon-red";
    if (verdict === "Suspeito") return "bg-orange-500/20 text-neon-orange";
    return "bg-secondary text-muted-foreground";
  };

  const displayCases = realCases.length > 0 ? realCases : [
    {
      id: "EMPTY",
      codename: "Nenhum caso encontrado",
      status: "Vazio",
      verdict: "N/A",
      threat: "N/A",
      signatures: ["empty-table"]
    }
  ];

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
              <Input 
                placeholder="Ex: Cerberus Variant" 
                className="bg-secondary border-border"
                value={newCaseName}
                onChange={(e) => setNewCaseName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Origem (URL)</label>
              <Input 
                placeholder="https://suspicious-site.com/malware.exe" 
                className="bg-secondary border-border"
                value={newCaseUrl}
                onChange={(e) => setNewCaseUrl(e.target.value)}
              />
            </div>
          </div>
          <Button 
            className="mt-4 bg-primary hover:bg-primary/80 text-primary-foreground"
            onClick={handleAddCase}
          >
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
            <span className="text-sm text-muted-foreground">{displayCases.length} resultados</span>
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
                {displayCases.map((case_) => (
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
                      {case_.id !== "EMPTY" ? (
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
                      ) : (
                        <div className="text-muted-foreground text-sm">Execute análises para ver casos</div>
                      )}
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