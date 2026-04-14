import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id, Doc } from "../../convex/_generated/dataModel";

interface ProjectListProps {
  projects: Doc<"projects">[] | undefined;
  onSelect: (id: Id<"projects">) => void;
}

export function ProjectList({ projects, onSelect }: ProjectListProps) {
  const [showNewProject, setShowNewProject] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const createProject = useMutation(api.projects.create);
  const deleteProject = useMutation(api.projects.remove);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsCreating(true);
    try {
      const projectId = await createProject({
        name: name.trim(),
        description: description.trim() || "A new VibeBuilder project"
      });
      setName("");
      setDescription("");
      setShowNewProject(false);
      onSelect(projectId);
    } catch (err) {
      console.error("Failed to create project:", err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: Id<"projects">) => {
    e.stopPropagation();
    if (confirm("Delete this project? This cannot be undone.")) {
      await deleteProject({ id });
    }
  };

  if (projects === undefined) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="bg-[#12121a]/50 border border-[#00f5d4]/10 rounded-xl p-6 animate-pulse"
          >
            <div className="h-6 bg-[#00f5d4]/10 rounded w-3/4 mb-3" />
            <div className="h-4 bg-[#00f5d4]/5 rounded w-full mb-2" />
            <div className="h-4 bg-[#00f5d4]/5 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {/* New Project Card */}
      {showNewProject ? (
        <form
          onSubmit={handleCreate}
          className="bg-[#12121a]/80 border-2 border-[#00f5d4]/50 rounded-xl p-6 animate-[fadeIn_0.2s_ease-out]"
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Project name..."
            autoFocus
            className="w-full bg-transparent border-b border-[#00f5d4]/30 pb-2 mb-4 text-white font-bold text-lg focus:outline-none focus:border-[#00f5d4] transition-colors placeholder-gray-500"
          />
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your app idea..."
            rows={3}
            className="w-full bg-transparent border border-[#00f5d4]/20 rounded-lg p-3 mb-4 text-gray-300 text-sm font-mono focus:outline-none focus:border-[#00f5d4] transition-colors placeholder-gray-600 resize-none"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isCreating || !name.trim()}
              className="flex-1 bg-[#00f5d4] text-[#0a0a0f] font-bold py-2 rounded-lg hover:bg-[#00d4aa] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
            <button
              type="button"
              onClick={() => setShowNewProject(false)}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowNewProject(true)}
          className="group bg-[#12121a]/50 border-2 border-dashed border-[#00f5d4]/30 rounded-xl p-6 md:p-8 flex flex-col items-center justify-center gap-4 hover:border-[#00f5d4] hover:bg-[#00f5d4]/5 transition-all min-h-[180px]"
        >
          <div className="w-14 h-14 rounded-full bg-[#00f5d4]/10 flex items-center justify-center group-hover:bg-[#00f5d4]/20 transition-colors">
            <svg className="w-7 h-7 text-[#00f5d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <div className="text-center">
            <p className="text-white font-bold mb-1">New Project</p>
            <p className="text-gray-500 text-sm font-mono">Start building with AI</p>
          </div>
        </button>
      )}

      {/* Existing Projects */}
      {projects.map((project, index) => (
        <button
          key={project._id}
          onClick={() => onSelect(project._id)}
          className="group text-left bg-[#12121a]/80 border border-[#00f5d4]/10 rounded-xl p-6 hover:border-[#00f5d4]/40 hover:shadow-lg hover:shadow-[#00f5d4]/5 transition-all animate-[fadeIn_0.3s_ease-out]"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#00f5d4]/20 to-[#ff6b9d]/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-[#00f5d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <button
              onClick={(e) => handleDelete(e, project._id)}
              className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-red-400 transition-all"
              title="Delete project"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          <h3 className="text-white font-bold text-lg mb-2 group-hover:text-[#00f5d4] transition-colors line-clamp-1">
            {project.name}
          </h3>
          <p className="text-gray-400 text-sm font-mono line-clamp-2 mb-4">
            {project.description}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 font-mono">
            <span>
              {new Date(project.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1 text-[#00f5d4]/60 group-hover:text-[#00f5d4] transition-colors">
              Open
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </span>
          </div>
        </button>
      ))}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
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
