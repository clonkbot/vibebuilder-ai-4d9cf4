import { useEffect, useRef } from "react";
import { ProjectFile } from "./Builder";

interface CodeEditorProps {
  file: ProjectFile | undefined;
  onChange: (content: string) => void;
}

export function CodeEditor({ file, onChange }: CodeEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [file?.content]);

  if (!file) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#0a0a0f]">
        <div className="text-center text-gray-500 font-mono text-sm">
          <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Select a file to edit
        </div>
      </div>
    );
  }

  const lines = file.content.split('\n');

  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0f] overflow-hidden">
      {/* File tab */}
      <div className="flex-shrink-0 flex items-center gap-2 px-4 py-2 border-b border-[#00f5d4]/10 bg-[#0d0d14]">
        <span className="text-xs font-mono text-[#00f5d4]">{file.path}</span>
        <span className="text-[10px] font-mono text-gray-500 uppercase">{file.language}</span>
      </div>

      {/* Editor area */}
      <div className="flex-1 overflow-auto relative">
        <div className="flex min-h-full">
          {/* Line numbers */}
          <div className="flex-shrink-0 py-4 px-2 md:px-3 bg-[#0a0a0f] border-r border-[#00f5d4]/5 select-none">
            {lines.map((_, i) => (
              <div
                key={i}
                className="text-right text-[10px] md:text-xs font-mono text-gray-600 leading-6"
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code textarea */}
          <textarea
            ref={textareaRef}
            value={file.content}
            onChange={(e) => onChange(e.target.value)}
            spellCheck={false}
            className="flex-1 p-4 bg-transparent text-gray-300 font-mono text-xs md:text-sm leading-6 resize-none focus:outline-none min-h-full w-full"
            style={{
              tabSize: 2,
              MozTabSize: 2,
            }}
          />
        </div>

        {/* Glow effect at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
      </div>
    </div>
  );
}
