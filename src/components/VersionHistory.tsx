import { Doc, Id } from "../../convex/_generated/dataModel";

interface VersionHistoryProps {
  versions: Doc<"versions">[];
  currentVersionId: Id<"versions"> | undefined;
  onClose: () => void;
  onRollback: (version: Doc<"versions">) => void;
  onCompare: (v1: Doc<"versions">, v2: Doc<"versions">) => void;
}

export function VersionHistory({
  versions,
  currentVersionId,
  onClose,
  onRollback,
  onCompare
}: VersionHistoryProps) {
  const sortedVersions = [...versions].sort((a, b) => b.versionNumber - a.versionNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div
        className="w-full max-w-lg bg-[#12121a] border border-[#00f5d4]/20 rounded-2xl shadow-2xl shadow-[#00f5d4]/10 max-h-[80vh] overflow-hidden flex flex-col animate-[scaleIn_0.2s_ease-out]"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between p-4 md:p-6 border-b border-[#00f5d4]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#00f5d4]/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#00f5d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-bold">Version History</h3>
              <p className="text-gray-500 text-xs font-mono">{versions.length} versions</p>
            </div>
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

        {/* Version list */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {sortedVersions.length === 0 ? (
            <div className="text-center py-8 text-gray-500 font-mono text-sm">
              No versions saved yet
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gradient-to-b from-[#00f5d4] via-[#00f5d4]/30 to-transparent" />

              <div className="space-y-4">
                {sortedVersions.map((version, index) => {
                  const isCurrent = version._id === currentVersionId;

                  return (
                    <div
                      key={version._id}
                      className={`relative pl-12 ${index === sortedVersions.length - 1 ? '' : ''}`}
                    >
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-3 top-3 w-4 h-4 rounded-full border-2 ${
                          isCurrent
                            ? 'bg-[#00f5d4] border-[#00f5d4] shadow-lg shadow-[#00f5d4]/50'
                            : 'bg-[#0a0a0f] border-[#00f5d4]/50'
                        }`}
                      />

                      <div
                        className={`p-4 rounded-xl border transition-all ${
                          isCurrent
                            ? 'bg-[#00f5d4]/10 border-[#00f5d4]/30'
                            : 'bg-[#0a0a0f]/50 border-[#00f5d4]/10 hover:border-[#00f5d4]/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-mono font-bold ${isCurrent ? 'text-[#00f5d4]' : 'text-white'}`}>
                            v{version.versionNumber}
                          </span>
                          {isCurrent && (
                            <span className="px-2 py-0.5 bg-[#00f5d4]/20 rounded text-[10px] font-mono text-[#00f5d4] uppercase">
                              Current
                            </span>
                          )}
                        </div>

                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">
                          {version.changeDescription}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-500 font-mono">
                            {new Date(version.createdAt).toLocaleDateString()} {new Date(version.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>

                          <div className="flex gap-2">
                            {!isCurrent && (
                              <button
                                onClick={() => onRollback(version)}
                                className="px-3 py-1 text-xs font-mono text-[#00f5d4] hover:bg-[#00f5d4]/10 rounded transition-all"
                              >
                                Restore
                              </button>
                            )}
                            {index < sortedVersions.length - 1 && (
                              <button
                                onClick={() => onCompare(sortedVersions[index + 1], version)}
                                className="px-3 py-1 text-xs font-mono text-gray-400 hover:text-white hover:bg-white/5 rounded transition-all"
                              >
                                Diff
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}
