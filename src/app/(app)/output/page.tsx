import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listJobs } from "@/lib/jobs";

const STATUS_VARIANT = {
  queued: "outline",
  running: "secondary",
  done: "default",
  failed: "destructive",
} as const;

export default function OutputLibraryPage() {
  const jobs = listJobs();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Output library</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Everything any tool produces lands here.
      </p>

      {jobs.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          Nothing yet — run a tool and its output shows up here.
        </p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tool</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Output</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell>{job.tool}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_VARIANT[job.status]}>
                    {job.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {job.created_at}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {job.output_path ?? "—"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
