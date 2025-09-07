import { useState, useRef, useEffect } from "react";
import { Search, Play, Pause, Download, Upload, FileText, Zap, AlertTriangle, ExternalLink, Shield, Trash2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import ApiKeyManager from "@/components/analysis/ApiKeyManager";
import { analysisService } from "@/services/analysisService";
import { DataManager } from "@/utils/dataManager";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface AnalysisResult {
  hybridAnalysis?: any;
  virusTotal?: any;
  fileName: string;
  fileSize: number;
  hash?: string;
}

export default function SalaAnalise() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [apiKeysConfigured, setApiKeysConfigured] = useState(false);
  const [savedResults, setSavedResults] = useState<any[]>([]);
  const [userNotes, setUserNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Load saved data on component mount
  useEffect(() => {
    setSavedResults(DataManager.getSavedResults());
    setUserNotes(DataManager.getNotes());
  }, []);

  const handleApiKeysUpdate = (keys: { hybridAnalysis: string; virusTotal: string }) => {
    analysisService.setApiKeys(keys.hybridAnalysis, keys.virusTotal);
    setApiKeysConfigured(!!keys.hybridAnalysis || !!keys.virusTotal);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setAnalysisResult(null);
      toast({
        title: "Arquivo Selecionado",
        description: `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`,
      });
    }
  };

  const startAnalysis = async () => {
    if (!selectedFile) {
      toast({
        title: "Erro",
        description: "Selecione um arquivo para análise",
        variant: "destructive"
      });
      return;
    }

    if (!apiKeysConfigured) {
      toast({
        title: "Erro", 
        description: "Configure pelo menos uma API key para continuar",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const results: any = {
        fileName: selectedFile.name,
        fileSize: selectedFile.size
      };

      // Submit to both APIs
      try {
        const hybridSubmission = await analysisService.submitToHybridAnalysis(selectedFile);
        results.hybridAnalysis = hybridSubmission;
        toast({
          title: "Hybrid Analysis",
          description: "Arquivo enviado com sucesso!",
        });
      } catch (error) {
        console.warn('Hybrid Analysis failed:', error);
      }

      try {
        const vtSubmission = await analysisService.submitToVirusTotal(selectedFile);
        results.virusTotal = vtSubmission;
        toast({
          title: "VirusTotal", 
          description: "Arquivo enviado com sucesso!",
        });
      } catch (error) {
        console.warn('VirusTotal failed:', error);
      }

      clearInterval(progressInterval);
      setProgress(100);
      setAnalysisResult(results);
      
      // Save analysis result
      DataManager.saveAnalysisResult(results);
      setSavedResults(DataManager.getSavedResults());
      
      toast({
        title: "Análise Iniciada",
        description: "O arquivo foi enviado para análise. Os resultados aparecerão em breve.",
      });

    } catch (error: any) {
      toast({
        title: "Erro na Análise",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getThreatLevel = (score?: number) => {
    if (!score) return { level: "Desconhecido", color: "text-muted-foreground" };
    if (score <= 30) return { level: "Baixo", color: "text-neon-green" };
    if (score <= 70) return { level: "Médio", color: "text-neon-orange" };
    return { level: "Alto", color: "text-neon-red" };
  };

  const handleDownloadData = () => {
    DataManager.downloadData();
    toast({
      title: "Download Iniciado",
      description: "Os dados estão sendo baixados como arquivo JSON.",
    });
  };

  const handleClearAllData = () => {
    DataManager.clearAllData();
    
    // Reset component state
    setSelectedFile(null);
    setAnalysisResult(null);
    setApiKeysConfigured(false);
    setSavedResults([]);
    setUserNotes("");
    setProgress(0);
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    
    toast({
      title: "Dados Limpos",
      description: "Todos os dados foram removidos do sistema. Painel zerado.",
    });
  };

  const handleNotesChange = (notes: string) => {
    setUserNotes(notes);
    DataManager.saveNotes(notes);
  };

  return (
    <div className="min-h-screen bg-background bg-cyber-grid">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-neon-purple mb-2">Sala de Análise</h1>
              <p className="text-muted-foreground">Ambiente seguro para análise de ameaças</p>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleDownloadData}
                variant="outline"
                size="sm"
                className="border-border text-neon-cyan"
              >
                <Database className="w-4 h-4 mr-2" />
                Baixar Dados
              </Button>
              
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
                    <AlertDialogTitle className="text-neon-red">Confirmar Limpeza</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta ação irá remover permanentemente:
                      <ul className="list-disc list-inside mt-2 space-y-1">
                        <li>Todas as API keys salvas</li>
                        <li>Histórico de análises</li>
                        <li>Notas e relatórios</li>
                        <li>Configurações do painel</li>
                      </ul>
                      <p className="mt-2 text-neon-orange">Esta ação não pode ser desfeita!</p>
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
              
              <ApiKeyManager onKeysUpdate={handleApiKeysUpdate} />
            </div>
          </div>
        </div>

        {/* Analysis Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sample Upload */}
          <div className="card-cyber p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-neon-orange mb-4">Carregar Amostra</h3>
            <div className="space-y-4">
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                {selectedFile ? (
                  <div>
                    <p className="text-foreground mb-2">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                ) : (
                  <p className="text-muted-foreground mb-2">Arraste um arquivo ou clique para selecionar</p>
                )}
                <Button variant="outline" className="border-border mt-2">
                  Selecionar Arquivo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileSelect}
                  className="hidden"
                  accept=".exe,.dll,.zip,.rar,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hash MD5/SHA256</label>
                  <Input placeholder="Opcional" className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Prioridade</label>
                  <select className="w-full h-10 px-3 rounded-md bg-secondary border border-border text-foreground">
                    <option>Normal</option>
                    <option>Alta</option>
                    <option>Crítica</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Analysis Status */}
          <div className="card-cyber p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-neon-green mb-4">Status da Análise</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Progresso</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={startAnalysis}
                  disabled={isAnalyzing || !selectedFile}
                  className="bg-primary hover:bg-primary/80"
                >
                  {isAnalyzing ? (
                    <>
                      <Pause className="w-4 h-4 mr-2" />
                      Analisando...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Iniciar Análise
                    </>
                  )}
                </Button>
                
                <Button variant="outline" className="border-border" disabled={!analysisResult}>
                  <Download className="w-4 h-4 mr-2" />
                  Relatório
                </Button>
              </div>

              {!apiKeysConfigured && (
                <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-neon-orange" />
                    <span className="text-sm text-neon-orange">Configure as API keys para iniciar a análise</span>
                  </div>
                </div>
              )}

              {isAnalyzing && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-neon-cyan animate-pulse" />
                    <span className="text-sm font-medium">Análise em Andamento</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>✓ Upload para Hybrid Analysis</div>
                    <div>✓ Upload para VirusTotal</div>
                    <div className="text-neon-cyan">→ Aguardando resultados</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {analysisResult && (
          <div className="card-cyber p-6 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-neon-cyan mb-4">Resultados da Análise</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Hybrid Analysis Results */}
              {analysisResult.hybridAnalysis && (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-neon-orange">Hybrid Analysis</h4>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Job ID:</span>
                      <span className="text-sm font-mono">{analysisResult.hybridAnalysis.job_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">SHA256:</span>
                      <span className="text-xs font-mono">{analysisResult.hybridAnalysis.sha256?.substring(0, 16)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge className="bg-orange-500/20 text-neon-orange">Em Análise</Badge>
                    </div>
                  </div>
                </div>
              )}

              {/* VirusTotal Results */}
              {analysisResult.virusTotal && (
                <div className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-neon-green">VirusTotal</h4>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Analysis ID:</span>
                      <span className="text-xs font-mono">{analysisResult.virusTotal.data?.id?.substring(0, 16)}...</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Status:</span>
                      <Badge className="bg-green-500/20 text-neon-green">Enviado</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Static Analysis Results (Mock Data) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Static Analysis */}
          <div className="card-cyber p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-neon-cyan mb-4">Análise Estática</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Entropia</span>
                <span className="text-sm text-neon-green">7.2/8.0</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Seções suspeitas</span>
                <span className="text-sm text-neon-orange">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Imports perigosos</span>
                <span className="text-sm text-neon-red">5</span>
              </div>
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Strings Suspeitas</div>
                <div className="bg-secondary/50 p-2 rounded text-xs font-mono">
                  <div>GetProcAddress</div>
                  <div>VirtualAlloc</div>
                  <div>WriteProcessMemory</div>
                </div>
              </div>
            </div>
          </div>

          {/* Behavioral Analysis */}
          <div className="card-cyber p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-neon-orange mb-4">Análise Comportamental</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Modificação de registro</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <span className="text-sm">Injeção de processo</span>  
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <span className="text-sm">Conexão de rede</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-sm">Criação de arquivo</span>
              </div>
            </div>
          </div>

          {/* Network Analysis */}
          <div className="card-cyber p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-neon-green mb-4">Análise de Rede</h3>
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium mb-1">Conexões C&C</div>
                <div className="bg-secondary/50 p-2 rounded text-xs font-mono">
                  <div>185.159.158.167:8080</div>
                  <div>malicious-domain.com</div>
                </div>
              </div>
              <div className="text-sm">
                <div className="font-medium mb-1">DNS Queries</div>
                <div className="bg-secondary/50 p-2 rounded text-xs font-mono">
                  <div>checkip.amazonaws.com</div>
                  <div>api.telegram.org</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Saved Results History */}
        {savedResults.length > 0 && (
          <div className="card-cyber p-6 rounded-lg mt-6">
            <h3 className="text-lg font-semibold text-neon-cyan mb-4">Histórico de Análises ({savedResults.length})</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {savedResults.slice(-5).reverse().map((result, index) => (
                <div key={result.id || index} className="bg-secondary/30 p-3 rounded border border-border">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">{result.fileName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(result.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {(result.fileSize / 1024 / 1024).toFixed(2)} MB
                    {result.hybridAnalysis && <span className="ml-2 text-neon-orange">HA ✓</span>}
                    {result.virusTotal && <span className="ml-2 text-neon-green">VT ✓</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Report Section */}
        <div className="card-cyber p-6 rounded-lg mt-6">
          <h3 className="text-lg font-semibold text-neon-purple mb-4">Relatório de Análise</h3>
          <Textarea
            placeholder="Notas e observações da análise..."
            className="min-h-32 bg-secondary border-border resize-none"
            value={userNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
          />
          <div className="flex justify-end mt-4 space-x-2">
            <Button variant="outline" className="border-border">
              <FileText className="w-4 h-4 mr-2" />
              Salvar Rascunho
            </Button>
            <Button className="bg-primary hover:bg-primary/80">
              <Download className="w-4 h-4 mr-2" />
              Gerar Relatório
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}