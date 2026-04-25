import { useEffect, useState } from "react";
import {
  Background,
  Controls,
  Handle,
  MiniMap,
  Position,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowRight,
  Bot,
  Brain,
  Database,
  FileJson,
  FileText,
  GitBranch,
  Globe2,
  LibraryBig,
  MessageSquareText,
  Network,
  Plus,
  Router,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { AutoExpandingTextarea } from "@/components/ui/auto-expanding-textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

type BuilderNodeData = {
  kind: string;
  title: string;
  subtitle: string;
  config: Record<string, string>;
};

type Template = {
  kind: string;
  title: string;
  subtitle: string;
  accent: string;
  icon: typeof MessageSquareText;
  defaults: Record<string, string>;
};

const STORAGE_KEY = "agentfield_builder_draft_v1";

const templates: Template[] = [
  {
    kind: "input",
    title: "Input",
    subtitle: "User request or trigger",
    accent: "from-sky-500/30 to-cyan-500/10",
    icon: MessageSquareText,
    defaults: {
      mode: "chat",
      schema: "freeform",
    },
  },
  {
    kind: "prompt",
    title: "Prompt",
    subtitle: "System prompt and routing hints",
    accent: "from-violet-500/30 to-fuchsia-500/10",
    icon: FileText,
    defaults: {
      style: "structured",
      registry_key: "default.prompt",
    },
  },
  {
    kind: "model",
    title: "Model",
    subtitle: "Provider, model, and temperature",
    accent: "from-amber-500/30 to-orange-500/10",
    icon: Bot,
    defaults: {
      provider: "autonomyx",
      model: "runner/default",
      temperature: "0.2",
    },
  },
  {
    kind: "gateway",
    title: "Model gateway",
    subtitle: "LiteLLM-style unified model access",
    accent: "from-cyan-500/30 to-sky-500/10",
    icon: Globe2,
    defaults: {
      endpoint: "http://localhost:4000",
      strategy: "fallback",
      budget_policy: "team-default",
    },
  },
  {
    kind: "tool",
    title: "Tool",
    subtitle: "HTTP, MCP, or internal capability",
    accent: "from-emerald-500/30 to-lime-500/10",
    icon: Wrench,
    defaults: {
      skill: "registry.lookup",
      timeout_ms: "15000",
    },
  },
  {
    kind: "registry",
    title: "Registry",
    subtitle: "Prompt, skill, model, and tool catalog",
    accent: "from-lime-500/30 to-emerald-500/10",
    icon: LibraryBig,
    defaults: {
      source: "central-registry",
      lookup: "prompt+skill+model",
    },
  },
  {
    kind: "memory",
    title: "Memory",
    subtitle: "Working, episodic, and profile memory",
    accent: "from-pink-500/30 to-rose-500/10",
    icon: Brain,
    defaults: {
      mode: "hybrid",
      namespace: "session",
    },
  },
  {
    kind: "guardrail",
    title: "Guardrail",
    subtitle: "Policy, moderation, and validation",
    accent: "from-red-500/30 to-orange-500/10",
    icon: ShieldCheck,
    defaults: {
      policy: "default-safety",
      action: "block",
    },
  },
  {
    kind: "agent-registry",
    title: "Agent registry",
    subtitle: "Discover target agents and capabilities",
    accent: "from-blue-500/30 to-indigo-500/10",
    icon: Database,
    defaults: {
      source: "agentfield",
      selector: "capability-match",
    },
  },
  {
    kind: "routing",
    title: "Dynamic routing",
    subtitle: "Cost, latency, and health-based routing",
    accent: "from-indigo-500/30 to-sky-500/10",
    icon: Router,
    defaults: {
      strategy: "latency-aware",
      fallback: "enabled",
      signal: "cost+health+sla",
    },
  },
  {
    kind: "decision",
    title: "Decision",
    subtitle: "Evaluator branch and score gate",
    accent: "from-fuchsia-500/30 to-violet-500/10",
    icon: GitBranch,
    defaults: {
      strategy: "score-and-route",
      threshold: "0.75",
    },
  },
  {
    kind: "output",
    title: "Output",
    subtitle: "Response, artifact, or event",
    accent: "from-slate-500/30 to-zinc-500/10",
    icon: Database,
    defaults: {
      format: "markdown",
      emit: "response",
    },
  },
];

const templateByKind = Object.fromEntries(templates.map((template) => [template.kind, template]));

const starterNodes: Node<BuilderNodeData>[] = [
  createNode("input", { x: 0, y: 100 }),
  createNode("registry", { x: 220, y: 0 }),
  createNode("prompt", { x: 260, y: 180 }),
  createNode("gateway", { x: 520, y: 180 }),
  createNode("routing", { x: 780, y: 180 }),
  createNode("model", { x: 1040, y: 0 }),
  createNode("agent-registry", { x: 1040, y: 180 }),
  createNode("tool", { x: 1040, y: 360 }),
  createNode("memory", { x: 1300, y: 100 }),
  createNode("guardrail", { x: 1560, y: 180 }),
  createNode("output", { x: 1820, y: 180 }),
];

const starterEdges: Edge[] = [
  edge("input", "registry"),
  edge("registry", "prompt"),
  edge("prompt", "model"),
  edge("prompt", "gateway"),
  edge("gateway", "routing"),
  edge("routing", "model"),
  edge("routing", "agent-registry"),
  edge("routing", "tool"),
  edge("model", "memory"),
  edge("agent-registry", "memory"),
  edge("tool", "guardrail"),
  edge("memory", "guardrail"),
  edge("guardrail", "output"),
];

const nodeTypes = {
  builder: BuilderNode,
};

export function BuilderPage() {
  return (
    <ReactFlowProvider>
      <BuilderCanvasPage />
    </ReactFlowProvider>
  );
}

function BuilderCanvasPage() {
  const [flowName, setFlowName] = useState("AgentField orchestration flow");
  const [flowGoal, setFlowGoal] = useState("Route user requests through prompt, model, tool, memory, and guardrails.");
  const [nodes, setNodes] = useState<Node<BuilderNodeData>[]>(starterNodes);
  const [edges, setEdges] = useState<Edge[]>(starterEdges);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(starterNodes[0]?.id ?? null);
  const [copiedFormat, setCopiedFormat] = useState<"json" | "yaml" | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        return;
      }

      const parsed = JSON.parse(saved) as {
        flowName?: string;
        flowGoal?: string;
        nodes?: Node<BuilderNodeData>[];
        edges?: Edge[];
        selectedNodeId?: string | null;
      };

      if (parsed.flowName) {
        setFlowName(parsed.flowName);
      }
      if (parsed.flowGoal) {
        setFlowGoal(parsed.flowGoal);
      }
      if (parsed.nodes?.length) {
        setNodes(parsed.nodes);
      }
      if (parsed.edges?.length) {
        setEdges(parsed.edges);
      }
      if (parsed.selectedNodeId) {
        setSelectedNodeId(parsed.selectedNodeId);
      }
    } catch {
      // Ignore malformed local drafts and fall back to starter state.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ flowName, flowGoal, nodes, edges, selectedNodeId }),
    );
  }, [edges, flowGoal, flowName, nodes, selectedNodeId]);

  const selectedNode = nodes.find((node) => node.id === selectedNodeId) ?? null;
  const exportJson = JSON.stringify(buildExportModel(flowName, flowGoal, nodes, edges), null, 2);
  const exportYaml = buildYaml(flowName, flowGoal, nodes, edges);

  function handleNodesChange(changes: NodeChange<Node<BuilderNodeData>>[]) {
    setNodes((current) => applyNodeChanges(changes, current));
  }

  function handleEdgesChange(changes: EdgeChange<Edge>[]) {
    setEdges((current) => applyEdgeChanges(changes, current));
  }

  function handleConnect(connection: Connection) {
    setEdges((current) =>
      addEdge(
        {
          ...connection,
          id: `${connection.source}-${connection.target}-${current.length + 1}`,
          animated: true,
        },
        current,
      ),
    );
  }

  function handleAddNode(kind: string) {
    const nextIndex = nodes.length + 1;
    const template = templateByKind[kind];
    if (!template) {
      return;
    }

    const node = createNode(kind, {
      x: 120 + (nextIndex % 3) * 280,
      y: 80 + Math.floor(nextIndex / 3) * 180,
    }, nextIndex);

    setNodes((current) => [...current, node]);
    setSelectedNodeId(node.id);
  }

  function handleReset() {
    setFlowName("AgentField orchestration flow");
    setFlowGoal("Route user requests through prompt, model, tool, memory, and guardrails.");
    setNodes(starterNodes);
    setEdges(starterEdges);
    setSelectedNodeId(starterNodes[0]?.id ?? null);
  }

  function handleDuplicateSelected() {
    if (!selectedNode) {
      return;
    }

    const nextIndex = nodes.length + 1;
    const duplicated: Node<BuilderNodeData> = {
      ...selectedNode,
      id: `${selectedNode.data.kind}-${nextIndex}`,
      position: {
        x: selectedNode.position.x + 48,
        y: selectedNode.position.y + 48,
      },
      data: {
        ...selectedNode.data,
        title: `${selectedNode.data.title} ${nextIndex}`,
        config: { ...selectedNode.data.config },
      },
      selected: false,
    };

    setNodes((current) => [...current, duplicated]);
    setSelectedNodeId(duplicated.id);
  }

  function handleDeleteSelected() {
    if (!selectedNodeId) {
      return;
    }

    const remainingNodes = nodes.filter((node) => node.id !== selectedNodeId);
    const remainingEdges = edges.filter(
      (edgeItem) => edgeItem.source !== selectedNodeId && edgeItem.target !== selectedNodeId,
    );

    setNodes(remainingNodes);
    setEdges(remainingEdges);
    setSelectedNodeId(remainingNodes[0]?.id ?? null);
  }

  function updateSelectedNode(field: "title" | "subtitle", value: string) {
    if (!selectedNodeId) {
      return;
    }

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                [field]: value,
              },
            }
          : node,
      ),
    );
  }

  function updateSelectedNodeConfig(key: string, value: string) {
    if (!selectedNodeId) {
      return;
    }

    setNodes((current) =>
      current.map((node) =>
        node.id === selectedNodeId
          ? {
              ...node,
              data: {
                ...node.data,
                config: {
                  ...node.data.config,
                  [key]: value,
                },
              },
            }
          : node,
      ),
    );
  }

  async function copyExport(format: "json" | "yaml") {
    const value = format === "json" ? exportJson : exportYaml;
    await navigator.clipboard.writeText(value);
    setCopiedFormat(format);
    window.setTimeout(() => {
      setCopiedFormat((current) => (current === format ? null : current));
    }, 1800);
  }

  return (
    <div className="flex h-full min-h-[calc(100svh-8rem)] flex-col gap-6">
      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/60 bg-background/80">
          <CardHeader className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary">Builder</Badge>
              <Badge variant="outline">Langflow-style canvas</Badge>
              <Badge variant="outline">Gateway + registry aware</Badge>
              <Badge variant="outline">AgentField native</Badge>
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl tracking-tight">Visual agent builder</CardTitle>
              <CardDescription className="max-w-3xl text-sm leading-6">
                Compose prompt, model, tool, memory, decision, and guardrail blocks on a live graph.
                The builder keeps a browser draft, lets you tune each node in-place, and exports a flow
                spec with model gateway, guardrail, registry, agent registry, and dynamic routing blocks
                you can wire into the control plane.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-[1fr_1fr_auto]">
            <div className="space-y-2">
              <Label htmlFor="builder-flow-name">Flow name</Label>
              <Input
                id="builder-flow-name"
                value={flowName}
                onChange={(event) => setFlowName(event.target.value)}
                placeholder="AgentField orchestration flow"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="builder-flow-goal">Goal</Label>
              <Input
                id="builder-flow-goal"
                value={flowGoal}
                onChange={(event) => setFlowGoal(event.target.value)}
                placeholder="Describe what this flow is meant to do"
              />
            </div>
            <div className="flex flex-wrap items-end gap-2">
              <Button variant="outline" onClick={handleDuplicateSelected} disabled={!selectedNode}>
                Duplicate
              </Button>
              <Button variant="outline" onClick={handleDeleteSelected} disabled={!selectedNode}>
                Delete
              </Button>
              <Button variant="secondary" onClick={handleReset}>
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Flow signal</CardTitle>
            <CardDescription>Quick readout of the current orchestration draft.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <MetricCard label="Nodes" value={String(nodes.length)} hint="Runnable blocks on canvas" />
            <MetricCard label="Edges" value={String(edges.length)} hint="Data and control connections" />
            <MetricCard
              label="Selected"
              value={selectedNode?.data.title ?? "None"}
              hint={selectedNode?.data.kind ?? "Pick a node to inspect"}
            />
          </CardContent>
        </Card>
      </section>

      <section className="grid min-h-0 flex-1 gap-6 xl:grid-cols-[280px_minmax(0,1fr)_360px]">
        <Card className="min-h-0 border-border/60">
          <CardHeader>
            <CardTitle className="text-base">Node library</CardTitle>
            <CardDescription>Add orchestrator blocks to the canvas.</CardDescription>
          </CardHeader>
          <CardContent className="min-h-0">
            <ScrollArea className="h-[calc(100svh-22rem)] pr-3">
              <div className="grid gap-3">
                {templates.map((template) => {
                  const Icon = template.icon;
                  return (
                    <button
                      key={template.kind}
                      type="button"
                      onClick={() => handleAddNode(template.kind)}
                      className={cn(
                        "group rounded-2xl border border-border/60 bg-card p-4 text-left transition",
                        "hover:border-primary/40 hover:bg-accent/40",
                      )}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div
                          className={cn(
                            "flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br",
                            template.accent,
                          )}
                        >
                          <Icon className="size-5" />
                        </div>
                        <Plus className="size-4 text-muted-foreground transition group-hover:text-foreground" />
                      </div>
                      <div className="mt-4 space-y-1">
                        <p className="font-medium tracking-tight">{template.title}</p>
                        <p className="text-sm leading-5 text-muted-foreground">{template.subtitle}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="min-h-0 overflow-hidden border-border/60">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <CardTitle className="text-base">Canvas</CardTitle>
                <CardDescription>Drag blocks, connect handles, and shape the agent pipeline.</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1">
                <Network className="size-3.5" />
                Visual flow
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="h-[calc(100svh-22rem)] p-0">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={handleNodesChange}
              onEdgesChange={handleEdgesChange}
              onConnect={handleConnect}
              onNodeClick={(_, node) => setSelectedNodeId(node.id)}
              fitView
              className="bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.12),_transparent_35%),linear-gradient(180deg,rgba(15,23,42,0.18),transparent)]"
            >
              <Background gap={24} size={1.2} color="rgba(148, 163, 184, 0.20)" />
              <MiniMap
                pannable
                zoomable
                nodeBorderRadius={12}
                className="!border-border/60 !bg-background/90"
              />
              <Controls className="!bg-background/95" />
            </ReactFlow>
          </CardContent>
        </Card>

        <div className="grid min-h-0 gap-6">
          <Card className="min-h-0 border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Inspector</CardTitle>
              <CardDescription>Configure the currently selected block.</CardDescription>
            </CardHeader>
            <CardContent>
              {!selectedNode ? (
                <div className="rounded-2xl border border-dashed border-border/70 px-4 py-8 text-sm text-muted-foreground">
                  Select a node on the canvas to edit its title, role, and runtime config.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="builder-selected-title">Title</Label>
                    <Input
                      id="builder-selected-title"
                      value={selectedNode.data.title}
                      onChange={(event) => updateSelectedNode("title", event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="builder-selected-subtitle">Subtitle</Label>
                    <Input
                      id="builder-selected-subtitle"
                      value={selectedNode.data.subtitle}
                      onChange={(event) => updateSelectedNode("subtitle", event.target.value)}
                    />
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/30 px-3 py-2">
                    <span className="text-sm text-muted-foreground">Block type</span>
                    <Badge variant="outline">{selectedNode.data.kind}</Badge>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <p className="text-sm font-medium">Config</p>
                    {Object.entries(selectedNode.data.config).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <Label htmlFor={`${selectedNode.id}-${key}`}>{humanize(key)}</Label>
                        <Input
                          id={`${selectedNode.id}-${key}`}
                          value={value}
                          onChange={(event) => updateSelectedNodeConfig(key, event.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="min-h-0 border-border/60">
            <CardHeader>
              <CardTitle className="text-base">Export</CardTitle>
              <CardDescription>Copy the builder state as JSON or YAML.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="json" className="w-full">
                <div className="flex items-center justify-between gap-2">
                  <TabsList>
                    <TabsTrigger value="json">JSON</TabsTrigger>
                    <TabsTrigger value="yaml">YAML</TabsTrigger>
                  </TabsList>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => copyExport("json")}>
                      <FileJson className="mr-2 size-4" />
                      {copiedFormat === "json" ? "Copied" : "Copy JSON"}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => copyExport("yaml")}>
                      <FileText className="mr-2 size-4" />
                      {copiedFormat === "yaml" ? "Copied" : "Copy YAML"}
                    </Button>
                  </div>
                </div>
                <TabsContent value="json" className="mt-4">
                  <AutoExpandingTextarea
                    value={exportJson}
                    readOnly
                    className="min-h-[240px] font-mono text-xs"
                  />
                </TabsContent>
                <TabsContent value="yaml" className="mt-4">
                  <AutoExpandingTextarea
                    value={exportYaml}
                    readOnly
                    className="min-h-[240px] font-mono text-xs"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}

function BuilderNode({ data, selected }: NodeProps) {
  const builderData = data as BuilderNodeData;
  const template = templateByKind[builderData.kind];
  const Icon = template?.icon ?? Network;

  return (
    <div
      className={cn(
        "min-w-[220px] rounded-3xl border bg-card/95 p-4 shadow-lg backdrop-blur",
        selected ? "border-primary shadow-primary/20" : "border-border/70",
      )}
    >
      <Handle type="target" position={Position.Left} className="!size-3 !border-2 !border-background !bg-primary" />
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex size-11 items-center justify-center rounded-2xl border border-white/10 bg-gradient-to-br",
            template?.accent ?? "from-slate-500/30 to-zinc-500/10",
          )}
        >
          <Icon className="size-5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-semibold tracking-tight">{builderData.title}</p>
            <Badge variant="secondary" className="shrink-0 capitalize">
              {builderData.kind}
            </Badge>
          </div>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
            {builderData.subtitle}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-2 rounded-2xl border border-border/60 bg-muted/25 p-3 text-xs text-muted-foreground">
        {Object.entries(builderData.config)
          .slice(0, 2)
          .map(([key, value]) => (
            <div key={key} className="flex items-center justify-between gap-3">
              <span className="truncate">{humanize(key)}</span>
              <span className="truncate font-medium text-foreground/90">{value}</span>
            </div>
          ))}
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>Flow</span>
        <ArrowRight className="size-3.5" />
      </div>
      <Handle type="source" position={Position.Right} className="!size-3 !border-2 !border-background !bg-primary" />
    </div>
  );
}

function MetricCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{hint}</p>
    </div>
  );
}

function createNode(kind: string, position: { x: number; y: number }, index?: number): Node<BuilderNodeData> {
  const template = templateByKind[kind];
  const resolvedIndex = index ?? templates.findIndex((item) => item.kind === kind) + 1;

  return {
    id: `${kind}-${resolvedIndex}`,
    type: "builder",
    position,
    data: {
      kind,
      title: template?.title ?? "Node",
      subtitle: template?.subtitle ?? "Builder node",
      config: { ...(template?.defaults ?? {}) },
    },
  };
}

function edge(sourceKind: string, targetKind: string): Edge {
  return {
    id: `${sourceKind}-${targetKind}`,
    source: `${sourceKind}-${templates.findIndex((item) => item.kind === sourceKind) + 1}`,
    target: `${targetKind}-${templates.findIndex((item) => item.kind === targetKind) + 1}`,
    animated: true,
  };
}

function buildExportModel(
  flowName: string,
  flowGoal: string,
  nodes: Node<BuilderNodeData>[],
  edges: Edge[],
) {
  return {
    name: flowName,
    goal: flowGoal,
    version: "builder/v1",
    nodes: nodes.map((node) => ({
      id: node.id,
      kind: node.data.kind,
      title: node.data.title,
      subtitle: node.data.subtitle,
      config: node.data.config,
      position: node.position,
    })),
    edges: edges.map((edgeItem) => ({
      id: edgeItem.id,
      source: edgeItem.source,
      target: edgeItem.target,
    })),
  };
}

function buildYaml(
  flowName: string,
  flowGoal: string,
  nodes: Node<BuilderNodeData>[],
  edges: Edge[],
) {
  const lines = [
    `name: "${escapeYaml(flowName)}"`,
    `goal: "${escapeYaml(flowGoal)}"`,
    `version: "builder/v1"`,
    "nodes:",
  ];

  for (const node of nodes) {
    lines.push(`  - id: "${escapeYaml(node.id)}"`);
    lines.push(`    kind: "${escapeYaml(node.data.kind)}"`);
    lines.push(`    title: "${escapeYaml(node.data.title)}"`);
    lines.push(`    subtitle: "${escapeYaml(node.data.subtitle)}"`);
    lines.push("    config:");
    for (const [key, value] of Object.entries(node.data.config)) {
      lines.push(`      ${key}: "${escapeYaml(value)}"`);
    }
    lines.push("    position:");
    lines.push(`      x: ${Math.round(node.position.x)}`);
    lines.push(`      y: ${Math.round(node.position.y)}`);
  }

  lines.push("edges:");
  for (const edgeItem of edges) {
    lines.push(`  - id: "${escapeYaml(edgeItem.id)}"`);
    lines.push(`    source: "${escapeYaml(edgeItem.source)}"`);
    lines.push(`    target: "${escapeYaml(edgeItem.target)}"`);
  }

  return lines.join("\n");
}

function escapeYaml(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}
