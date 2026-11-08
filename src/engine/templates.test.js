import { describe, it, expect } from 'vitest';
import {
  generatePageData,
  DESIGN_THEMES,
  IMAGE_LIBRARY,
  DEFAULT_SECTION_ORDER,
  DEFAULT_LAYOUTS,
  SECTION_LAYOUT_OPTIONS,
} from './templates';
import {
  sanitizeSlug,
  suggestSlugFromBrand,
  buildNewProject,
  cloneProject,
  createInitialProjects,
} from './projects';

describe('Full-Scale Editorial Page Builder Engine', () => {
  it('extracts custom brand name and price directly from user prompt', () => {
    const data = generatePageData('براند عطور باسم "سكون" بأسعار تبدأ من 490 ج.م وخصم 25%');
    expect(data.brandName).toBe('سكون');
    expect(data.price).toBe('490 ج.م');
    expect(data.announcement).toContain('25%');
    expect(data.products.length).toBeGreaterThanOrEqual(3);
    expect(data.pricingTiers.length).toBe(3);
  });

  it('detects specialty coffee niche and populates catalog and stats', () => {
    const data = generatePageData('محمصة قهوة مختصة تقدم محاصيل إثيوبية');
    expect(data.theme).toBe('forest');
    expect(data.products.length).toBe(3);
    expect(data.stats.length).toBe(4);
  });

  it('detects fashion and clothing niche accurately', () => {
    const data = generatePageData('براند ملابس وأزياء كتان طبيعي');
    expect(data.brandName).toContain('نَسِيج');
    expect(data.products.length).toBe(3);
  });

  it('handles custom general prompts with full sections', () => {
    const customPrompt = 'ورشة صناعة الفخار والخزف اليدوي';
    const data = generatePageData(customPrompt, 'editorial');
    expect(data.headline).toBe(customPrompt);
    expect(data.products.length).toBe(3);
    expect(data.faqs.length).toBeGreaterThan(0);
  });

  it('populates default sectionOrder and multi-layout configuration', () => {
    const data = generatePageData('متجر ساعات كلاسيكية');
    expect(data.sectionOrder).toEqual(DEFAULT_SECTION_ORDER);
    expect(data.layouts).toBeDefined();
    expect(data.layouts.hero).toBeDefined();
    expect(data.layouts.catalog).toBeDefined();
    expect(SECTION_LAYOUT_OPTIONS.hero.length).toBe(3);
    expect(SECTION_LAYOUT_OPTIONS.catalog.length).toBe(3);
    expect(DEFAULT_LAYOUTS.hero).toBe('editorial');
  });

  it('manages multi-project creation, cloning, and custom URL slugs', () => {
    expect(sanitizeSlug('Athar Perfumes Store!')).toBe('athar-perfumes-store');
    expect(suggestSlugFromBrand('أثر للعطور')).toBe('athar-perfumes');

    const initial = createInitialProjects();
    expect(initial.length).toBe(3);

    const newProj = buildNewProject({
      name: 'دار الساعات',
      prompt: 'متجر ساعات كلاسيكية بأسعار تبدأ من 1200 ج.م',
      theme: 'charcoal',
      existingSlugs: ['athar-perfumes'],
    });
    expect(newProj.name).toBe('دار الساعات');
    expect(newProj.slug).toBeTruthy();

    const cloned = cloneProject(newProj, [newProj.slug]);
    expect(cloned.id).not.toBe(newProj.id);
    expect(cloned.name).toContain('نسخة');
  });

  it('contains all calm design themes and curated image library', () => {
    expect(DESIGN_THEMES.editorial).toBeDefined();
    expect(DESIGN_THEMES.minimal).toBeDefined();
    expect(DESIGN_THEMES.forest).toBeDefined();
    expect(DESIGN_THEMES.charcoal).toBeDefined();
    expect(IMAGE_LIBRARY.length).toBeGreaterThan(8);
  });
});
