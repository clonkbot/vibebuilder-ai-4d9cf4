import { Doc } from "../../convex/_generated/dataModel";
import { useMemo, useState } from "react";

interface DiffViewProps {
  v1: Doc<"versions">;
  v2: Doc<"versions">;
  onClose: () => void;
}

interface DiffLine {
  type: "added" | "removed" | "unchanged";
  content: string;
  lineNum1?: number;
  lineNum2?: number;
}

function computeDiff(oldText: string, newText: string): DiffLine[] {
  const oldLines = oldText.split('\n');
  const newLines = newText.split('\n');
  const result: DiffLine[] = [];

  // Simple LCS-based diff
  const lcs = new Map<string, number[][]>();

  // Build a simple diff (not optimal but works for demo)
  let i = 0, j = 0;
  let lineNum1 = 1, lineNum2 = 1;

  while (i < oldLines.length || j < newLines.length) {
    if (i >= oldLines.length) {
      result.push({ type: "added", content: newLines[j], lineNum2: lineNum2++ });
      j++;
    } else if (j >= newLines.length) {
      result.push({ type: "removed", content: oldLines[i], lineNum1: lineNum1++ });
      i++;
    } else if (oldLines[i] === newLines[j]) {
      result.push({ type: "unchanged", content: oldLines[i], lineNum1: lineNum1++, lineNum2: lineNum2++ });
      i++;
      j++;
    } else {
      // Check if line was removed or added
      const oldInNew = newLines.indexOf(oldLines[i], j);
      const newInOld = oldLines.indexOf(newLines[j], i);

      if (oldInNew === -1 && newInOld === -1) {
        result.push({ type: "removed", content: oldLines[i], lineNum1: lineNum1++ });
        result.push({ type: "added", content: newLines[j], lineNum2: lineNum2++ });
        i++;
        j++;
      } else if (oldInNew !== -1 && (newInOld === -1 || oldInNew - j < newInOld - i)) {
        result.push({ type: "added", content: newLines[j], lineNum2: lineNum2++ });
        j++;
      } else {
        result.push({ type: "removed", content: oldLines[i], lineNum1: lineNum1++ });
        i++;
      }
    }
  }

  return result;
}

export function DiffView({ v1, v2, onClose }: DiffViewProps) {
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const allFiles = useMemo(() => {
    const fileSet = new Set<string>();
    v1.files.forEach((f: { path: string }) => fileSet.add(f.path));
    v2.files.forEach((f: { path: string }) => fileSet.add(f.path));
    return Array.from(fileSet).sort();
  }, [v1, v2]);

  const currentFile = selectedFile || allFiles[0];

  const diff = useMemo(() => {
    const file1 = v1.files.find((f: { path: string; content: string }) => f.path === currentFile);
    const file2 = v2.files.find((f: { path: string; content: string }) => f.path === currentFile);

    const oldContent = file1?.content || '';
    const newContent = file2?.content || '';

    return computeDiff(oldContent, newContent);
  }, [v1, v2, currentFile]);

  const stats = useMemo(() => {
    const added = diff.filter(l => l.type === "added").length;
    const removed = diff.filter(l => l.type === "removed").length;
    return { added, removed };
  }, [diff]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-4xl bg-[#12121a] border border-[#00f5d4]/20 rounded-2xl shadow-2xl shadow-[#00f5d4]/10 max-h-[90vh] overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out]"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-[#00f5d4]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#ff6b9d]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#ff6b9d]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold">Diff View</h3>
              <p className="text-gray-500 text-xs font-mono">
                v{v1.versionNumber} → v{v2.versionNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="hidden md:flex items-center gap-3 text-xs font-mono">
              <span className="text-green-400">+{stats.added}</span>
              <span className="text-red-400">-{stats.removed}</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#00f5d4]/10 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* File tabs */}
        <div className="flex-shrink-0 flex overflow-x-auto border-b border-[#00f5d4]/10 bg-[#0d0d14]">
          {allFiles.map(file => (
            <button
              key={file}
              onClick={() => setSelectedFile(file)}
              className={`px-4 py-2 text-xs font-mono whitespace-nowrap border-b-2 transition-all ${
                file === currentFile
                  ? 'text-[#00f5d4] border-[#00f5d4]'
                  : 'text-gray-400 border-transparent hover:text-white'
              }`}
            >
              {file}
            </button>
          ))}
        </div>

        {/* Diff content */}
        <div className="flex-1 overflow-auto bg-[#0a0a0f]">
          <div className="min-w-max">
            {diff.map((line, index) => (
              <div
                key={index}
                className={`flex font-mono text-xs leading-6 ${
                  line.type === "added"
                    ? 'bg-green-500/10'
                    : line.type === "removed"
                    ? 'bg-red-500/10'
                    : ''
                }`}
              >
                {/* Line numbers */}
                <div className="flex-shrink-0 w-20 flex text-gray-600 select-none border-r border-[#00f5d4]/5">
                  <span className="w-10 text-right pr-2">
                    {line.lineNum1 || ''}
                  </span>
                  <span className="w-10 text-right pr-2">
                    {line.lineNum2 || ''}
                  </span>
                </div>

                {/* Change indicator */}
                <span className={`w-6 text-center flex-shrink-0 ${
                  line.type === "added"
                    ? 'text-green-400'
                    : line.type === "removed"
                    ? 'text-red-400'
                    : 'text-gray-600'
                }`}>
                  {line.type === "added" ? '+' : line.type === "removed" ? '-' : ' '}
                </span>

                {/* Content */}
                <pre className={`flex-1 px-2 ${
                  line.type === "added"
                    ? 'text-green-300'
                    : line.type === "removed"
                    ? 'text-red-300'
                    : 'text-gray-400'
                }`}>
                  {line.content || ' '}
                </pre>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
