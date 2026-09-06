import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Code2, 
  Server, 
  Zap, 
  CheckCircle2, 
  Cpu,
  Layers,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../api/client';

interface FastAPIInspectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FastAPIInspectorModal: React.FC<FastAPIInspectorModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [pythonCode, setPythonCode] = useState(
`import sys
import json

print(f"Python Version: {sys.version.split()[0]}")

# Simulate agent decision scoring
candidate = {"name": "Sarah Jenkins", "level": "L5", "skills": ["Go", "Distributed Systems"]}
score = 0.94
print(f"Candidate: {candidate['name']} | Evaluation Score: {score}")
print(json.dumps({"status": "PASS", "routing": "HITL_Review_Queue"}))`
  );
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');
  const [errorOutput, setErrorOutput] = useState('');
  const [copiedCurl, setCopiedCurl] = useState(false);
  const [activeTab, setActiveTab] = useState<'runner' | 'docs' | 'models'>('runner');

  if (!isOpen) return null;

  const handleRunPython = async () => {
    setIsRunning(true);
    setOutput('');
    setErrorOutput('');
    try {
      const res = await apiClient.runPython(pythonCode);
      if (res.success) {
        setOutput(res.stdout || '[Script finished with no stdout output]');
        if (res.stderr) setErrorOutput(res.stderr);
      } else {
        setErrorOutput(res.error || res.stderr || 'Execution failed');
      }
    } catch (err: any) {
      setErrorOutput(err.message || 'Execution error');
    } finally {
      setIsRunning(false);
    }
  };

  const copyCurl = () => {
    const curlCommand = `uvicorn fastapi_app:app --host 0.0.0.0 --port 8000 --reload`;
    navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div 
      id="fastapi-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        id="fastapi-modal-container"
        className="w-full max-w-3xl bg-[#28051e] border border-[#6b1e4c]/60 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#4d163a]/60 bg-[#320826]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#981549] to-[#FA1E71] flex items-center justify-center text-white shadow-lg shadow-[#FA1E71]/30">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h3 className="text-lg font-bold text-white font-display">
                  FastAPI & Python System Bridge
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-green-500/20 text-green-300 border border-green-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                  Active Backend
                </span>
              </div>
              <p className="text-xs text-[#d8aab4] mt-0.5">
                Execute Python cluster scripts, inspect FastAPI schemas, and test API endpoints
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-[#e5bdc3]/60 hover:text-white hover:bg-[#4d163a]/50 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="px-6 pt-3 flex items-center gap-2 border-b border-[#4d163a]/60 bg-[#25091b]">
          <button
            onClick={() => setActiveTab('runner')}
            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'runner'
                ? 'bg-[#350b26] text-white border-t-2 border-[#FA1E71]'
                : 'text-[#d8aab4] hover:text-white'
            }`}
          >
            <Play className="w-3.5 h-3.5 text-[#FA1E71]" />
            <span>Live Python Terminal</span>
          </button>
          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'docs'
                ? 'bg-[#350b26] text-white border-t-2 border-[#FA1E71]'
                : 'text-[#d8aab4] hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-[#FA1E71]" />
            <span>FastAPI Endpoints Spec</span>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 custom-scrollbar">
          {activeTab === 'runner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#ffd8e9] uppercase tracking-wider">
                  Python Script Sandbox
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#d8aab4] font-mono">
                    fastapi_app.py ready
                  </span>
                </div>
              </div>

              <div className="rounded-xl bg-[#1b0113] border border-[#4d163a] overflow-hidden">
                <div className="px-4 py-2 bg-[#25091b] border-b border-[#4d163a] flex items-center justify-between">
                  <span className="text-[11px] font-mono text-[#d8aab4]">run_agent_pipeline.py</span>
                  <button
                    onClick={handleRunPython}
                    disabled={isRunning}
                    className="px-3 py-1 rounded-md bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>{isRunning ? 'Executing...' : 'Run Code'}</span>
                  </button>
                </div>
                <textarea
                  rows={7}
                  value={pythonCode}
                  onChange={(e) => setPythonCode(e.target.value)}
                  className="w-full p-4 bg-[#1b0113] text-xs font-mono text-white leading-relaxed focus:outline-none resize-y"
                  spellCheck={false}
                />
              </div>

              {/* Terminal Output */}
              {(output || errorOutput) && (
                <div className="rounded-xl bg-[#0f000b] border border-[#4d163a] p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono text-[#d8aab4] flex items-center gap-1.5">
                      <Terminal className="w-3.5 h-3.5 text-[#FA1E71]" /> Terminal Output
                    </span>
                    {output && !errorOutput && (
                      <span className="text-[10px] font-mono text-green-400">Exit Code: 0</span>
                    )}
                  </div>
                  {output && (
                    <pre className="text-xs font-mono text-green-300 whitespace-pre-wrap">
                      {output}
                    </pre>
                  )}
                  {errorOutput && (
                    <pre className="text-xs font-mono text-red-400 whitespace-pre-wrap">
                      {errorOutput}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === 'docs' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#1b0113] border border-[#4d163a] flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-white">FastAPI Local Startup Command</div>
                  <code className="text-xs text-[#ffb1c0] font-mono mt-1 block">
                    uvicorn fastapi_app:app --host 0.0.0.0 --port 8000 --reload
                  </code>
                </div>
                <button
                  onClick={copyCurl}
                  className="px-3 py-1.5 rounded-lg bg-[#3d0f2c] border border-[#ffb1c0]/30 text-xs text-[#ffd8e9] hover:bg-[#FA1E71] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCurl ? 'Copied' : 'Copy Command'}</span>
                </button>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-semibold text-[#e5bdc3] uppercase tracking-wider">
                  Available REST Endpoints:
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-3 rounded-lg bg-[#1b0113] border border-[#4d163a] flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold text-[10px]">GET</span>
                      <span className="text-white">/api/health</span>
                    </div>
                    <span className="text-[#d8aab4] text-[11px] font-sans">Cluster Health & Python Runtime</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#1b0113] border border-[#4d163a] flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold text-[10px]">GET</span>
                      <span className="text-white">/api/agents</span>
                    </div>
                    <span className="text-[#d8aab4] text-[11px] font-sans">List Autonomous MCP Agents</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#1b0113] border border-[#4d163a] flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                      <span className="text-white">/api/agents/:id/simulate</span>
                    </div>
                    <span className="text-[#d8aab4] text-[11px] font-sans">Simulate Agent Tool & Step Execution</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#1b0113] border border-[#4d163a] flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-green-500/20 text-green-400 font-bold text-[10px]">GET</span>
                      <span className="text-white">/api/failures</span>
                    </div>
                    <span className="text-[#d8aab4] text-[11px] font-sans">Critical Exception & Barrier Tickets</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#1b0113] border border-[#4d163a] flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                      <span className="text-white">/api/decisions/:id/approve</span>
                    </div>
                    <span className="text-[#d8aab4] text-[11px] font-sans">Human-in-the-Loop Supervisory Approval</span>
                  </div>

                  <div className="p-3 rounded-lg bg-[#1b0113] border border-[#4d163a] flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px]">POST</span>
                      <span className="text-white">/api/knowledge/search</span>
                    </div>
                    <span className="text-[#d8aab4] text-[11px] font-sans">Semantic Vector Similarity Query</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#4d163a]/60 bg-[#320826]/70">
          <span className="text-xs text-[#d8aab4]">
            Backend code file: <span className="font-mono text-white">fastapi_app.py</span>
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
