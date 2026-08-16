import { listJobs } from "@/lib/jobs";
import { ToolHeader } from "@/components/tool-header";
import { TOOLS } from "@/lib/tool-visuals";
import { ReelAnalyzerForm } from "./reel-analyzer-form";

const tool = TOOLS.find((t) => t.slug === "reel-analyzer")!;

export default function ReelAnalyzerPage() {
  const pastJobs = listJobs("reel-analyzer");

  return (
    <div className="flex flex-col gap-6">
      <ToolHeader
        icon={tool.icon}
        title="Reel analyzer"
        description={
          <>
            Paste a reel link. Get the transcript, caption, engagement
            numbers, and frames — no key required, add{" "}
            <code className="text-xs">GROQ_API_KEY</code> in Settings for a
            transcript too.
          </>
        }
      />

      <ReelAnalyzerForm />

      {pastJobs.length > 0 && (
        <div>
          <h2 className="text-lg font-medium mb-2">Past runs</h2>
          <ul className="text-sm text-muted-foreground flex flex-col gap-1">
            {pastJobs.map((job) => (
              <li key={job.id}>
                [{job.status}] {job.input} — {job.created_at}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
