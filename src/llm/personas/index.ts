import type { BrandId } from '../../config/brands';
import { PERSONA_ALPHA, CONTENT_ROLE_ALPHA } from './alpha';
import { PERSONA_RAYMOND, CONTENT_ROLE_RAYMOND } from './raymond';
import { PERSONA_VIP10X, CONTENT_ROLE_VIP10X } from './vip10x';

export type PersonaMode = 'content' | 'base';

const BASE: Record<BrandId, string> = {
  alpha: PERSONA_ALPHA,
  raymond: PERSONA_RAYMOND,
  vip10x: PERSONA_VIP10X,
};

const CONTENT_ROLE: Record<BrandId, string> = {
  alpha: CONTENT_ROLE_ALPHA,
  raymond: CONTENT_ROLE_RAYMOND,
  vip10x: CONTENT_ROLE_VIP10X,
};

export function withBrandPersona(brandId: BrandId, mode: PersonaMode = 'content'): string {
  const base = BASE[brandId];
  if (mode === 'base') return base;
  return `${base}\n\n---\n\n# Nhiệm vụ content pack\n${CONTENT_ROLE[brandId]}`;
}
