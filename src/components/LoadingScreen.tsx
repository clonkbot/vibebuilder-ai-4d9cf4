export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="w-full h-full"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 245, 212, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 245, 212, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Loading animation */}
      <div className="relative z-10 flex flex-col items-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-2 border-[#00f5d4]/30 rounded-lg animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 border-2 border-t-[#00f5d4] border-r-transparent border-b-transparent border-l-transparent rounded-lg animate-spin" />
        </div>
        <div className="font-mono text-[#00f5d4] text-sm tracking-widest animate-pulse">
          INITIALIZING...
        </div>
      </div>
    </div>
  );
}
