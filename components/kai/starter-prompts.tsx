"use client";

export interface StarterPrompt {
  label: string;
  message: string;
}

interface StarterPromptsProps {
  starters: StarterPrompt[];
  onSelect: (message: string) => void;
  disabled?: boolean;
}

export function StarterPrompts({
  starters,
  onSelect,
  disabled,
}: StarterPromptsProps) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-sm">
      {starters.map((s) => (
        <button
          key={s.message}
          onClick={() => onSelect(s.message)}
          disabled={disabled}
          className="px-4 py-3 rounded-lg text-sm text-left font-medium transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
          style={{
            background: "oklch(1 0 0 / 4%)",
            border: "1px solid oklch(1 0 0 / 8%)",
            color: "var(--fg, #e8e4df)",
          }}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
