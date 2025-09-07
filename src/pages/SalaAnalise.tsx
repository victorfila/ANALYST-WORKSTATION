import { useState } from "react";
import { Search, Play, Pause, Download, Upload, FileText, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

export default function SalaAnalise() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setProgress(0);
    
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsAnalyzing(false);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background bg-cyber-grid">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neon-purple mb-2">Sala de Análise</h1>
          <p className="text-muted-foreground">Ambiente seguro para análise de ameaças</p>
        </div>

        {/* Analysis Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Sample Upload */}
          <div className="card-cyber p-6 rounded-lg">
            <h3 className="text-lg font-semibold text-neon-orange mb-4">Carregar Amostra</h3>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors">
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Arraste um arquivo ou clique para selecionar</p>
                <Button variant="outline" className="border-border">
                  Selecionar Arquivo
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Hash MD5</label>
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
                  disabled={isAnalyzing}
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
                
                <Button variant="outline" className="border-border">
                  <Download className="w-4 h-4 mr-2" />
                  Relatório
                </Button>
              </div>

              {isAnalyzing && (
                <div className="mt-4 p-3 bg-secondary/50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Zap className="w-4 h-4 text-neon-cyan animate-pulse" />
                    <span className="text-sm font-medium">Análise em Andamento</span>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div>✓ Verificação de assinatura</div>
                    <div>✓ Análise estática</div>
                    <div className="text-neon-cyan">→ Análise comportamental</div>
                    <div className="opacity-50">- Análise de rede</div>
                    <div className="opacity-50">- Geração de relatório</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
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

        {/* Report Section */}
        <div className="card-cyber p-6 rounded-lg mt-6">
          <h3 className="text-lg font-semibold text-neon-purple mb-4">Relatório de Análise</h3>
          <Textarea
            placeholder="Notas e observações da análise..."
            className="min-h-32 bg-secondary border-border resize-none"
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