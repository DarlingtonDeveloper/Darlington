import { ShipLogProject } from "./ship-log-project";
import type { ShipLogEntryData } from "@/app/ship-log/ship-log-client";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + "T12:00:00Z");
  return date.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ShipLogEntry({ entry }: { entry: ShipLogEntryData }) {
  return (
    <article>
      <h2 className="text-neutral-50 font-medium text-lg mb-1">
        {formatDate(entry.date)}
      </h2>
      <p className="text-xs text-neutral-500 mb-4">
        {entry.stats.total_commits} commit
        {entry.stats.total_commits !== 1 ? "s" : ""}
        {" · "}
        {entry.stats.prs_merged} PR{entry.stats.prs_merged !== 1 ? "s" : ""}{" "}
        merged
        {" · "}
        {entry.stats.repos_active} repo
        {entry.stats.repos_active !== 1 ? "s" : ""}
      </p>
      <div className="text-neutral-400 text-sm whitespace-pre-wrap mb-4">
        {entry.narrative}
      </div>
      {entry.projects.length > 0 && (
        <div className="space-y-3">
          {entry.projects.map((project) => (
            <ShipLogProject key={project.repo} project={project} />
          ))}
        </div>
      )}
    </article>
  );
}
