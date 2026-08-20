import { TEMPLATE_LIST, TEMPLATE_REGISTRY, getTemplateById } from './registry';
import { TemplateCategory, TemplateDefinition } from './types';

/**
 * Returns a randomly chosen template from the 10 available templates.
 * Used when a user first signs up / creates their website.
 */
export function getRandomTemplate(): TemplateDefinition {
  const keys = Object.keys(TEMPLATE_REGISTRY) as TemplateCategory[];
  const randomIndex = Math.floor(Math.random() * keys.length);
  const selectedKey = keys[randomIndex];
  return TEMPLATE_REGISTRY[selectedKey];
}

/**
 * Gets all template metadata (without the React components) for client selectors
 */
export function getAllTemplateMetadata() {
  return TEMPLATE_LIST.map(({ component: _c, ...meta }) => meta);
}

export { TEMPLATE_LIST, TEMPLATE_REGISTRY, getTemplateById };
