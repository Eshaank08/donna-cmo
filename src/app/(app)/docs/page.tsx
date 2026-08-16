import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DocsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold">Getting your keys</h1>
        <p className="text-muted-foreground text-sm mt-1">
          What each tool needs, in the order you&apos;ll actually run into
          it. Two tools need nothing at all. The rest range from a pure
          optional upgrade to effectively required — each section below
          says which.
        </p>
      </div>

      <div className="bg-callout text-callout-foreground rounded-2xl px-4 py-3 text-sm">
        <strong>Start here — zero setup:</strong>{" "}
        <Link href="/tools/idea-gate" className="underline underline-offset-2 font-medium">
          Idea gate
        </Link>{" "}
        and{" "}
        <Link href="/tools/ideation-board" className="underline underline-offset-2 font-medium">
          Ideation board
        </Link>{" "}
        never need a key, ever. Open either one and start using it right
        now. Everything past this box is for the tools that can do more
        once you give them a key.
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Reel analyzer — transcript</CardTitle>
            <Badge variant="outline">Optional</Badge>
          </div>
          <CardDescription>
            Paste a reel link and you get metadata, hooks, structure, and
            extracted frames with zero keys. One key adds a spoken-word
            transcript on top.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm flex flex-col gap-3">
          <ol className="list-decimal list-inside flex flex-col gap-1.5 text-muted-foreground">
            <li>
              Go to{" "}
              <a
                href="https://console.groq.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-foreground"
              >
                console.groq.com
              </a>{" "}
              and create a free account.
            </li>
            <li>Create an API key. Groq&apos;s free tier covers this.</li>
            <li>
              Paste it into{" "}
              <code className="text-xs">GROQ_API_KEY</code> on the{" "}
              <Link href="/settings" className="underline text-foreground">
                Settings
              </Link>{" "}
              page.
            </li>
          </ol>
          <p className="text-muted-foreground">
            Skip this and the reel analyzer still gives you metadata, hooks,
            and frames — you just won&apos;t get a transcript.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Reddit radar — your own OAuth app</CardTitle>
            <Badge variant="outline">Effectively required</Badge>
          </div>
          <CardDescription>
            Reddit currently blocks anonymous requests to its public JSON
            endpoints outright — without this, a scan runs but comes back
            empty. Add your own free Reddit &quot;script&quot; app to get
            real results.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm flex flex-col gap-3">
          <ol className="list-decimal list-inside flex flex-col gap-1.5 text-muted-foreground">
            <li>
              Go to{" "}
              <a
                href="https://www.reddit.com/prefs/apps"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-foreground"
              >
                reddit.com/prefs/apps
              </a>{" "}
              while logged into your Reddit account.
            </li>
            <li>
              Click &quot;create app&quot; (or &quot;create another
              app&quot;).
            </li>
            <li>
              Pick any name, select <strong>script</strong> as the type,
              leave description and about URL blank.
            </li>
            <li>
              Reddit still requires a redirect URI even though a script app
              doesn&apos;t use one — enter{" "}
              <code className="text-xs">http://localhost:8080</code> as a
              placeholder.
            </li>
            <li>
              Click &quot;create app&quot;. Reddit shows two values: the
              string under the app name is the client ID, and
              &quot;secret&quot; is the client secret.
            </li>
            <li>
              Paste them into{" "}
              <code className="text-xs">REDDIT_CLIENT_ID</code> and{" "}
              <code className="text-xs">REDDIT_CLIENT_SECRET</code> on the{" "}
              <Link href="/settings" className="underline text-foreground">
                Settings
              </Link>{" "}
              page.
            </li>
          </ol>
          <p className="text-muted-foreground">
            As of November 2025, new Reddit app requests need Reddit&apos;s
            own manual approval and may be denied. This is your own app on
            your own account — nothing shared, nothing we control. If you
            skip this, Reddit radar still opens and runs, it just won&apos;t
            surface any posts until you add these two.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Voice — pick one LLM</CardTitle>
            <Badge variant="outline">Needs exactly one</Badge>
          </div>
          <CardDescription>
            Voice is the one tool that needs an LLM to rewrite drafts. It
            tries four options in order and stops at the first one it
            finds — you only need to set up one of them, not all four.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm flex flex-col gap-3">
          <ol className="list-decimal list-inside flex flex-col gap-2 text-muted-foreground">
            <li>
              <strong className="text-foreground">Anthropic key</strong> —
              tried first if set. Create one at{" "}
              <a
                href="https://console.anthropic.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-foreground"
              >
                console.anthropic.com
              </a>
              , paste into <code className="text-xs">ANTHROPIC_API_KEY</code>{" "}
              on{" "}
              <Link href="/settings" className="underline text-foreground">
                Settings
              </Link>
              .
            </li>
            <li>
              <strong className="text-foreground">OpenAI key</strong> —
              used if no Anthropic key is set. Create one at{" "}
              <a
                href="https://platform.openai.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-foreground"
              >
                platform.openai.com
              </a>
              , paste into <code className="text-xs">OPENAI_API_KEY</code>{" "}
              on Settings.
            </li>
            <li>
              <strong className="text-foreground">
                Claude Code CLI, already logged in
              </strong>{" "}
              — used if neither key is set. Run{" "}
              <code className="text-xs">claude login</code> once in a
              terminal. If a coding agent installed this toolkit for you,
              you likely already have this — nothing to add in Settings.
            </li>
            <li>
              <strong className="text-foreground">
                Ollama, running locally
              </strong>{" "}
              — the last fallback. Install from{" "}
              <a
                href="https://ollama.com"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-foreground"
              >
                ollama.com
              </a>
              , pull any model, leave it running. No key, nothing in
              Settings — Voice detects it automatically.
            </li>
          </ol>
          <p className="text-muted-foreground">
            Building a voice profile doesn&apos;t need any of this — use the
            no-AI option on the Voice page for real computed patterns
            instead. Only rewriting a draft needs an LLM.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Where keys actually go</CardTitle>
          <CardDescription>
            Every key above is entered in one place, no exceptions.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm flex flex-col gap-2 text-muted-foreground">
          <p>
            Open{" "}
            <Link href="/settings" className="underline text-foreground">
              Settings &amp; keys
            </Link>{" "}
            (bottom of the sidebar, or{" "}
            <code className="text-xs">/settings</code> directly). Each key
            has its own field and its own explanation of what it unlocks.
          </p>
          <p>
            They&apos;re written to a local SQLite file at{" "}
            <code className="text-xs">local/db.sqlite</code>, which is
            gitignored. Nothing here is sent anywhere on save — a key only
            leaves your machine when the tool that owns it makes its own
            call to that provider (Groq, Reddit, Anthropic, or OpenAI).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
