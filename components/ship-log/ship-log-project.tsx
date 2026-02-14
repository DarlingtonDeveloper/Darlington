interface Project {
  name: string;
  repo: string;
  summary: string;
  commits: {
    sha: string;
    message: string;
    author: string;
    timestamp: string;
  }[];
  prs: { number: number; title: string; merged_at: string; url: string }[];
}

export function ShipLogProject({ project }: { project: Project }) {
  const hasDetails = project.commits.length > 0 || project.prs.length > 0;

  return (
    <div className="border-l-2 border-neutral-800 pl-4">
      <h3 className="text-neutral-200 text-sm font-medium">{project.name}</h3>
      <p className="text-neutral-400 text-sm mt-1">{project.summary}</p>
      {hasDetails && (
        <details className="mt-2">
          <summary className="text-xs text-neutral-500 cursor-pointer hover:text-neutral-400 transition-colors">
            {project.commits.length} commit
            {project.commits.length !== 1 ? "s" : ""}
            {project.prs.length > 0 &&
              ` · ${project.prs.length} PR${project.prs.length !== 1 ? "s" : ""}`}
          </summary>
          <div className="mt-2 space-y-1">
            {project.prs.map((pr) => (
              <div key={pr.number} className="text-xs">
                <a
                  href={pr.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-500 hover:text-emerald-400"
                >
                  #{pr.number}
                </a>
                <span className="text-neutral-400 ml-1">{pr.title}</span>
              </div>
            ))}
            {project.commits.map((commit) => (
              <div
                key={commit.sha}
                className="text-xs text-neutral-500 font-mono truncate"
              >
                <span className="text-neutral-600">
                  {commit.sha.slice(0, 7)}
                </span>{" "}
                {commit.message}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}
