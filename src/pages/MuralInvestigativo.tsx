import { useState, useRef, useEffect } from "react";
import { Plus, Save, Download, Move, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const initialNodes: Node[] = [
  { id: "youtube1", label: "YouTube 70%\nInscrito", type: "source", x: 50, y: 300, color: "#ef4444" },
  { id: "monetizacao", label: "Monetização\nClickbait", type: "info", x: 200, y: 400, color: "#22c55e" },
  { id: "zip", label: "ZIP Protegido\nSenha: cheat123", type: "file", x: 500, y: 250, color: "#8b5cf6" },
  { id: "js-obfuscated", label: "Javascript\nOfuscado (3\nCamadas)", type: "threat", x: 750, y: 200, color: "#8b5cf6" },
  { id: "bytes", label: "Bytes\nrecolocados antes", type: "analysis", x: 450, y: 350, color: "#8b5cf6" },
  { id: "cheat-yt2", label: "CASE-002 Cheat\nYouTube 2", type: "case", x: 600, y: 320, color: "#ef4444" },
  { id: "token", label: "Token de\ncredencial\nextraído", type: "evidence", x: 600, y: 500, color: "#06b6d4" },
  { id: "rhadamanthys", label: "Rhadamanthys\nInfo Stealer", type: "malware", x: 800, y: 650, color: "#ef4444" },
  { id: "anti-debug", label: "Anti-\ndesofuscação ativa", type: "protection", x: 1000, y: 400, color: "#8b5cf6" }
];

const initialConnections: Connection[] = [
  { from: "youtube1", to: "monetizacao", label: "clickbait" },
  { from: "monetizacao", to: "zip", label: "download" }, 
  { from: "zip", to: "js-obfuscated", label: "extração" },
  { from: "js-obfuscated", to: "bytes", label: "relaciona a" },
  { from: "bytes", to: "cheat-yt2", label: "relaciona a" },
  { from: "cheat-yt2", to: "token", label: "acesso para token da" },
  { from: "token", to: "rhadamanthys", label: "dados payload" },
  { from: "js-obfuscated", to: "anti-debug", label: "relaciona a" }
];

export default function MuralInvestigativo() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [connections] = useState<Connection[]>(initialConnections);
  const [selectedCase, setSelectedCase] = useState("case");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const svgRef = useRef<SVGSVGElement>(null);

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