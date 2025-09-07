import { useState, useEffect } from "react";
import { Settings, Eye, EyeOff, Save, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ApiKeys {
  hybridAnalysis: string;
  virusTotal: string;
}

interface ApiKeyManagerProps {
  onKeysUpdate: (keys: ApiKeys) => void;
}

export default function ApiKeyManager({ onKeysUpdate }: ApiKeyManagerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showKeys, setShowKeys] = useState(false);
  const [keys, setKeys] = useState<ApiKeys>({
    hybridAnalysis: "",
    virusTotal: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load keys from localStorage
    const savedKeys = {
      hybridAnalysis: localStorage.getItem('hybridAnalysisKey') || '',
      virusTotal: localStorage.getItem('virusTotalKey') || ''
    };
    setKeys(savedKeys);
    onKeysUpdate(savedKeys);
  }, [onKeysUpdate]);

  const saveKeys = () => {
    localStorage.setItem('hybridAnalysisKey', keys.hybridAnalysis);
    localStorage.setItem('virusTotalKey', keys.virusTotal);
    onKeysUpdate(keys);
    setIsOpen(false);
    toast({
      title: "API Keys Salvas",
      description: "As chaves foram salvas com segurança no navegador.",
    });
  };

  const hasKeys = keys.hybridAnalysis || keys.virusTotal;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`border-border ${hasKeys ? 'border-green-500/50 text-neon-green' : 'border-orange-500/50 text-neon-orange'}`}
        >
          <Settings className="w-4 h-4 mr-2" />
          API Keys {hasKeys ? '✓' : '!'}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="bg-card border-border max-w-md">
        <DialogHeader>
          <DialogTitle className="text-neon-cyan">Configurar API Keys</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-neon-orange" />
              <span className="text-sm font-medium text-neon-orange">Aviso de Segurança</span>
            </div>
            <p className="text-xs text-muted-foreground">
              As chaves ficam salvas no localStorage. Para produção, recomendamos usar Supabase.
            </p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium mb-2">Hybrid Analysis API Key</label>
              <div className="relative">
                <Input
                  type={showKeys ? "text" : "password"}
                  value={keys.hybridAnalysis}
                  onChange={(e) => setKeys(prev => ({ ...prev, hybridAnalysis: e.target.value }))}
                  placeholder="Digite sua API key do Hybrid Analysis"
                  className="bg-secondary border-border pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setShowKeys(!showKeys)}
                >
                  {showKeys ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">VirusTotal API Key</label>
              <Input
                type={showKeys ? "text" : "password"}
                value={keys.virusTotal}
                onChange={(e) => setKeys(prev => ({ ...prev, virusTotal: e.target.value }))}
                placeholder="Digite sua API key do VirusTotal"
                className="bg-secondary border-border"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsOpen(false)} className="border-border">
              Cancelar
            </Button>
            <Button onClick={saveKeys} className="bg-primary hover:bg-primary/80">
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}