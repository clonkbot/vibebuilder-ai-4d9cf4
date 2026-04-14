import { useState } from "react";
import { ProjectFile } from "./Builder";

interface FileExplorerProps {
  files: ProjectFile[];
  selectedFile: string;
  onSelect: (path: string) => void;
  onAddFile: (path: string) => void;
  onDeleteFile: (path: string) => void;
  isMobile?: boolean;
}

const fileIcons: Record<string, { icon: string; color: string }> = {
  html: { icon: "H", color: "#e34c26" },
  css: { icon: "C", color: "#264de4" },
  javascript: { icon: "J", color: "#f7df1e" },
  typescript: { icon: "T", color: "#3178c6" },
  json: { icon: "{}", color: "#888" },
  plaintext: { icon: "T", color: "#666" },
};

export function FileExplorer({
  files,
  selectedFile,
  onSelect,
  onAddFile,
  onDeleteFile,
  isMobile
}: FileExplorerProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newFileName, setNewFileName] = useState("");

  const handleAdd = () => {
    if (newFileName.trim()) {
      onAddFile(newFileName.trim());
      setNewFileName("");
      setIsAdding(false);
    }
  };

  if (isMobile) {
    return (
      <div className="flex-shrink-0 bg-[#0d0d14] border-b border-[#00f5d4]/10 overflow-x-auto">
        <div className="flex items-center gap-1 p-2 min-w-max">
          {files.map((file) => {
            const iconInfo = fileIcons[file.language] || fileIcons.plaintext;
            return (
              <button
                key={file.path}
                onClick={() => onSelect(file.path)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-mono whitespace-nowrap transition-all ${
                  selectedFile === file.path
                    ? "bg-[#00f5d4]/10 text-[#00f5d4] border border-[#00f5d4]/30"
                    : "text-gray-400 hover:bg-[#12121a]"
                }`}
              >
                <span
                  className="w-4 h-4 rounded flex items-center justify-center text-[10px] font-bold"
                  style={{ backgroundColor: `${iconInfo.color}20`, color: iconInfo.color }}
                >
                  {iconInfo.icon}
                </span>
                {file.path}
              </button>
            );
          })}
          <button
            onClick={() => setIsAdding(true)}
            className="px-2 py-2 text-gray-500 hover:text-[#00f5d4] transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>

        {isAdding && (
          <div className="p-2 border-t border-[#00f5d4]/10 flex gap-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.js"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setIsAdding(false);
              }}
              className="flex-1 bg-[#0a0a0f] border border-[#00f5d4]/30 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-[#00f5d4]"
            />
            <button onClick={handleAdd} className="px-2 text-[#00f5d4] text-xs">Add</button>
            <button onClick={() => setIsAdding(false)} className="px-2 text-gray-500 text-xs">Cancel</button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-48 lg:w-56 flex-shrink-0 bg-[#0d0d14] border-r border-[#00f5d4]/10 flex flex-col">
      <div className="p-3 border-b border-[#00f5d4]/10 flex items-center justify-between">
        <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Files</span>
        <button
          onClick={() => setIsAdding(true)}
          className="p-1 text-gray-500 hover:text-[#00f5d4] transition-colors"
          title="Add file"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isAdding && (
          <div className="mb-2">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="filename.js"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
                if (e.key === "Escape") setIsAdding(false);
              }}
              className="w-full bg-[#0a0a0f] border border-[#00f5d4]/50 rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-[#00f5d4]"
            />
          </div>
        )}

        {files.map((file) => {
          const iconInfo = fileIcons[file.language] || fileIcons.plaintext;
          return (
            <div
              key={file.path}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-all ${
                selectedFile === file.path
                  ? "bg-[#00f5d4]/10 text-[#00f5d4]"
                  : "text-gray-400 hover:bg-[#12121a] hover:text-gray-300"
              }`}
              onClick={() => onSelect(file.path)}
            >
              <span
                className="w-5 h-5 rounded flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                style={{ backgroundColor: `${iconInfo.color}20`, color: iconInfo.color }}
              >
                {iconInfo.icon}
              </span>
              <span className="text-xs font-mono truncate flex-1">{file.path}</span>
              {files.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.path);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1 text-gray-500 hover:text-red-400 transition-all"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
