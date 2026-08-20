import { TemplateDefinition, TemplateCategory } from './types';

// Template component imports
import CraftsmanTemplate from './craftsman/CraftsmanTemplate';
import NarrativeTemplate from './narrative/NarrativeTemplate';
import MinimalTemplate from './minimal/MinimalTemplate';
import EditorialTemplate from './editorial/EditorialTemplate';
import DeveloperTemplate from './developer/DeveloperTemplate';
import BentoTemplate from './bento/BentoTemplate';
import CreativeTemplate from './creative/CreativeTemplate';
import ProfessionalTemplate from './professional/ProfessionalTemplate';
import AcademicTemplate from './academic/AcademicTemplate';
import TerminalTemplate from './terminal/TerminalTemplate';
import SpotlightTemplate from './spotlight/SpotlightTemplate';
import ElegantTemplate from './elegant/ElegantTemplate';
import MagicTemplate from './magic/MagicTemplate';
import Magic3DTemplate from './magic3d/Magic3DTemplate';

export const TEMPLATE_REGISTRY: Record<TemplateCategory, TemplateDefinition> = {
  magic: {
    id: 'magic',
    name: 'Magic',
    description: 'MagicUI-inspired portfolio featuring fluid particle background, progressive blur-fade cascade, text scramble, and macOS floating dock.',
    category: 'Interactive',
    author: 'Folio Team',
    tags: ['MagicUI', 'Fluid Particles', 'Floating Dock', 'BlurFade', 'Hacker Scramble'],
    thumbnailGradient: 'linear-gradient(135deg, #000000 0%, #1e1b4b 50%, #3b82f6 100%)',
    iconName: 'Sparkles',
    version: '1.0.0',
    component: MagicTemplate,
  },
  magic3d: {
    id: 'magic3d',
    name: 'Magic 3D',
    description: 'Interactive 3D celestial starfield and spiral warp canvas projection with floating magnetic dock and bento cards.',
    category: 'Cinematic',
    author: 'Folio Team',
    tags: ['3D Spiral', 'Starfield', 'Celestial', 'Magnetic Dock', 'Warp Speed'],
    thumbnailGradient: 'linear-gradient(135deg, #030712 0%, #4338ca 50%, #ec4899 100%)',
    iconName: 'Sparkles',
    version: '1.0.0',
    component: Magic3DTemplate,
  },
  craftsman: {
    id: 'craftsman',
    name: 'Craftsman',
    description: 'Warm parchment paper aesthetic, tracked smallcaps, serif headlines, capability cards, and direct WhatsApp / contact actions.',
    category: 'Craftsman',
    author: 'Folio Team',
    tags: ['Parchment', 'Serif Italic', 'WhatsApp Action', 'Craft'],
    thumbnailGradient: 'linear-gradient(135deg, #f3ede2 0%, #1a4338 100%)',
    iconName: 'Feather',
    version: '1.0.0',
    component: CraftsmanTemplate,
  },
  narrative: {
    id: 'narrative',
    name: 'Narrative',
    description: 'Systems thinker and case-study driven portfolio with circular profile halo, engineering philosophy, and architecture deep dives.',
    category: 'Narrative',
    author: 'Folio Team',
    tags: ['Case Studies', 'Systems Thinker', 'Deep Dives', 'Modern Slate'],
    thumbnailGradient: 'linear-gradient(135deg, #0b0f19 0%, #38bdf8 100%)',
    iconName: 'BookOpen',
    version: '1.0.0',
    component: NarrativeTemplate,
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    description: 'Clean typography, generous whitespace, understated Scandinavian design.',
    category: 'Clean',
    author: 'Folio Team',
    tags: ['Whitespace', 'Single-Column', 'Typography', 'Monochrome'],
    thumbnailGradient: 'linear-gradient(135deg, #f5f5f5 0%, #e5e5e5 100%)',
    iconName: 'Layout',
    version: '1.0.0',
    component: MinimalTemplate,
  },
  editorial: {
    id: 'editorial',
    name: 'Editorial',
    description: 'Magazine-inspired typography, large headings, asymmetric layouts, drop caps.',
    category: 'Editorial',
    author: 'Folio Team',
    tags: ['Magazine', 'Serif', 'Asymmetric', 'Artistic'],
    thumbnailGradient: 'linear-gradient(135deg, #fcfbf9 0%, #dedbd2 100%)',
    iconName: 'BookOpen',
    version: '1.0.0',
    component: EditorialTemplate,
  },
  developer: {
    id: 'developer',
    name: 'Developer',
    description: 'Technical, modern, code-inspired aesthetic suitable for engineers and hackers.',
    category: 'Engineering',
    author: 'Folio Team',
    tags: ['Dark Mode', 'Code Highlights', 'Monospace', 'Tech'],
    thumbnailGradient: 'linear-gradient(135deg, #0d1117 0%, #161b22 100%)',
    iconName: 'Code',
    version: '1.0.0',
    component: DeveloperTemplate,
  },
  bento: {
    id: 'bento',
    name: 'Bento',
    description: 'Modern card-based layout with modular information blocks and glassmorphism.',
    category: 'Modular',
    author: 'Folio Team',
    tags: ['Cards', 'Grid', 'Glassmorphism', 'Modern'],
    thumbnailGradient: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
    iconName: 'Grid',
    version: '1.0.0',
    component: BentoTemplate,
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    description: 'Bold typography, expressive layouts, high-contrast visual personality.',
    category: 'Vibrant',
    author: 'Folio Team',
    tags: ['Neo-Brutalism', 'High Energy', 'Bold', 'Color'],
    thumbnailGradient: 'linear-gradient(135deg, #ff3366 0%, #ffe600 100%)',
    iconName: 'Zap',
    version: '1.0.0',
    component: CreativeTemplate,
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Corporate/executive portfolio suitable for internships and top-tier job applications.',
    category: 'Corporate',
    author: 'Folio Team',
    tags: ['Resume', 'Clean', 'Corporate', 'Structured'],
    thumbnailGradient: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
    iconName: 'Briefcase',
    version: '1.0.0',
    component: ProfessionalTemplate,
  },
  academic: {
    id: 'academic',
    name: 'Academic',
    description: 'Research/student-oriented layout emphasizing education, publications, and GPA.',
    category: 'Research',
    author: 'Folio Team',
    tags: ['Scholarly', 'Research', 'Publications', 'Academic'],
    thumbnailGradient: 'linear-gradient(135deg, #002b49 0%, #fdfbf7 100%)',
    iconName: 'GraduationCap',
    version: '1.0.0',
    component: AcademicTemplate,
  },
  terminal: {
    id: 'terminal',
    name: 'Terminal',
    description: 'Developer-focused interactive hacker terminal with CRT glow and matrix green aesthetic.',
    category: 'Monochrome',
    author: 'Folio Team',
    tags: ['Terminal', 'ASCII Art', 'CLI', 'CRT Glow'],
    thumbnailGradient: 'linear-gradient(135deg, #00ff66 0%, #050805 100%)',
    iconName: 'Terminal',
    version: '1.0.0',
    component: TerminalTemplate,
  },
  spotlight: {
    id: 'spotlight',
    name: 'Spotlight',
    description: 'Cinematic visual hero section with glowing spotlight gradients and large cards.',
    category: 'Showcase',
    author: 'Folio Team',
    tags: ['Cinematic', 'Spotlight Glow', 'Dark Mode', 'Visual'],
    thumbnailGradient: 'linear-gradient(135deg, #7877c6 0%, #030712 100%)',
    iconName: 'Sparkles',
    version: '1.0.0',
    component: SpotlightTemplate,
  },
  elegant: {
    id: 'elegant',
    name: 'Elegant',
    description: 'Premium, restrained typography and luxury golden dividers.',
    category: 'Luxury',
    author: 'Folio Team',
    tags: ['Luxury', 'Gold Accents', 'Minimal', 'Editorial'],
    thumbnailGradient: 'linear-gradient(135deg, #d4af37 0%, #121212 100%)',
    iconName: 'Feather',
    version: '1.0.0',
    component: ElegantTemplate,
  },
};

export const TEMPLATE_LIST = Object.values(TEMPLATE_REGISTRY);

export function getTemplateById(id?: string | null): TemplateDefinition {
  if (id && id in TEMPLATE_REGISTRY) {
    return TEMPLATE_REGISTRY[id as TemplateCategory];
  }
  return TEMPLATE_REGISTRY.craftsman;
}
