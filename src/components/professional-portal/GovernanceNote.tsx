import { Link } from "react-router-dom";

interface GovernanceNoteProps {
  notes: string[];
}

export function GovernanceNote({ notes }: GovernanceNoteProps) {
  return (
    <div className="border border-slate-200 rounded-lg p-6 bg-slate-50/30">
      <ul className="space-y-2">
        {notes.map((note, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
            <span className="text-slate-400 mt-0.5">•</span>
            <span>{note}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-slate-200">
        <Link
          to="/site/works-cited"
          className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2"
        >
          View Works Cited
        </Link>
      </div>
    </div>
  );
}
