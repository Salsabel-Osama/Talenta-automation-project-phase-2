import React, { useState } from 'react';
import { 
  Database, 
  Search, 
  Sparkles, 
  Layers, 
  Upload, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { KNOWLEDGE_DOCS } from '../data/mockData';

interface KnowledgeViewProps {
  onIndexClick?: () => void;
  documents?: typeof KNOWLEDGE_DOCS;
}

export const KnowledgeView: React.FC<KnowledgeViewProps> = ({
  onIndexClick,
  documents = KNOWLEDGE_DOCS
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [inspectedDocId, setInspectedDocId] = useState<string | null>(null);

  const categories = ['All', 'Rubrics & Leveling', 'Market Intelligence', 'Talent Embeddings', 'Outreach & Messaging'];

  const filteredDocs = documents.filter(doc => {
    const matchesCat = selectedCategory === 'All' || doc.category === selectedCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          doc.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full bg-[#2b031d] overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-[#3a0f2a] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#240018]/60 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-2.5">
            <Database className="w-6 h-6 text-[#fa1e71]" />
            <h2 className="font-heading text-[22px] font-bold text-white tracking-tight">
              RAG Vector Knowledge Base
            </h2>
          </div>
          <p className="text-[13px] text-[#e5bdc3]/80 mt-1">
            Indexed talent embeddings, compensation rubrics, and internal hiring scorecards.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onIndexClick}
            className="py-1.5 px-4 rounded-full bg-[#fa1e71] hover:bg-[#e01662] text-white text-[13px] font-semibold flex items-center gap-1.5 transition-all shadow-md shadow-[#fa1e71]/20 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Index New Document</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#ab888d] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vector embeddings & rubrics..."
            className="w-full bg-[#240018] text-[13px] text-white pl-9.5 pr-4 py-2 rounded-full border border-[#471a35] focus:outline-none focus:border-[#fa1e71]"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1 rounded-full text-[12px] font-medium transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#fa1e71] text-white font-semibold shadow-sm'
                  : 'bg-[#240018] text-[#ab888d] border border-[#471a35] hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Knowledge Documents */}
      <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDocs.map((doc) => {
          const isInspecting = inspectedDocId === doc.id;
          return (
            <div
              key={doc.id}
              className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 group ${
                isInspecting
                  ? 'bg-[#350b26] border-[#fa1e71] shadow-xl'
                  : 'bg-[#240018] border-[#471a35] hover:border-[#61204a]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#3a0f2a] text-[#fa1e71] text-[11px] font-bold">
                    {doc.category}
                  </span>
                  <span className="text-[11px] text-[#ab888d]">Updated: {doc.lastUpdated}</span>
                </div>

                <h3 className="font-heading text-[16px] font-bold text-white group-hover:text-[#ffd8e9] transition-colors">
                  {doc.title}
                </h3>

                <p className="text-[13px] text-[#e5bdc3]/85 mt-2 leading-relaxed">
                  {doc.summary}
                </p>

                {isInspecting && (
                  <div className="mt-3 p-3 rounded-xl bg-[#1c0012] border border-[#471a35] text-[12px] text-[#ffd8e9] space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Vector Index Synced (1536 dims)</span>
                    </div>
                    <p className="text-[11px] text-[#ab888d]">
                      Cosine similarity threshold: 0.88 | Cluster partitions: 32 centroids
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#350b26] flex items-center justify-between text-[12px]">
                <div className="flex items-center gap-1.5 text-[#ab888d]">
                  <Layers className="w-3.5 h-3.5 text-[#fa1e71]" />
                  <span className="text-white font-medium">{doc.profilesIndexed}</span>
                </div>

                <button 
                  onClick={() => setInspectedDocId(isInspecting ? null : doc.id)}
                  className="text-[#fa1e71] hover:text-[#ffb1c0] font-semibold text-[12px] flex items-center gap-1 cursor-pointer"
                >
                  {isInspecting ? 'Hide Details' : 'Inspect Vectors'} <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
