export interface NavItem {
  id: string;
  label: string;
  href: string;
}

export interface Candidate {
  id: string;
  name: string;
  role: string;
  avatar: string;
  matchScore: number;
  skills: string[];
  velocity: string;
  experienceYears: number;
  location: string;
  aiSummary: string;
  status: 'recommended' | 'in_review' | 'shortlisted' | 'contacted';
}

export interface Feature {
  id: string;
  title: string;
  description: string;
  iconName: string;
  badge?: string;
  metric?: string;
}

export interface WorkflowStep {
  stepNumber: string;
  title: string;
  description: string;
  highlight: string;
  icon: string;
}

export type WorkspaceRole = 'hr' | 'manager';
