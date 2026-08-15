import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAllKeys, KEY_REGISTRY } from "@/lib/keys";
import { listJobs } from "@/lib/jobs";

const TOOLS = [
  { name: "Reel analyzer", href: "/tools/reel-analyzer", comingSoon: false },
  { name: "Reddit radar", href: "/tools/reddit-radar", comingSoon: false },
  { name: "Carousel", href: "/tools/carousel", comingSoon: true },
];

export default function DashboardPage() {
  const keys = getAllKeys();
  const keysSet = KEY_REGISTRY.filter((k) => keys[k.name]).length;
  const jobs = listJobs();

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardDescription>API keys configured</CardDescription>
            <CardTitle className="text-2xl">
              {keysSet} / {KEY_REGISTRY.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Jobs run</CardDescription>
            <CardTitle className="text-2xl">{jobs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardDescription>Tools working</CardDescription>
            <CardTitle className="text-2xl">
              {TOOLS.filter((t) => !t.comingSoon).length} / {TOOLS.length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <div>
        <h2 className="text-lg font-medium mb-2">Tools</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {TOOLS.map((tool) => (
            <Link key={tool.href} href={tool.href}>
              <Card className="hover:border-foreground/30 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{tool.name}</CardTitle>
                    {tool.comingSoon && (
                      <Badge variant="outline">Coming soon</Badge>
                    )}
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {keysSet === 0 && (
        <p className="text-muted-foreground text-sm">
          No API keys set yet.{" "}
          <Link href="/settings" className="underline">
            Add them in Settings
          </Link>{" "}
          before running a tool.
        </p>
      )}
    </div>
  );
}
