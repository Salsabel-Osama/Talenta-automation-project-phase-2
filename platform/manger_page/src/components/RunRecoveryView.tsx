
import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  RotateCw,
  Skull,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Activity
} from 'lucide-react';

interface RunCheckpoint {
  runId: string;
  currentNode: string;
  step: number;
  status: string;
  updatedAt: string;
}

export const RunRecoveryView: React.FC = () => {
  const [checkpoint, setCheckpoint] = useState<RunCheckpoint | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const loadCheckpoint = async () => {
    try {
      const res = await fetch('/api/run/checkpoint');

      if (!res.ok) {
        setCheckpoint(null);
        return;
      }

      const data = await res.json();
      setCheckpoint(data);
    } catch {
      setCheckpoint(null);
    }
  };

  useEffect(() => {
    loadCheckpoint();

    const interval = setInterval(loadCheckpoint, 2000);
    return () => clearInterval(interval);
  }, []);

  const startRun = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/run/start', {
        method: 'POST'
      });

      const data = await res.json();

      setCheckpoint(data.checkpoint);
      setMessage('Run started and checkpoint saved.');
    } finally {
      setLoading(false);
    }
  };

  const killRun = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/run/kill', {
        method: 'POST'
      });

      const data = await res.json();

      setCheckpoint(data.checkpoint);
      setMessage('Run killed. Checkpoint preserved.');
    } finally {
      setLoading(false);
    }
  };

  const restartRun = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/run/restart', {
        method: 'POST'
      });

      const data = await res.json();

      setCheckpoint(data.checkpoint);
      setMessage('Process restarted and run recovered from checkpoint.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col space-y-6 max-w-7xl w-full mx-auto">

      <div>
        <h2 className="text-3xl font-bold text-white">
          Run Recovery & Checkpoints
        </h2>

        <p className="text-sm text-[#e5bdc3]/70 mt-1">
          Demonstrate checkpoint persistence, process recovery, and restart-safe execution.
        </p>
      </div>

      {/* Controls */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        <button
          onClick={startRun}
          disabled={loading}
          className="p-5 rounded-2xl bg-[#25091b] border border-[#61204A] hover:border-[#FA1E71] text-left"
        >
          <Play className="w-5 h-5 text-[#FA1E71] mb-3" />

          <div className="text-white font-semibold">
            Start Run
          </div>

          <div className="text-xs text-[#d8aab4] mt-1">
            Start a new autonomous run
          </div>
        </button>

        <button
          onClick={killRun}
          disabled={loading}
          className="p-5 rounded-2xl bg-[#25091b] border border-[#61204A] hover:border-red-500 text-left"
        >
          <Skull className="w-5 h-5 text-red-400 mb-3" />

          <div className="text-white font-semibold">
            Kill Process
          </div>

          <div className="text-xs text-[#d8aab4] mt-1">
            Simulate worker/process failure
          </div>
        </button>

        <button
          onClick={restartRun}
          disabled={loading}
          className="p-5 rounded-2xl bg-[#25091b] border border-[#61204A] hover:border-green-500 text-left"
        >
          <RotateCw className="w-5 h-5 text-green-400 mb-3" />

          <div className="text-white font-semibold">
            Restart & Recover
          </div>

          <div className="text-xs text-[#d8aab4] mt-1">
            Resume from persisted checkpoint
          </div>
        </button>

      </div>

      {/* Checkpoint */}

      <div className="rounded-2xl bg-[#25091b] border border-[#61204A]/50 p-6">

        <div className="flex items-center justify-between mb-5">

          <div className="flex items-center gap-2">

            <Activity className="w-5 h-5 text-[#FA1E71]" />

            <h3 className="text-lg font-bold text-white">
              Current Execution State
            </h3>

          </div>

          {checkpoint && (
            <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs">
              Checkpoint persisted
            </span>
          )}

        </div>

        {checkpoint ? (

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">

            <div>
              <div className="text-xs text-[#d8aab4]">
                Run ID
              </div>

              <div className="text-white font-mono text-sm mt-1">
                {checkpoint.runId}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#d8aab4]">
                Current Node
              </div>

              <div className="text-white font-mono text-sm mt-1">
                {checkpoint.currentNode}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#d8aab4]">
                Step
              </div>

              <div className="text-white font-mono text-sm mt-1">
                {checkpoint.step}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#d8aab4]">
                Status
              </div>

              <div className="text-white font-mono text-sm mt-1">
                {checkpoint.status}
              </div>
            </div>

            <div>
              <div className="text-xs text-[#d8aab4]">
                Updated
              </div>

              <div className="text-white font-mono text-sm mt-1">
                {new Date(checkpoint.updatedAt).toLocaleTimeString()}
              </div>
            </div>

          </div>

        ) : (

          <div className="text-sm text-[#d8aab4]">
            No active checkpoint.
          </div>

        )}

      </div>

      {message && (

        <div className="flex items-center gap-2 p-4 rounded-xl bg-[#390e29] border border-[#FA1E71]/40 text-white text-sm">

          <CheckCircle2 className="w-4 h-4 text-[#FA1E71]" />

          {message}

        </div>

      )}

    </div>
  );
};