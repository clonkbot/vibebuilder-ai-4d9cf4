import { useMemo } from "react";
import { ProjectFile } from "./Builder";

interface PreviewProps {
  files: ProjectFile[];
}

export function Preview({ files }: PreviewProps) {
  const previewContent = useMemo(() => {
    const htmlFile = files.find(f => f.path.endsWith('.html'));
    const cssFile = files.find(f => f.path.endsWith('.css'));
    const jsFile = files.find(f => f.path.endsWith('.js'));

    if (!htmlFile) {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #0a0a0f 0%, #12121a 100%);
              color: #666;
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div>Create an index.html file to see preview</div>
        </body>
        </html>
      `;
    }

    let html = htmlFile.content;

    // Inject CSS inline
    if (cssFile) {
      const styleTag = `<style>\n${cssFile.content}\n</style>`;
      if (html.includes('</head>')) {
        html = html.replace('</head>', `${styleTag}\n</head>`);
      } else if (html.includes('<body')) {
        html = html.replace('<body', `${styleTag}\n<body`);
      } else {
        html = styleTag + html;
      }
    }

    // Inject JS inline
    if (jsFile) {
      const scriptTag = `<script>\n${jsFile.content}\n</script>`;
      if (html.includes('</body>')) {
        html = html.replace('</body>', `${scriptTag}\n</body>`);
      } else {
        html = html + scriptTag;
      }
    }

    // Remove external CSS/JS links since we're inlining
    html = html.replace(/<link[^>]*href=["'][^"']*\.css["'][^>]*>/gi, '');
    html = html.replace(/<script[^>]*src=["'][^"']*\.js["'][^>]*><\/script>/gi, '');

    return html;
  }, [files]);

  const srcDoc = previewContent;

  return (
    <div className="h-full flex flex-col bg-[#0a0a0f]">
      {/* Preview header */}
      <div className="flex-shrink-0 flex items-center gap-2 px-3 py-2 border-b border-[#00f5d4]/10 bg-[#0d0d14]">
        <div className="flex gap-1.5">
          <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
          <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
          <span className="w-3 h-3 rounded-full bg-[#27ca40]" />
        </div>
        <div className="flex-1 mx-2 bg-[#0a0a0f] rounded-md px-3 py-1 flex items-center gap-2">
          <svg className="w-3 h-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <span className="text-[10px] font-mono text-gray-500">localhost:preview</span>
        </div>
        <span className="text-[10px] font-mono text-[#00f5d4] uppercase tracking-wider">Live</span>
      </div>

      {/* Preview iframe */}
      <div className="flex-1 relative">
        <iframe
          srcDoc={srcDoc}
          title="Preview"
          sandbox="allow-scripts allow-modals"
          className="absolute inset-0 w-full h-full border-0 bg-white"
        />

        {/* Holographic overlay effect */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.02]"
          style={{
            background: `repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(0, 245, 212, 0.03) 2px,
              rgba(0, 245, 212, 0.03) 4px
            )`
          }}
        />
      </div>
    </div>
  );
}
