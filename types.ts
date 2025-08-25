
import type React from 'react';

export enum StepKey {
  IDEA_INPUT = 'idea',
  MARKET_ANALYSIS = 'marketAnalysis',
  TECH_STACK = 'techStack',
  BUSINESS_ANALYSIS = 'businessAnalysis',
  PROJECT_SCOPE = 'projectScope',
  EXPENDITURE_ESTIMATION = 'expenditureEstimation',
  COMPETITOR_ANALYSIS = 'competitorAnalysis',
  FINAL_PLAN = 'finalPlan',
  WEBSITE_PREVIEW = 'websitePreview'
}

export interface Step {
  key: StepKey;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

export interface TechStack {
  frontend: string;
  backend: string;
  database: string;
}

export interface Citation {
    uri: string;
    title: string;
}

export interface ProjectFile {
    path: string;
    content: string;
}

export interface Subscription {
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'canceled';
  usageCount: number;
}

export interface HistoryItem {
  id: string;
  idea: string;
  plan: MvpPlan;
  citations: Record<string, Citation[]>;
  createdAt: string;
  isFavorite?: boolean;
}

export interface SessionLog {
    id: string;
    userId: string;
    userEmail: string | null;
    userRole: User['role'];
    action: 'login' | 'logout';
    timestamp: string;
}

export interface SalesLead {
  id: string;
  userId: string;
  userName: string;
  companyName: string;
  teamSize: string;
  message: string;
  createdAt: string;
}

export interface User {
  uid: string;
  email: string | null;
  firstName: string;
  lastName: string;
  displayName: string | null;
  role: 'user' | 'admin' | 'superadmin';
  status: 'active' | 'pending_admin_approval';
  isVerified: boolean;
  isNewAdmin?: boolean;
  subscription: Subscription;
  history: HistoryItem[];
}

export interface MvpPlan {
  [StepKey.IDEA_INPUT]: string;
  [StepKey.MARKET_ANALYSIS]: string;
  [StepKey.TECH_STACK]: TechStack;
  [StepKey.BUSINESS_ANALYSIS]: string;
  [StepKey.PROJECT_SCOPE]: string;
  [StepKey.EXPENDITURE_ESTIMATION]: string;
  [StepKey.COMPETITOR_ANALYSIS]: string;
}