
import { Step, StepKey, TechStack } from './types';
import { BulbIcon, ChartBarIcon, CodeBracketIcon, BriefcaseIcon, ClipboardIcon, CircleStackIcon, UserGroupIcon, DocumentCheckIcon, EyeIcon } from './components/icons/Icons';

export const STEPS: Step[] = [
  {
    key: StepKey.IDEA_INPUT,
    title: "Your Idea",
    description: "Start with your concept",
    icon: BulbIcon,
  },
  {
    key: StepKey.MARKET_ANALYSIS,
    title: "Market Analysis",
    description: "Identifying your audience",
    icon: ChartBarIcon,
  },
  {
    key: StepKey.TECH_STACK,
    title: "Tech Stack",
    description: "Select your preferred tools",
    icon: CodeBracketIcon,
  },
  {
    key: StepKey.BUSINESS_ANALYSIS,
    title: "Business Model",
    description: "Planning your revenue",
    icon: BriefcaseIcon,
  },
  {
    key: StepKey.PROJECT_SCOPE,
    title: "Project Scope",
    description: "Defining MVP features",
    icon: ClipboardIcon,
  },
  {
    key: StepKey.EXPENDITURE_ESTIMATION,
    title: "Cost Estimation",
    description: "Budgeting for success",
    icon: CircleStackIcon,
  },
  {
    key: StepKey.COMPETITOR_ANALYSIS,
    title: "Competitors",
    description: "Understanding the landscape",
    icon: UserGroupIcon,
  },
  {
    key: StepKey.FINAL_PLAN,
    title: "MVP Plan",
    description: "Review your full plan",
    icon: DocumentCheckIcon,
  },
  {
    key: StepKey.WEBSITE_PREVIEW,
    title: "Website Preview",
    description: "See a live preview",
    icon: EyeIcon,
  }
];

export const TECH_CHOICES: { [key in keyof TechStack]: string[] } = {
  frontend: ["React", "Vue", "Svelte", "Angular"],
  backend: ["Node.js (Express)", "Python (Django)", "Go", "Ruby on Rails"],
  database: ["PostgreSQL (Supabase)", "MySQL", "MongoDB", "Firestore"],
};