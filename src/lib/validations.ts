import { z } from 'zod';
import { APP_CONFIG } from './config';

export const usernameSchema = z
  .string()
  .min(APP_CONFIG.username.minLength, `Username must be at least ${APP_CONFIG.username.minLength} characters`)
  .max(APP_CONFIG.username.maxLength, `Username must not exceed ${APP_CONFIG.username.maxLength} characters`)
  .regex(APP_CONFIG.username.regex, 'Username can only contain lowercase letters, numbers, and hyphens (no trailing/leading hyphens)')
  .refine(
    (val) => !APP_CONFIG.reservedUsernames.includes(val.toLowerCase()),
    'This username is reserved by the platform'
  );

export const profileSchema = z.object({
  headline: z.string().max(200).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  location: z.string().max(100).optional().nullable(),
  avatarUrl: z.string().optional().nullable(),
  resumeUrl: z.string().url().or(z.literal('')).optional().nullable(),
});

export const projectSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(1000).optional().nullable(),
  imageUrl: z.string().url().or(z.literal('')).optional().nullable(),
  liveUrl: z.string().url().or(z.literal('')).optional().nullable(),
  sourceUrl: z.string().url().or(z.literal('')).optional().nullable(),
  tags: z.string().max(300).optional().nullable(),
  order: z.number().int().default(0),
});

export const experienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, 'Company is required').max(120),
  role: z.string().min(1, 'Role is required').max(120),
  description: z.string().max(1500).optional().nullable(),
  startDate: z.string().max(50).optional().nullable(),
  endDate: z.string().max(50).optional().nullable(),
  current: z.boolean().default(false),
  order: z.number().int().default(0),
});

export const educationSchema = z.object({
  id: z.string().optional(),
  institution: z.string().min(1, 'Institution is required').max(150),
  degree: z.string().max(100).optional().nullable(),
  field: z.string().max(100).optional().nullable(),
  startDate: z.string().max(50).optional().nullable(),
  endDate: z.string().max(50).optional().nullable(),
  current: z.boolean().default(false),
  gpa: z.string().max(20).optional().nullable(),
  order: z.number().int().default(0),
});

export const skillSchema = z.object({
  name: z.string().min(1).max(60),
  category: z.string().max(60).optional().nullable(),
});

export const socialLinkSchema = z.object({
  platform: z.string().min(1).max(50),
  url: z.string().url('Must be a valid URL'),
});

export const aiImportSchema = z.object({
  name: z.string().optional(),
  headline: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  avatarUrl: z.string().optional(),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string().optional(),
    tags: z.string().optional(),
    liveUrl: z.string().optional(),
    sourceUrl: z.string().optional(),
  })).optional(),
  experiences: z.array(z.object({
    company: z.string(),
    role: z.string(),
    description: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    current: z.boolean().optional(),
  })).optional(),
  educations: z.array(z.object({
    institution: z.string(),
    degree: z.string().optional(),
    field: z.string().optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    gpa: z.string().optional(),
  })).optional(),
  skills: z.array(z.string().or(z.object({
    name: z.string(),
    category: z.string().optional(),
  }))).optional(),
  socialLinks: z.array(z.object({
    platform: z.string(),
    url: z.string(),
  })).optional(),
});
