import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";
import { CodeEditor } from "./CodeEditor";
import { FileExplorer } from "./FileExplorer";
import { ChatPanel } from "./ChatPanel";
import { Preview } from "./Preview";
import { VersionHistory } from "./VersionHistory";
import { DiffView } from "./DiffView";

interface BuilderProps {
  projectId: Id<"projects">;
  onBack: () => void;
}

export interface ProjectFile {
  path: string;
  content: string;
  language: string;
}

const DEFAULT_FILES: ProjectFile[] = [
  {
    path: "index.html",
    content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My App</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div id="app">
    <h1>Welcome to My App</h1>
    <p>Start editing to see changes!</p>
  </div>
  <script src="script.js"></script>
</body>
</html>`,
    language: "html",
  },
  {
    path: "styles.css",
    content: `* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, sans-serif;
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

#app {
  text-align: center;
  padding: 2rem;
}

h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #00f5d4, #ff6b9d);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

p {
  color: #888;
}`,
    language: "css",
  },
  {
    path: "script.js",
    content: `// Your JavaScript code here
console.log("App loaded!");

document.addEventListener('DOMContentLoaded', () => {
  console.log("DOM ready!");
});`,
    language: "javascript",
  },
];

export function Builder({ projectId, onBack }: BuilderProps) {
  const project = useQuery(api.projects.get, { id: projectId });
  const versions = useQuery(api.versions.listByProject, { projectId });
  const latestVersion = useQuery(api.versions.getLatestByProject, { projectId });
  const messages = useQuery(api.messages.listByProject, { projectId });

  const createVersion = useMutation(api.versions.create);
  const createMessage = useMutation(api.messages.create);
  const chat = useAction(api.ai.chat);

  const [files, setFiles] = useState<ProjectFile[]>(DEFAULT_FILES);
  const [selectedFile, setSelectedFile] = useState<string>("index.html");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showVersionHistory, setShowVersionHistory] = useState(false);
  const [showDiff, setShowDiff] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{v1: Doc<"versions">, v2: Doc<"versions">} | null>(null);
  const [mobileTab, setMobileTab] = useState<"code" | "preview" | "chat">("code");
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load files from latest version
  useEffect(() => {
    if (latestVersion && latestVersion.files.length > 0) {
      setFiles(latestVersion.files);
      setSelectedFile(latestVersion.files[0].path);
    }
  }, [latestVersion]);

  const currentFile = files.find(f => f.path === selectedFile);

  const handleFileChange = (content: string) => {
    setFiles(prev => prev.map(f =>
      f.path === selectedFile ? { ...f, content } : f
    ));
  };

  const saveVersion = async (prompt: string, changeDescription: string) => {
    await createVersion({
      projectId,
      files,
      prompt,
      changeDescription,
    });
  };

  const generateApp = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      // Save user message
      await createMessage({
        projectId,
        role: "user",
        content: prompt,
      });

      // Build context from current files
      const filesContext = files.map(f =>
        `=== ${f.path} ===\n${f.content}`
      ).join("\n\n");

      const systemPrompt = `You are a senior full-stack engineer helping build web applications.

Current project files:
${filesContext}

Instructions:
1. When asked to create or modify an app, respond with COMPLETE updated files
2. Format your response with each file clearly marked like:
=== filename.ext ===
file content here

3. Only include files that need to be created or modified
4. Maintain existing functionality unless asked to change it
5. Use modern, clean code practices
6. For HTML: include proper structure, meta tags, and links to CSS/JS
7. For CSS: use modern CSS with flexbox/grid, smooth transitions
8. For JS: use modern ES6+ syntax, handle edge cases

If the user asks you to explain the code, provide a clear explanation without code blocks.
If the user asks for a bug fix, analyze the code and provide the fixed version.
If the user asks for improvements, suggest and implement optimizations.`;

      const response = await chat({
        messages: [{ role: "user", content: prompt }],
        systemPrompt,
      });

      // Save assistant message
      await createMessage({
        projectId,
        role: "assistant",
        content: response,
      });

      // Parse response for files
      const filePattern = /===\s*([^\s=]+(?:\.[a-zA-Z]+)?)\s*===\s*\n([\s\S]*?)(?=\n===|$)/g;
      let match;
      const newFiles = [...files];
      let hasChanges = false;

      while ((match = filePattern.exec(response)) !== null) {
        const [, fileName, content] = match;
        const trimmedContent = content.trim();

        // Determine language from extension
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        const languageMap: Record<string, string> = {
          'html': 'html',
          'htm': 'html',
          'css': 'css',
          'js': 'javascript',
          'jsx': 'javascript',
          'ts': 'typescript',
          'tsx': 'typescript',
          'json': 'json',
        };
        const language = languageMap[ext] || 'plaintext';

        const existingIndex = newFiles.findIndex(f => f.path === fileName);
        if (existingIndex >= 0) {
          newFiles[existingIndex] = { path: fileName, content: trimmedContent, language };
        } else {
          newFiles.push({ path: fileName, content: trimmedContent, language });
        }
        hasChanges = true;
      }

      if (hasChanges) {
        setFiles(newFiles);
        setSelectedFile(newFiles[0].path);

        // Save version
        await saveVersion(prompt, `AI update: ${prompt.slice(0, 50)}...`);
      }

    } catch (err) {
      console.error("Generation error:", err);
      setError("Failed to generate. Please try again.");
      await createMessage({
        projectId,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRollback = (version: Doc<"versions">) => {
    setFiles(version.files);
    setSelectedFile(version.files[0]?.path || "index.html");
    setShowVersionHistory(false);
  };

  const handleCompare = (v1: Doc<"versions">, v2: Doc<"versions">) => {
    setCompareVersions({ v1, v2 });
    setShowDiff(true);
    setShowVersionHistory(false);
  };

  const downloadZip = async () => {
    // Create a simple zip-like structure (actually just a combined file for demo)
    const content = files.map(f => `/* FILE: ${f.path} */\n${f.content}`).join('\n\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project?.name || 'project'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!project) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="text-[#00f5d4] font-mono animate-pulse">Loading project...</div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#0a0a0f] flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-[#00f5d4]/10 bg-[#0a0a0f]/90 backdrop-blur-xl z-20">
        <div className="px-3 md:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={onBack}
              className="p-2 text-gray-400 hover:text-white hover:bg-[#00f5d4]/10 rounded-lg transition-all"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-[#00f5d4] to-[#ff6b9d] rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-[#0a0a0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="hidden sm:block">
                <h1 className="text-white font-bold text-sm md:text-base truncate max-w-[150px] md:max-w-none">
                  {project.name}
                </h1>
                <p className="text-gray-500 text-xs font-mono hidden md:block">
                  {versions?.length || 0} version{(versions?.length || 0) !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setShowVersionHistory(true)}
              className="px-3 py-2 text-gray-400 hover:text-[#00f5d4] font-mono text-xs flex items-center gap-2 hover:bg-[#00f5d4]/10 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
            <button
              onClick={downloadZip}
              className="px-3 py-2 text-gray-400 hover:text-[#00f5d4] font-mono text-xs flex items-center gap-2 hover:bg-[#00f5d4]/10 rounded-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 text-gray-400 hover:text-white"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-[#00f5d4]/10 p-3 flex gap-2">
            <button
              onClick={() => { setShowVersionHistory(true); setShowMobileMenu(false); }}
              className="flex-1 px-3 py-2 text-gray-400 font-mono text-xs flex items-center justify-center gap-2 bg-[#12121a] rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              History
            </button>
            <button
              onClick={() => { downloadZip(); setShowMobileMenu(false); }}
              className="flex-1 px-3 py-2 text-gray-400 font-mono text-xs flex items-center justify-center gap-2 bg-[#12121a] rounded-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export
            </button>
          </div>
        )}

        {/* Mobile tab bar */}
        <div className="md:hidden flex border-t border-[#00f5d4]/10">
          {(["code", "preview", "chat"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMobileTab(tab)}
              className={`flex-1 py-3 text-xs font-mono uppercase tracking-wider transition-colors ${
                mobileTab === tab
                  ? "text-[#00f5d4] border-b-2 border-[#00f5d4]"
                  : "text-gray-500"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      {/* Error toast */}
      {error && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-2 rounded-lg font-mono text-sm animate-[fadeIn_0.2s]">
          {error}
          <button onClick={() => setError(null)} className="ml-3 text-red-300 hover:text-white">×</button>
        </div>
      )}

      {/* Main content - Desktop */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left panel: Files + Editor */}
        <div className="w-1/2 lg:w-3/5 flex flex-col border-r border-[#00f5d4]/10">
          <div className="flex flex-1 overflow-hidden">
            <FileExplorer
              files={files}
              selectedFile={selectedFile}
              onSelect={setSelectedFile}
              onAddFile={(path) => {
                const ext = path.split('.').pop()?.toLowerCase() || '';
                const languageMap: Record<string, string> = {
                  'html': 'html', 'css': 'css', 'js': 'javascript',
                  'jsx': 'javascript', 'ts': 'typescript', 'tsx': 'typescript',
                };
                setFiles([...files, { path, content: '', language: languageMap[ext] || 'plaintext' }]);
                setSelectedFile(path);
              }}
              onDeleteFile={(path) => {
                setFiles(files.filter(f => f.path !== path));
                if (selectedFile === path && files.length > 1) {
                  setSelectedFile(files.find(f => f.path !== path)?.path || '');
                }
              }}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
              <CodeEditor
                file={currentFile}
                onChange={handleFileChange}
              />
              {/* Preview at bottom of code panel */}
              <div className="h-1/3 border-t border-[#00f5d4]/10">
                <Preview files={files} />
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: Chat */}
        <div className="w-1/2 lg:w-2/5 flex flex-col">
          <ChatPanel
            messages={messages || []}
            isGenerating={isGenerating}
            onSend={generateApp}
            chatEndRef={chatEndRef}
          />
        </div>
      </div>

      {/* Mobile content */}
      <div className="flex-1 md:hidden overflow-hidden">
        {mobileTab === "code" && (
          <div className="h-full flex flex-col">
            <FileExplorer
              files={files}
              selectedFile={selectedFile}
              onSelect={setSelectedFile}
              onAddFile={(path) => {
                const ext = path.split('.').pop()?.toLowerCase() || '';
                const languageMap: Record<string, string> = {
                  'html': 'html', 'css': 'css', 'js': 'javascript',
                };
                setFiles([...files, { path, content: '', language: languageMap[ext] || 'plaintext' }]);
                setSelectedFile(path);
              }}
              onDeleteFile={(path) => {
                setFiles(files.filter(f => f.path !== path));
                if (selectedFile === path && files.length > 1) {
                  setSelectedFile(files.find(f => f.path !== path)?.path || '');
                }
              }}
              isMobile
            />
            <div className="flex-1 overflow-hidden">
              <CodeEditor file={currentFile} onChange={handleFileChange} />
            </div>
          </div>
        )}
        {mobileTab === "preview" && (
          <Preview files={files} />
        )}
        {mobileTab === "chat" && (
          <ChatPanel
            messages={messages || []}
            isGenerating={isGenerating}
            onSend={generateApp}
            chatEndRef={chatEndRef}
          />
        )}
      </div>

      {/* Footer */}
      <footer className="flex-shrink-0 border-t border-[#00f5d4]/10 py-2 px-4 text-center bg-[#0a0a0f]">
        <p className="text-gray-600 text-xs font-mono">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>

      {/* Version History Modal */}
      {showVersionHistory && versions && (
        <VersionHistory
          versions={versions}
          currentVersionId={project.currentVersionId}
          onClose={() => setShowVersionHistory(false)}
          onRollback={handleRollback}
          onCompare={handleCompare}
        />
      )}

      {/* Diff View Modal */}
      {showDiff && compareVersions && (
        <DiffView
          v1={compareVersions.v1}
          v2={compareVersions.v2}
          onClose={() => { setShowDiff(false); setCompareVersions(null); }}
        />
      )}
    </div>
  );
}
