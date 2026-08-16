import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToolHeader } from "@/components/tool-header";
import { TOOLS } from "@/lib/tool-visuals";

const tool = TOOLS.find((t) => t.slug === "competitor-ads")!;

export default function CompetitorAdsPage() {
  return (
    <div className="flex flex-col gap-4">
      <ToolHeader
        icon={tool.icon}
        live={false}
        title="Competitor ads"
        description="See what ads any competitor is actually running — creative, copy, targeting, reach — and get a breakdown of the hook, angle, and offer."
        action={<Badge variant="outline">Coming soon</Badge>}
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">
            Built on Meta&apos;s public Ads Library
          </CardTitle>
          <CardDescription>
            EU rules force Meta to publish targeting, reach-by-country, and
            creative for every ad shown to EU users, not just political ones
            — so this works on any advertiser&apos;s public ads, not just
            your own. Same shape as the reel analyzer: search by
            advertiser or page, pull the matching ads, then a summary of
            what each one is actually doing. No special account access
            needed.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
