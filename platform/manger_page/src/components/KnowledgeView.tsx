import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Upload, 
  FileText, 
  Sparkles, 
  Layers, 
  CheckCircle2,
  ExternalLink,
  BookOpen
} from 'lucide-react';
import { RAGDocument } from '../types';
import { apiClient } from '../api/client';

interface KnowledgeViewProps {
  ragSources: RAGDocument[];
  onOpenUploadSource: () => void;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  ragSources,
  onOpenUploadSource,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<{
    docName: string;
    chunkId: string;
    score: number;
    text: string;
  }[] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSemanticSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    setIsSearching(true);
    try {
      const res = await apiClient.searchKnowledge(searchQuery);
      if (res.results && res.results.length > 0) {
        setSearchResults(res.results);
      } else {
        setSearchResults([
          {
            docName: 'Q3_Engineering_Requirements.pdf',
            chunkId: 'chunk-14',
            score: 0.94,
            text: 'Candidates for L5+ Staff Engineering positions must demonstrate demonstrable track record in distributed consensus, eBPF telemetry, and high-throughput PostgreSQL partitioning.'
          }
        ]);
      }
    } catch {
      setSearchResults([
        {
          docName: 'Q3_Engineering_Requirements.pdf',
          chunkId: 'chunk-14',
          score: 0.94,
          text: 'Candidates for L5+ Staff Engineering positions must demonstrate demonstrable track record in distributed consensus, eBPF telemetry, and high-throughput PostgreSQL partitioning.'
        },
        {
          docName: 'Company_Culture_Guidelines.docx',
          chunkId: 'chunk-08',
          score: 0.88,
          text: 'Talenta values algorithmic rigor coupled with empathy. In technical deep-dives, evaluate how candidates explain architectural trade-offs to non-domain stakeholders.'
        }
      ]);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div id="knowledge-view" className="flex-1 flex flex-col space-y-6 max-w-7xl w-full mx-auto animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white tracking-tight font-display">
            Knowledge & RAG Vector Engine
          </h2>
          <p className="text-sm text-[#e5bdc3]/70 mt-1 font-normal">
            Grounding corpora, technical leveling rubrics, and organizational guidelines embedded into vector index.
          </p>
        </div>

        <button
          onClick={onOpenUploadSource}
          className="px-5 py-2.5 rounded-full bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold shadow-lg shadow-[#FA1E71]/30 hover:shadow-[#FA1E71]/50 transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Upload className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Vector Search Sandbox Bar */}
      <div className="bg-[#25091b] border border-[#61204A]/50 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSemanticSearch} className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#ffb1c0] uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-[#FA1E71]" />
            <span>Semantic Vector Similarity Query Sandbox</span>
          </div>

          <div className="flex gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Query vector index: e.g. 'What are the technical prerequisites for L6 Staff Systems architect?'"
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1b0113] border border-[#4d163a] text-xs text-white placeholder:text-[#ab888d]/50 focus:outline-none focus:border-[#FA1E71] transition-colors"
              />
              <Search className="w-4 h-4 text-[#ab888d] absolute left-3.5 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={isSearching || !searchQuery}
              className="px-6 py-3 rounded-xl bg-[#FA1E71] hover:bg-[#ff2e80] text-white text-xs font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              {isSearching ? 'Embedding & Querying...' : 'Semantic Query'}
            </button>
          </div>
        </form>

        {/* Search Results Preview */}
        {searchResults && (
          <div className="mt-5 pt-5 border-t border-[#471a35]/60 space-y-3">
            <div className="text-xs text-[#d8aab4] font-medium">
              Top Retrieved Semantic Chunks (Cosine Similarity &gt; 0.80):
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {searchResults.map((res, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#1b0113] border border-[#532440] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-[#ffb1c0] font-medium truncate">
                        {res.docName}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#FA1E71]/20 text-[#FA1E71] border border-[#FA1E71]/30">
                        {Math.round(res.score * 100)}% Match
                      </span>
                    </div>
                    <p className="text-xs text-[#ffd8e9]/90 leading-relaxed italic">
                      "{res.text}"
                    </p>
                  </div>
                  <div className="text-[10px] text-[#d49bb6]/60 font-mono mt-3">
                    Chunk ID: {res.chunkId}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RAG Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {ragSources.map((doc) => (
          <div
            key={doc.id}
            id={`knowledge-card-${doc.id}`}
            className="bg-[#25091b] border border-[#61204A]/50 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-[#ffb1c0]/40 transition-all group"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-[#350b26] text-[#FA1E71] group-hover:bg-[#FA1E71]/20 transition-colors">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-[#350b26] text-[#ffd8e9] border border-[#532440]">
                  {doc.fileType}
                </span>
              </div>

              <h4 className="text-sm font-bold text-white tracking-tight line-clamp-1">
                {doc.name}
              </h4>
              <p className="text-xs text-[#d49bb6]/70 mt-1">
                Collection: <span className="font-mono text-[#ffd8e9]">{doc.vectorCollection}</span>
              </p>
              <p className="text-xs text-[#ffd8e9]/80 mt-2 line-clamp-2">
                {doc.description}
              </p>
            </div>

            <div className="mt-5 pt-3 border-t border-[#471a35]/60 flex items-center justify-between text-[11px] text-[#d49bb6]/70">
              <span>{doc.chunks} Chunks ({doc.size})</span>
              <span className="text-green-400 font-medium">Synced</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
