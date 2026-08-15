import { MegaphoneIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CompetitorAdsPage() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Competitor ads</h1>
        <Badge variant="outline">Coming soon</Badge>
      </div>
      <p className="text-muted-foreground text-sm max-w-xl">
        See what ads any competitor is actually running — creative, copy,
        targeting, reach — and get a breakdown of the hook, angle, and offer.
      </p>

      <Card className="max-w-xl mt-4">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted mb-2">
            <MegaphoneIcon className="size-5 text-muted-foreground" />
          </div>
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
