import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ProjectList } from "./ProjectList";
import { Builder } from "./Builder";
import { useAuthActions } from "@convex-dev/auth/react";

export function Dashboard() {
  const { signOut } = useAuthActions();
  const [selectedProjectId, setSelectedProjectId] = useState<Id<"projects"> | null>(null);
  const projects = useQuery(api.projects.list);

  if (selectedProjectId) {
    return (
      <Builder
        projectId={selectedProjectId}
        onBack={() => setSelectedProjectId(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 245, 212, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 245, 212, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-[#00f5d4]/10 bg-[#0a0a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#00f5d4] to-[#ff6b9d] rounded-lg flex items-center justify-center shadow-lg shadow-[#00f5d4]/20">
              <svg className="w-6 h-6 text-[#0a0a0f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-white tracking-tight">
              Vibe<span className="text-[#00f5d4]">Builder</span>
            </h1>
          </div>

          <button
            onClick={() => signOut()}
            className="px-4 py-2 text-gray-400 hover:text-white font-mono text-sm transition-colors flex items-center gap-2"
          >
            <span className="hidden sm:inline">Sign Out</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="mb-8 md:mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Your Projects</h2>
          <p className="text-gray-400 font-mono text-sm">
            // Create AI-powered applications with natural language
          </p>
        </div>

        <ProjectList
          projects={projects}
          onSelect={setSelectedProjectId}
        />
      </main>

      {/* Footer */}
      <footer className="absolute bottom-0 left-0 right-0 py-4 text-center">
        <p className="text-gray-600 text-xs font-mono">
          Requested by @web-user · Built by @clonkbot
        </p>
      </footer>
    </div>
  );
}
