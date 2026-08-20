import React from 'react';

export interface ProfileData {
  id?: string;
  name?: string | null;
  email?: string | null;
  headline?: string | null;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  resumeUrl?: string | null;
}

export interface ProjectData {
  id?: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  liveUrl?: string | null;
  sourceUrl?: string | null;
  tags?: string | null;
  order?: number;
}

export interface ExperienceData {
  id?: string;
  company: string;
  role: string;
  description?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
  order?: number;
}

export interface EducationData {
  id?: string;
  institution: string;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  current?: boolean;
  gpa?: string | null;
  order?: number;
}

export interface SkillData {
  id?: string;
  name: string;
  category?: string | null;
  order?: number;
}

export interface SocialLinkData {
  id?: string;
  platform: string;
  url: string;
  order?: number;
}

export interface CustomSectionData {
  id?: string;
  title: string;
  content: string;
  order?: number;
}

export interface ThemeConfig {
  accentColor?: string;
  primaryColor?: string;
  backgroundColor?: string;
  fontFamily?: string;
  isDark?: boolean;
}

export interface TemplateProps {
  username?: string;
  profile: ProfileData;
  projects: ProjectData[];
  experiences: ExperienceData[];
  educations: EducationData[];
  skills: SkillData[];
  socialLinks: SocialLinkData[];
  customSections?: CustomSectionData[];
  theme?: ThemeConfig;
  previewMode?: boolean;
}

export type TemplateCategory = 'craftsman' | 'narrative' | 'minimal' | 'editorial' | 'developer' | 'bento' | 'creative' | 'professional' | 'academic' | 'terminal' | 'spotlight' | 'elegant' | 'magic' | 'magic3d';

export interface TemplateMetadata {
  id: TemplateCategory;
  name: string;
  description: string;
  category: 'Craftsman' | 'Narrative' | 'Clean' | 'Editorial' | 'Engineering' | 'Modular' | 'Vibrant' | 'Corporate' | 'Research' | 'Monochrome' | 'Showcase' | 'Luxury' | 'Interactive' | 'Cinematic';
  author: string;
  tags: string[];
  thumbnailGradient: string;
  iconName: string;
  version: string;
}

export interface TemplateDefinition extends TemplateMetadata {
  component: React.ComponentType<TemplateProps>;
}
