import { LayoutGridIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CarouselPage() {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-semibold">Carousel</h1>
        <Badge variant="outline">Coming soon</Badge>
      </div>
      <p className="text-muted-foreground text-sm max-w-xl">
        Brandbook + topic → finished carousel slides, ready to post.
      </p>

      <Card className="max-w-xl mt-4">
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-muted mb-2">
            <LayoutGridIcon className="size-5 text-muted-foreground" />
          </div>
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
