import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getBrandProfile } from "@/lib/brand-profile";
import { saveBrandProfileAction } from "./actions";

export default function BrandProfilePage() {
  const profile = getBrandProfile();

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Brand profile</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Fill this out once. Every tool reads from it — the Reddit radar uses
        your ICP to know what to search for, the carousel tool uses your
        voice and color.
      </p>

      <form action={saveBrandProfileAction} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="product_name">Product name</Label>
          <Input
            id="product_name"
            name="product_name"
            defaultValue={profile.product_name ?? ""}
            placeholder="What do you call it?"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="icp">Ideal customer / who has the problem</Label>
          <Textarea
            id="icp"
            name="icp"
            defaultValue={profile.icp ?? ""}
            placeholder="Who are you trying to reach, and what problem do they have?"
            rows={3}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="voice">Voice</Label>
          <Textarea
            id="voice"
            name="voice"
            defaultValue={profile.voice ?? ""}
            placeholder="How do you sound? Direct, playful, technical..."
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="positioning">Positioning</Label>
          <Textarea
            id="positioning"
            name="positioning"
            defaultValue={profile.positioning ?? ""}
            placeholder="One or two lines on what makes this different."
            rows={2}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="primary_color">Primary color</Label>
          <Input
            id="primary_color"
            name="primary_color"
            type="text"
            defaultValue={profile.primary_color ?? ""}
            placeholder="#000000"
            className="max-w-40"
          />
        </div>

        <Button type="submit" className="self-start">
          Save
        </Button>
      </form>
    </div>
  );
}
