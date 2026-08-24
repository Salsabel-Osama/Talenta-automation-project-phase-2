import React, { useState, useEffect } from 'react';
import { 
  AgentMode, 
  AgentSpec, 
  Candidate, 
  ChatMessage, 
  NavigationTab, 
  PipelineRun, 
  ReviewItem, 
  WorkflowStep 
} from './types';
import { 
  INITIAL_CHAT_MESSAGES, 
  INITIAL_REVIEW_ITEMS, 
  INITIAL_WORKFLOW_STEPS, 
  MOCK_AGENTS, 
  MOCK_CANDIDATES, 
  MOCK_RUNS,
  KNOWLEDGE_DOCS 
} from './data/mockData';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { ChatView } from './components/ChatView';
import { ContextStream } from './components/ContextStream';
import { AgentsView } from './components/AgentsView';
import { RunsView } from './components/RunsView';
import { HumanReviewView } from './components/HumanReviewView';
import { KnowledgeView } from './components/KnowledgeView';
import { DashboardView } from './components/DashboardView';
import { 
  CandidateDetailModal, 
  CreateRunModal, 
  DeployAgentModal, 
  ModifyParametersModal,
  IndexDocumentModal,
  OutreachResultModal
} from './components/Modals';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('chat');
  const [activeAgentMode, setActiveAgentMode] = useState<AgentMode>('planning');
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);
  const [reviewItems, setReviewItems] = useState<ReviewItem[]>(INITIAL_REVIEW_ITEMS);
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>(INITIAL_WORKFLOW_STEPS);
  const [agents, setAgents] = useState<AgentSpec[]>(MOCK_AGENTS);
  const [runs, setRuns] = useState<PipelineRun[]>(MOCK_RUNS);
  const [candidates, setCandidates] = useState<Candidate[]>(MOCK_CANDIDATES);
  const [knowledgeDocs, setKnowledgeDocs] = useState(KNOWLEDGE_DOCS);
  const [discoveredCandidates, setDiscoveredCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active Operation State
  const [isDeployModalOpen, setIsDeployModalOpen] = useState(false);
  const [isCreateRunModalOpen, setIsCreateRunModalOpen] = useState(false);
  const [isModifyParamsModalOpen, setIsModifyParamsModalOpen] = useState(false);
  const [isIndexModalOpen, setIsIndexModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  const [testingAgentId, setTestingAgentId] = useState<string | null>(null);
  const [isGeneratingOutreach, setIsGeneratingOutreach] = useState(false);
  const [outreachModalData, setOutreachModalData] = useState<{
    isOpen: boolean;
    candidateName: string;
    subject: string;
    body: string;
  }>({
    isOpen: false,
    candidateName: '',
    subject: '',
    body: ''
  });

  // Initial Fetch from Backend
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [agentsRes, runsRes, reviewRes, candidatesRes, knowledgeRes] = await Promise.allSettled([
          fetch('/api/agents').then(r => r.json()),
          fetch('/api/runs').then(r => r.json()),
          fetch('/api/review').then(r => r.json()),
          fetch('/api/candidates').then(r => r.json()),
          fetch('/api/knowledge').then(r => r.json()),
        ]);

        if (agentsRes.status === 'fulfilled' && agentsRes.value?.agents) {
          setAgents(agentsRes.value.agents);
        }
        if (runsRes.status === 'fulfilled' && runsRes.value?.runs) {
          setRuns(runsRes.value.runs);
        }
        if (reviewRes.status === 'fulfilled' && reviewRes.value?.reviewItems) {
          setReviewItems(reviewRes.value.reviewItems);
        }
        if (candidatesRes.status === 'fulfilled' && candidatesRes.value?.candidates) {
          setCandidates(candidatesRes.value.candidates);
        }
        if (knowledgeRes.status === 'fulfilled' && knowledgeRes.value?.documents) {
          setKnowledgeDocs(knowledgeRes.value.documents);
        }
      } catch (err) {
        console.warn('Initial backend sync using local cache:', err);
      }
    }

    loadBackendData();
  }, []);

  // 1. Send Message with Live Multi-Agent Backend Orchestration
  const handleSendMessage = async (content: string, mode: AgentMode) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, mode })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.message) {
          setMessages(prev => [...prev, data.message]);
        }
        if (data.candidates && Array.isArray(data.candidates)) {
          setDiscoveredCandidates(data.candidates);
        }
      } else {
        throw new Error('Chat API returned error');
      }
    } catch (err) {
      // Fallback
      setTimeout(() => {
        const fallbackMsg: ChatMessage = {
          id: `msg-agent-${Date.now()}`,
          sender: 'agent',
          agentName: mode === 'state-graph' ? 'State-Graph Sourcing Agent' : 'Planning Agent',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          content: `Processed requisition for "${content}". Decomposed search sub-tasks across active autonomous agents.`,
          tasks: [
            {
              id: `task-${Date.now()}-1`,
              taskNumber: 1,
              title: 'PROFILE & RUBRIC ALIGNMENT',
              assignedAgent: 'RAG Agent',
              assignedAgentType: 'rag',
              description: 'Aligning competency matrix and leveling criteria against market benchmarks.',
              status: 'running'
            },
            {
              id: `task-${Date.now()}-2`,
              taskNumber: 2,
              title: 'CYCLIC SOURCING EXECUTION',
              assignedAgent: 'State-Graph Agent',
              assignedAgentType: 'state-graph',
              description: 'Scanning external professional networks and research publications.',
              status: 'pending'
            }
          ],
          actionRequired: true
        };
        setMessages(prev => [...prev, fallbackMsg]);
        setDiscoveredCandidates(candidates);
      }, 500);
    }
  };

  // 2. Approve Execution Action
  const handleApproveExecution = () => {
    setWorkflowSteps(prev => 
      prev.map((step, idx) => {
        if (idx === 1) return { ...step, status: 'completed', detail: 'Completed RAG vector alignment' };
        if (idx === 2) return { ...step, status: 'in_progress', detail: 'State-Graph crawler actively finding candidates...', progress: 85 };
        return step;
      })
    );

    setDiscoveredCandidates(candidates);

    const confirmMsg: ChatMessage = {
      id: `msg-conf-${Date.now()}`,
      sender: 'agent',
      agentName: 'Planning Agent',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: 'Execution Approved! RAG Agent & State-Graph Crawler have started the live sourcing loop. 4 high-match profiles discovered with vector scores > 89%.'
    };
    setMessages(prev => [...prev, confirmMsg]);
  };

  // 3. Human Review Decisions via API
  const handleOverrideBudget = async (reviewId: string) => {
    setReviewItems(prev => 
      prev.map(r => r.id === reviewId ? { ...r, status: 'overridden' } : r)
    );

    try {
      await fetch(`/api/review/${reviewId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'override' })
      });
    } catch (e) {
      console.warn(e);
    }

    const overrideMsg: ChatMessage = {
      id: `msg-rev-${Date.now()}`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: '⚡ Human Decision Recorded: Budget constraint updated to $230,000. Sourcing filter broadened to capture 95th-percentile ML engineers.'
    };
    setMessages(prev => [...prev, overrideMsg]);
  };

  const handleKeepBudget = async (reviewId: string) => {
    setReviewItems(prev => 
      prev.map(r => r.id === reviewId ? { ...r, status: 'kept' } : r)
    );

    try {
      await fetch(`/api/review/${reviewId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'keep' })
      });
    } catch (e) {
      console.warn(e);
    }

    const keepMsg: ChatMessage = {
      id: `msg-rev-${Date.now()}`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: '⚡ Human Decision Recorded: Hard cap enforced at $200,000. Prioritizing candidates in tier-2 compensation regions.'
    };
    setMessages(prev => [...prev, keepMsg]);
  };

  const handleDismissReview = async (reviewId: string) => {
    setReviewItems(prev => prev.filter(r => r.id !== reviewId));
    try {
      await fetch(`/api/review/${reviewId}/decision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ decision: 'dismiss' })
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // 4. Deploy New Agent via API
  const handleDeployAgent = async (newAgentData: Partial<AgentSpec>) => {
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgentData)
      });
      if (res.ok) {
        const { agent } = await res.json();
        setAgents(prev => [agent, ...prev]);
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    const fallbackAgent: AgentSpec = {
      id: `agent-${Date.now()}`,
      name: newAgentData.name || 'Custom Agent',
      role: newAgentData.role || 'Recruitment Specialist',
      iconType: 'planning',
      status: 'active',
      autonomyLevel: newAgentData.autonomyLevel || 'Human-in-the-Loop',
      runsCount: 0,
      successRate: 100,
      description: newAgentData.description || 'Newly deployed autonomous talent agent.',
      systemPrompt: newAgentData.systemPrompt || 'Autonomous talent search agent.',
      currentTask: 'Initialized and standing by for pipeline assignment'
    };
    setAgents(prev => [fallbackAgent, ...prev]);
  };

  // 5. Create Pipeline Run via API
  const handleCreateRun = async (newRunData: Partial<PipelineRun>) => {
    try {
      const res = await fetch('/api/runs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRunData)
      });
      if (res.ok) {
        const { run } = await res.json();
        setRuns(prev => [run, ...prev]);
        setCurrentTab('runs');
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    const fallbackRun: PipelineRun = {
      id: `RUN-2026-${Math.floor(100 + Math.random() * 900)}`,
      roleTitle: newRunData.roleTitle || 'Senior Engineer',
      department: newRunData.department || 'Engineering',
      targetBudget: newRunData.targetBudget || '$200k',
      activeAgents: newRunData.activeAgents || ['Planning Agent', 'State-Graph Agent'],
      status: 'Running',
      candidatesFound: 4,
      startTime: 'Just now',
      completedSteps: 1,
      totalSteps: 4
    };
    setRuns(prev => [fallbackRun, ...prev]);
    setCurrentTab('runs');
  };

  // 6. Update Agent Autonomy via API
  const handleUpdateAutonomy = async (agentId: string, level: AgentSpec['autonomyLevel']) => {
    setAgents(prev => 
      prev.map(a => a.id === agentId ? { ...a, autonomyLevel: level } : a)
    );

    try {
      await fetch(`/api/agents/${agentId}/autonomy`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ autonomyLevel: level })
      });
    } catch (e) {
      console.warn(e);
    }
  };

  // 7. Test Run Agent with Live Telemetry
  const handleRunAgent = async (agentId: string) => {
    setTestingAgentId(agentId);
    try {
      const res = await fetch(`/api/agents/${agentId}/test-run`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setAgents(prev => prev.map(a => a.id === agentId ? { ...a, runsCount: a.runsCount + 1 } : a));
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setTimeout(() => {
        setTestingAgentId(null);
      }, 1500);
    }
  };

  // 8. Generate AI Outreach Sequence via Gemini Backend API
  const handleGenerateOutreach = async (candidate: Candidate) => {
    setIsGeneratingOutreach(true);
    try {
      const res = await fetch(`/api/candidates/${candidate.id}/outreach`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.outreach) {
          setSelectedCandidate(null);
          setOutreachModalData({
            isOpen: true,
            candidateName: candidate.name,
            subject: data.outreach.subject,
            body: data.outreach.body
          });
          if (data.outreach.reviewItem) {
            setReviewItems(prev => [data.outreach.reviewItem, ...prev]);
          }
          return;
        }
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setIsGeneratingOutreach(false);
    }

    // Fallback
    setSelectedCandidate(null);
    setOutreachModalData({
      isOpen: true,
      candidateName: candidate.name,
      subject: `Executive Opportunity: Exploring Senior ML Leadership at our Team`,
      body: `Hi ${candidate.name.split(' ')[0]},\n\nI was reviewing your contributions at ${candidate.company} and your expertise in ${candidate.skills.slice(0, 3).join(', ')}. We are scaling our core systems and would love to discuss a pivotal leadership role with you.\n\nBest regards,\nTalent Acquisition Team`
    });
  };

  // 9. Index New Knowledge Document via API
  const handleIndexDocument = async (doc: { title: string; category: string; summary: string; profilesIndexed: string }) => {
    try {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
      });
      if (res.ok) {
        const { document } = await res.json();
        setKnowledgeDocs(prev => [document, ...prev]);
        return;
      }
    } catch (e) {
      console.warn(e);
    }

    const fallbackDoc = {
      id: `kb-${Date.now()}`,
      title: doc.title,
      category: doc.category,
      profilesIndexed: doc.profilesIndexed,
      lastUpdated: 'Just now',
      summary: doc.summary
    };
    setKnowledgeDocs(prev => [fallbackDoc, ...prev]);
  };

  // 10. Modify Parameters save
  const handleSaveParameters = (params: { budget: string; stack: string; level: string }) => {
    const updateMsg: ChatMessage = {
      id: `msg-param-${Date.now()}`,
      sender: 'system',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      content: `⚙️ Sourcing Parameters Calibrated: Budget: ${params.budget} | Level: ${params.level} | Stack: ${params.stack}. Re-aligning agent sub-tasks...`
    };
    setMessages(prev => [...prev, updateMsg]);
  };

  const pendingReviewCount = reviewItems.filter(r => r.status === 'pending').length;

  return (
    <div className="flex h-screen w-screen bg-[#240018] text-[#ffd8e9] overflow-hidden font-body select-none">
      {/* 1. Left Fixed Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        onDeployAgentClick={() => setIsDeployModalOpen(true)}
        pendingReviewCount={pendingReviewCount}
      />

      {/* 2. Central Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Sticky Navbar */}
        <Navbar
          currentTab={currentTab}
          onTabChange={setCurrentTab}
          onCreateRunClick={() => setIsCreateRunModalOpen(true)}
          reviewItems={reviewItems}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* View Switcher */}
        <div className="flex-1 flex overflow-hidden">
          {currentTab === 'chat' && (
            <>
              <ChatView
                messages={messages}
                onSendMessage={handleSendMessage}
                onApproveExecution={handleApproveExecution}
                onModifyParameters={() => setIsModifyParamsModalOpen(true)}
                onCandidateClick={setSelectedCandidate}
                discoveredCandidates={discoveredCandidates.length > 0 ? discoveredCandidates : candidates}
                activeAgentMode={activeAgentMode}
                onAgentModeChange={setActiveAgentMode}
              />
              <ContextStream
                reviewItems={reviewItems}
                workflowSteps={workflowSteps}
                matchedCandidates={candidates}
                onOverrideBudget={handleOverrideBudget}
                onKeepBudget={handleKeepBudget}
                onCandidateClick={setSelectedCandidate}
              />
            </>
          )}

          {currentTab === 'agents' && (
            <AgentsView
              agents={agents}
              onDeployAgentClick={() => setIsDeployModalOpen(true)}
              onRunAgent={handleRunAgent}
              onUpdateAutonomy={handleUpdateAutonomy}
              testingAgentId={testingAgentId}
            />
          )}

          {currentTab === 'runs' && (
            <RunsView
              runs={runs}
              onCreateRunClick={() => setIsCreateRunModalOpen(true)}
            />
          )}

          {currentTab === 'review' && (
            <HumanReviewView
              reviewItems={reviewItems}
              onOverride={handleOverrideBudget}
              onKeep={handleKeepBudget}
              onDismiss={handleDismissReview}
            />
          )}

          {currentTab === 'knowledge' && (
            <KnowledgeView
              onIndexClick={() => setIsIndexModalOpen(true)}
              documents={knowledgeDocs}
            />
          )}

          {(currentTab === 'dashboard' || currentTab === 'analytics') && (
            <DashboardView />
          )}
        </div>
      </div>

      {/* Modals */}
      <DeployAgentModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
        onDeploy={handleDeployAgent}
      />

      <CreateRunModal
        isOpen={isCreateRunModalOpen}
        onClose={() => setIsCreateRunModalOpen(false)}
        onCreate={handleCreateRun}
      />

      <CandidateDetailModal
        candidate={selectedCandidate}
        onClose={() => setSelectedCandidate(null)}
        onGenerateOutreach={handleGenerateOutreach}
        isGeneratingOutreach={isGeneratingOutreach}
      />

      <ModifyParametersModal
        isOpen={isModifyParamsModalOpen}
        onClose={() => setIsModifyParamsModalOpen(false)}
        onSave={handleSaveParameters}
      />

      <IndexDocumentModal
        isOpen={isIndexModalOpen}
        onClose={() => setIsIndexModalOpen(false)}
        onIndex={handleIndexDocument}
      />

      <OutreachResultModal
        isOpen={outreachModalData.isOpen}
        onClose={() => setOutreachModalData(prev => ({ ...prev, isOpen: false }))}
        candidateName={outreachModalData.candidateName}
        subject={outreachModalData.subject}
        body={outreachModalData.body}
        onSendToQueue={() => {
          const sysMsg: ChatMessage = {
            id: `msg-outreach-app-${Date.now()}`,
            sender: 'system',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            content: `✉️ Personalized outreach sequence approved for ${outreachModalData.candidateName} and queued for autonomous dispatch.`
          };
          setMessages(prev => [...prev, sysMsg]);
        }}
      />
    </div>
  );
}
