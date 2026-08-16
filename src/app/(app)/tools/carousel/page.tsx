import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ToolHeader } from "@/components/tool-header";
import { TOOLS } from "@/lib/tool-visuals";

const tool = TOOLS.find((t) => t.slug === "carousel")!;

export default function CarouselPage() {
  return (
    <div className="flex flex-col gap-4">
      <ToolHeader
        icon={tool.icon}
        live={false}
        title="Carousel"
        description="Brandbook + topic → finished carousel slides, ready to post."
        action={<Badge variant="outline">Coming soon</Badge>}
      />

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle className="text-base">Rebuilding the render engine</CardTitle>
          <CardDescription>
            The current renderer draws text pixel-by-pixel, which caps how
            clean the typography can look. The next version renders each
            slide as real HTML/CSS through a headless browser instead — a
            proper text engine handles kerning, line height, and font
            fallback the way a browser does, with headline size fit
            automatically to the copy. Landing after the tools above it.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
