import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Target, 
  Briefcase, 
  Coins, 
  BookOpen, 
  Building2, 
  Bot,
  CheckCircle2,
  Clock,
  PauseCircle
} from "lucide-react";
import { CANONICAL_LAYERS, SYSTEM_REGISTRY, ARCHITECTURE_STATS, getSystemsByLayer } from "@/architecture";

const layerIcons = {
  IDENTITY_TRUST: Shield,
  CAPABILITY_OUTCOMES: Target,
  OPPORTUNITIES_EXECUTION: Briefcase,
  ECONOMICS_INCENTIVES: Coins,
  KNOWLEDGE_MEMORY: BookOpen,
  INSTITUTIONS_GOVERNANCE: Building2,
  INTELLIGENCE_AUTOMATION: Bot,
};

const layerColors = {
  IDENTITY_TRUST: "from-blue-500/20 to-blue-600/10",
  CAPABILITY_OUTCOMES: "from-green-500/20 to-green-600/10",
  OPPORTUNITIES_EXECUTION: "from-purple-500/20 to-purple-600/10",
  ECONOMICS_INCENTIVES: "from-amber-500/20 to-amber-600/10",
  KNOWLEDGE_MEMORY: "from-cyan-500/20 to-cyan-600/10",
  INSTITUTIONS_GOVERNANCE: "from-rose-500/20 to-rose-600/10",
  INTELLIGENCE_AUTOMATION: "from-violet-500/20 to-violet-600/10",
};

const phaseIcons = {
  now: CheckCircle2,
  next: Clock,
  later: Clock,
  park: PauseCircle,
};

const phaseColors = {
  now: "bg-green-500/10 text-green-700 border-green-500/30",
  next: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  later: "bg-amber-500/10 text-amber-700 border-amber-500/30",
  park: "bg-muted text-muted-foreground border-border",
};

const classificationColors = {
  core: "bg-primary/10 text-primary",
  extended: "bg-secondary text-secondary-foreground",
  institutional: "bg-accent text-accent-foreground",
  experimental: "bg-muted text-muted-foreground",
};

export function ArchitectureOverview() {
  return (
    <div className="space-y-8">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{ARCHITECTURE_STATS.totalSystems}</div>
            <div className="text-sm text-muted-foreground">Total Systems</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold">{ARCHITECTURE_STATS.totalLayers}</div>
            <div className="text-sm text-muted-foreground">Canonical Layers</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-green-600">{ARCHITECTURE_STATS.byPhase.now}</div>
            <div className="text-sm text-muted-foreground">Build Now</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-blue-600">{ARCHITECTURE_STATS.byPhase.next}</div>
            <div className="text-sm text-muted-foreground">Build Next</div>
          </CardContent>
        </Card>
      </div>

      {/* Build Phase Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Build Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Phase 1 (Now)</span>
              <span className="text-muted-foreground">{ARCHITECTURE_STATS.byPhase.now} systems</span>
            </div>
            <Progress value={100} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Phase 2 (Next)</span>
              <span className="text-muted-foreground">{ARCHITECTURE_STATS.byPhase.next} systems</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Phase 3 (Later)</span>
              <span className="text-muted-foreground">{ARCHITECTURE_STATS.byPhase.later} systems</span>
            </div>
            <Progress value={0} className="h-2" />
          </div>
        </CardContent>
      </Card>

      {/* Layers */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">The Seven Canonical Layers</h2>
        {Object.entries(CANONICAL_LAYERS).map(([key, layer]) => {
          const Icon = layerIcons[key as keyof typeof layerIcons];
          const systems = getSystemsByLayer(key as keyof typeof CANONICAL_LAYERS);
          
          return (
            <Card key={key} className={`bg-gradient-to-r ${layerColors[key as keyof typeof layerColors]}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-background/80">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Layer {layer.id}: {layer.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">{layer.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {systems.map((system) => {
                    const PhaseIcon = phaseIcons[system.buildPhase];
                    return (
                      <Badge 
                        key={system.id} 
                        variant="outline"
                        className={`${phaseColors[system.buildPhase]} flex items-center gap-1`}
                      >
                        <PhaseIcon className="h-3 w-3" />
                        <span className="font-mono text-xs">S{system.id}</span>
                        <span className="hidden sm:inline">: {system.name}</span>
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Classification Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Classification Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <Badge className={classificationColors.core}>Core</Badge>
              <p className="text-xs text-muted-foreground">
                Always on, essential for basic operation
              </p>
            </div>
            <div className="space-y-1">
              <Badge className={classificationColors.extended}>Extended</Badge>
              <p className="text-xs text-muted-foreground">
                Opt-in for power users
              </p>
            </div>
            <div className="space-y-1">
              <Badge className={classificationColors.institutional}>Institutional</Badge>
              <p className="text-xs text-muted-foreground">
                For organizations and enterprises
              </p>
            </div>
            <div className="space-y-1">
              <Badge className={classificationColors.experimental}>Experimental</Badge>
              <p className="text-xs text-muted-foreground">
                Future consideration
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function LayerCard({ layerKey }: { layerKey: keyof typeof CANONICAL_LAYERS }) {
  const layer = CANONICAL_LAYERS[layerKey];
  const Icon = layerIcons[layerKey];
  const systems = getSystemsByLayer(layerKey);
  
  const coreCount = systems.filter(s => s.classification === "core").length;
  const buildNowCount = systems.filter(s => s.buildPhase === "now").length;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">{layer.name}</CardTitle>
          </div>
          <Badge variant="outline">{systems.length} systems</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-3">{layer.description}</p>
        <div className="flex gap-2 text-xs">
          <span className="text-green-600">{coreCount} core</span>
          <span className="text-muted-foreground">•</span>
          <span className="text-blue-600">{buildNowCount} build now</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function SystemCard({ systemId }: { systemId: number }) {
  const system = SYSTEM_REGISTRY[systemId];
  if (!system) return null;

  const PhaseIcon = phaseIcons[system.buildPhase];

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="font-mono text-xs text-muted-foreground">S{systemId}</span>
              <Badge className={classificationColors[system.classification]} variant="secondary">
                {system.classification}
              </Badge>
            </div>
            <h3 className="font-medium">{system.name}</h3>
          </div>
          <Badge variant="outline" className={phaseColors[system.buildPhase]}>
            <PhaseIcon className="h-3 w-3 mr-1" />
            {system.buildPhase}
          </Badge>
        </div>
        {system.hook && (
          <p className="text-xs font-mono text-muted-foreground mt-2">
            {system.hook}
          </p>
        )}
        {system.dependencies.length > 0 && (
          <div className="flex gap-1 mt-2">
            <span className="text-xs text-muted-foreground">Deps:</span>
            {system.dependencies.map(dep => (
              <Badge key={dep} variant="outline" className="text-xs py-0">
                S{dep}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
