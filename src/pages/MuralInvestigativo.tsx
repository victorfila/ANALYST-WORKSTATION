import { useState, useRef, useEffect } from "react";
import { Plus, Save, Download, Move, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataManager } from "@/utils/dataManager";

interface Node {
  id: string;
  label: string;
  type: string;
  x: number;
  y: number;
  color: string;
}

interface Connection {
  from: string;
  to: string;
  label: string;
}

export default function MuralInvestigativo() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedCase, setSelectedCase] = useState("case");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

  // Load real data and generate nodes/connections
  useEffect(() => {
    const savedResults = DataManager.getSavedResults();
    
    if (savedResults.length === 0) {
      // Show empty state
      setNodes([]);
      setConnections([]);
      return;
    }

    // Generate nodes from real analysis data
    const generatedNodes: Node[] = [];
    const generatedConnections: Connection[] = [];
    
    savedResults.forEach((result, index) => {
      const baseY = 150 + (index * 120);
      const caseId = `case-${index}`;
      
      // Main case node
      generatedNodes.push({
        id: caseId,
        label: result.fileName?.split('.')[0] || `Caso ${index + 1}`,
        type: "case",
        x: 200,
        y: baseY,
        color: "#ef4444"
      });

      // Analysis nodes
      if (result.hybridAnalysis) {
        const hybridId = `hybrid-${index}`;
        generatedNodes.push({
          id: hybridId,
          label: `Hybrid Analysis\nScore: ${result.hybridAnalysis.threat_score || 0}`,
          type: "analysis",
          x: 400,
          y: baseY - 50,
          color: "#8b5cf6"
        });
        
        generatedConnections.push({
          from: caseId,
          to: hybridId,
          label: "analisado por"
        });
      }

      if (result.virusTotal) {
        const vtId = `vt-${index}`;
        const maliciousCount = result.virusTotal.stats?.malicious || 0;
        generatedNodes.push({
          id: vtId,
          label: `VirusTotal\n${maliciousCount} detecções`,
          type: "analysis", 
          x: 400,
          y: baseY + 50,
          color: "#06b6d4"
        });
        
        generatedConnections.push({
          from: caseId,
          to: vtId,
          label: "verificado por"
        });
      }

      // Threat level node
      const threatLevel = getThreatLevel(result);
      if (threatLevel !== "Nível 0") {
        const threatId = `threat-${index}`;
        generatedNodes.push({
          id: threatId,
          label: `Ameaça\n${threatLevel}`,
          type: threatLevel.includes("5") ? "malware" : "evidence",
          x: 600,
          y: baseY,
          color: threatLevel.includes("5") ? "#ef4444" : "#22c55e"
        });
        
        generatedConnections.push({
          from: caseId,
          to: threatId,
          label: "classificado como"
        });
      }
    });

    setNodes(generatedNodes);
    setConnections(generatedConnections);
  }, []);

  const getThreatLevel = (result: any) => {
    if (!result.hybridAnalysis && !result.virusTotal) return "Nível 0";
    
    const hybridThreat = result.hybridAnalysis?.threat_score || 0;
    const vtMalicious = result.virusTotal?.stats?.malicious || 0;
    
    if (hybridThreat > 70 || vtMalicious > 5) return "Nível 5";
    if (hybridThreat > 30 || vtMalicious > 0) return "Nível 3";
    return "Nível 1";
  };

  const getNodeColor = (type: string) => {
    switch (type) {
      case "source": return "#ef4444";
      case "info": return "#22c55e";
      case "file": return "#8b5cf6";
      case "threat": return "#8b5cf6";
      case "analysis": return "#8b5cf6";
      case "case": return "#ef4444";
      case "evidence": return "#06b6d4";
      case "malware": return "#ef4444";
      case "protection": return "#8b5cf6";
      default: return "#64748b";
    }
  };

  return (
    <div className="min-h-screen bg-background bg-cyber-grid">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-neon-cyan mb-2">Mural Investigativo</h1>
          <p className="text-muted-foreground">Mapa mental interativo para visualizar conexões entre ameaças</p>
        </div>

        {/* Controls */}
        <div className="card-cyber p-4 rounded-lg mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Select value={selectedCase} onValueChange={setSelectedCase}>
                <SelectTrigger className="w-40 bg-secondary border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="case">Case</SelectItem>
                  <SelectItem value="all">Todos os Casos</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-sm text-muted-foreground">Rótulo do nó</div>
              <Button size="sm" className="bg-primary hover:bg-primary/80">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Nó
              </Button>
              <div className="text-sm text-muted-foreground">Rótulo da conexão</div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" className="border-border">
                <Save className="w-4 h-4 mr-2" />
                Salvar
              </Button>
              <Button size="sm" variant="outline" className="border-border">
                <Download className="w-4 h-4 mr-2" />
                Exportar
              </Button>
            </div>
          </div>
        </div>

        {/* Graph Canvas */}
        <div className="card-cyber p-4 rounded-lg relative" style={{ height: "600px" }}>
          {nodes.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="text-6xl text-muted-foreground mb-4">🕸️</div>
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">Mural Vazio</h3>
                <p className="text-sm text-muted-foreground mb-4">Execute análises para ver conexões entre ameaças</p>
                <Button variant="outline" className="border-border">
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Primeiro Nó
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="absolute top-4 right-4 z-10 flex items-center space-x-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setZoom(prev => Math.min(prev + 0.1, 2))}
                  className="border-border"
                >
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => setZoom(prev => Math.max(prev - 0.1, 0.5))}
                  className="border-border"
                >
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </div>

              <svg
                ref={svgRef}
                className="w-full h-full overflow-visible"
                style={{ 
                  transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`,
                  cursor: "grab"
                }}
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="10"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon
                      points="0 0, 10 3.5, 0 7"
                      fill="#06b6d4"
                      opacity="0.8"
                    />
                  </marker>
                </defs>

                {/* Connections */}
                {connections.map((conn, idx) => {
                  const fromNode = nodes.find(n => n.id === conn.from);
                  const toNode = nodes.find(n => n.id === conn.to);
                  if (!fromNode || !toNode) return null;

                  const midX = (fromNode.x + toNode.x) / 2;
                  const midY = (fromNode.y + toNode.y) / 2;

                  return (
                    <g key={idx}>
                      <line
                        x1={fromNode.x}
                        y1={fromNode.y}
                        x2={toNode.x}
                        y2={toNode.y}
                        stroke="#06b6d4"
                        strokeWidth="2"
                        opacity="0.6"
                        markerEnd="url(#arrowhead)"
                      />
                      <text
                        x={midX}
                        y={midY - 10}
                        fill="#06b6d4"
                        fontSize="10"
                        textAnchor="middle"
                        className="text-xs font-mono"
                      >
                        {conn.label}
                      </text>
                    </g>
                  );
                })}

                {/* Nodes */}
                {nodes.map((node) => (
                  <g key={node.id} className="cursor-pointer hover:opacity-80">
                    <rect
                      x={node.x - 60}
                      y={node.y - 25}
                      width="120"
                      height="50"
                      rx="8"
                      fill={node.color}
                      fillOpacity="0.2"
                      stroke={node.color}
                      strokeWidth="2"
                      className="hover:fill-opacity-30 transition-all"
                    />
                    <text
                      x={node.x}
                      y={node.y}
                      fill={node.color}
                      fontSize="11"
                      textAnchor="middle"
                      className="font-medium pointer-events-none"
                    >
                      {node.label.split('\n').map((line, idx) => (
                        <tspan key={idx} x={node.x} dy={idx === 0 ? 0 : 12}>
                          {line}
                        </tspan>
                      ))}
                    </text>
                  </g>
                ))}
              </svg>
            </>
          )}
        </div>

        {/* Legend */}
        <div className="card-cyber p-4 rounded-lg mt-6">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">Legenda</h4>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-red-500"></div>
              <span className="text-xs text-muted-foreground">Fonte/Malware</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-xs text-muted-foreground">Análise/Proteção</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-cyan-500"></div>
              <span className="text-xs text-muted-foreground">Evidência</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-xs text-muted-foreground">Informação</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}