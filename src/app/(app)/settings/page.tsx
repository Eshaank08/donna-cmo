import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getAllKeys, KEY_REGISTRY } from "@/lib/keys";
import { saveKeyAction } from "./actions";

export default function SettingsPage() {
  const keys = getAllKeys();

  return (
    <div className="flex flex-col gap-4 max-w-2xl">
      <div>
        <h1 className="text-2xl font-semibold">Settings &amp; keys</h1>
        <p className="text-muted-foreground text-sm">
          Stored in a local SQLite file at{" "}
          <code className="text-xs">local/db.sqlite</code>. Nothing here is
          sent anywhere — the tools read these keys directly from this
          machine.
        </p>
      </div>

      {KEY_REGISTRY.map((key) => {
        const isSet = Boolean(keys[key.name]);
        return (
          <Card key={key.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{key.label}</CardTitle>
                <Badge variant={isSet ? "default" : "outline"}>
                  {isSet ? "Set" : "Not set"}
                </Badge>
              </div>
              <CardDescription>{key.help}</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={saveKeyAction} className="flex gap-2">
                <input type="hidden" name="name" value={key.name} />
                <Label htmlFor={key.name} className="sr-only">
                  {key.label}
                </Label>
                <Input
                  id={key.name}
                  name="value"
                  type="password"
                  placeholder={isSet ? "•••••••• (update to replace)" : "Paste value"}
                  autoComplete="off"
                />
                <Button type="submit" variant="secondary">
                  Save
                </Button>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
