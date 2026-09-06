import React, { useState } from 'react';
import { 
  X, 
  UploadCloud, 
  FileText, 
  Database, 
  Sparkles, 
  CheckCircle2, 
  Layers,
  ArrowRight
} from 'lucide-react';
import { RAGDocument } from '../types';
import { apiClient } from '../api/client';

interface UploadSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete: (newDoc: RAGDocument) => void;
}

export const UploadSourceModal: React.FC<UploadSourceModalProps> = ({
  isOpen,
  onClose,
  onUploadComplete,
}) => {
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState<'pdf' | 'docx' | 'md' | 'json'>('pdf');
  const [collection, setCollection] = useState('engineering-roles-2026');
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName) return;

    setIsUploading(true);
    let progress = 10;
    const interval = setInterval(() => {
      progress += 25;
      if (progress >= 100) {
        clearInterval(interval);
      }
    }, 150);

    try {
      const res = await apiClient.uploadKnowledgeDoc({
        name: fileName,
        fileType,
        vectorCollection: collection,
        description: description || 'Vectorized organizational document for recruiter grounding.'
      });
      setIsUploading(false);
      if (res.document) {
        onUploadComplete(res.document);
        onClose();
        return;
      }
    } catch {
      // fallback
    }

    setTimeout(() => {
      setIsUploading(false);
      const newDoc: RAGDocument = {
        id: `rag-${Date.now()}`,
        name: fileName.endsWith(`.${fileType}`) ? fileName : `${fileName}.${fileType}`,
        fileType,
        synced: 'Just now',
        size: `${(Math.random() * 2 + 1).toFixed(1)} MB`,
        chunks: Math.floor(Math.random() * 80 + 30),
        embeddings: Math.floor(Math.random() * 80 + 30),
        vectorCollection: collection,
        description: description || 'Vectorized organizational document for recruiter grounding.',
        status: 'synced',
      };
      onUploadComplete(newDoc);
      onClose();
    }, 400);
  };

  const handleSelectPredefined = (name: string, type: 'pdf' | 'docx' | 'md' | 'json', col: string) => {
    setFileName(name);
    setFileType(type);
    setCollection(col);
  };

  return (
    <div 
      id="upload-rag-modal-backdrop" 
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
    >
      <div 
        id="upload-rag-modal-container"
        className="w-full max-w-xl bg-[#28051e] border border-[#6b1e4c]/60 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#4d163a]/60 bg-[#320826]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#FA1E71]/20 border border-[#FA1E71]/40 flex items-center justify-center text-[#FA1E71]">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white font-display">
                Upload New RAG Source
              </h3>
              <p className="text-xs text-[#d8aab4] mt-0.5">
                Ingest & vectorize hiring rubrics, job specifications, and culture docs
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Dropzone Simulation */}
          <div 
            onClick={() => !fileName && setFileName('Q4_Product_Management_Rubrics')}
            className="border-2 border-dashed border-[#6b1e4c] hover:border-[#FA1E71] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-[#1b0113]/60 hover:bg-[#320826]/30 group"
          >
            <div className="w-12 h-12 rounded-2xl bg-[#3c0f2a] group-hover:bg-[#FA1E71]/20 flex items-center justify-center text-[#FA1E71] mb-3 transition-colors">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-white">
              {fileName ? `${fileName}.${fileType}` : 'Click or drop files to vectorize'}
            </p>
            <p className="text-xs text-[#d8aab4] mt-1">
              Supports PDF, DOCX, Markdown, or JSON specifications (up to 50MB)
            </p>
          </div>

          {/* Quick presets */}
          <div>
            <span className="text-xs text-[#d8aab4] block mb-2 font-medium">Quick Template Presets:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleSelectPredefined('Q4_Product_Management_Rubrics', 'pdf', 'engineering-roles-2026')}
                className="px-2.5 py-1 text-xs rounded-lg bg-[#3c0f2a] border border-[#ffb1c0]/20 text-[#ffd8e9] hover:border-[#FA1E71] transition-colors cursor-pointer"
              >
                + Q4_PM_Rubrics.pdf
              </button>
              <button
                type="button"
                onClick={() => handleSelectPredefined('Autonomous_Interview_Guidelines', 'docx', 'culture-rubrics')}
                className="px-2.5 py-1 text-xs rounded-lg bg-[#3c0f2a] border border-[#ffb1c0]/20 text-[#ffd8e9] hover:border-[#FA1E71] transition-colors cursor-pointer"
              >
                + Interview_Guidelines.docx
              </button>
              <button
                type="button"
                onClick={() => handleSelectPredefined('Security_Compliance_2026', 'md', 'technical-evaluations')}
                className="px-2.5 py-1 text-xs rounded-lg bg-[#3c0f2a] border border-[#ffb1c0]/20 text-[#ffd8e9] hover:border-[#FA1E71] transition-colors cursor-pointer"
              >
                + Security_Compliance.md
              </button>
            </div>
          </div>

          {/* Document Name & Type */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-[#d8aab4] mb-1.5">
                Document File Name
              </label>
              <input
                type="text"
                required
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                placeholder="e.g. Q4_Frontend_Requirements"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b0113] border border-[#4d163a] text-xs text-white placeholder:text-[#ab888d]/50 focus:outline-none focus:border-[#FA1E71]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#d8aab4] mb-1.5">
                Format
              </label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b0113] border border-[#4d163a] text-xs text-white focus:outline-none focus:border-[#FA1E71] cursor-pointer"
              >
                <option value="pdf">PDF (.pdf)</option>
                <option value="docx">Word (.docx)</option>
                <option value="md">Markdown (.md)</option>
                <option value="json">JSON (.json)</option>
              </select>
            </div>
          </div>

          {/* Vector Collection */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#d8aab4] mb-1.5">
                Vector Target Collection
              </label>
              <select
                value={collection}
                onChange={(e) => setCollection(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#1b0113] border border-[#4d163a] text-xs text-white focus:outline-none focus:border-[#FA1E71] cursor-pointer"
              >
                <option value="engineering-roles-2026">engineering-roles-2026</option>
                <option value="culture-rubrics">culture-rubrics</option>
                <option value="compensation-matrices">compensation-matrices</option>
                <option value="technical-evaluations">technical-evaluations</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#d8aab4] mb-1.5">
                Embedding Model
              </label>
              <div className="px-3.5 py-2.5 rounded-xl bg-[#1b0113] border border-[#4d163a] text-xs text-[#ffb1c0] font-mono">
                text-embedding-004 (768-d)
              </div>
            </div>
          </div>

          {/* Progress Bar when uploading */}
          {isUploading && (
            <div className="space-y-2 p-3 rounded-xl bg-[#390e29] border border-[#FA1E71]/40">
              <div className="flex items-center justify-between text-xs">
                <span className="text-white font-medium flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FA1E71] animate-spin" />
                  Generating Chunks & Vector Embeddings...
                </span>
                <span className="text-[#FA1E71] font-mono font-bold">{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-[#1b0113] overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-[#981549] to-[#FA1E71] transition-all duration-200" 
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#4d163a]/40">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-full text-xs font-medium text-[#d8aab4] hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isUploading || !fileName}
              className="px-5 py-2.5 rounded-full bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold shadow-lg shadow-[#FA1E71]/30 hover:shadow-[#FA1E71]/50 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>{isUploading ? 'Vectorizing...' : 'Upload & Sync Source'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
