import { describe, it, expect } from 'vitest';
import { buildStandaloneHTML, esc, safeUrl, safeColor, jsString } from './exportHtml';
import { generatePageData } from './templates';

const XSS = '<img src=x onerror=alert(1)>';

describe('exportHtml helpers', () => {
  it('escapes HTML special characters', () => {
    expect(esc('<b>"x" & \'y\'</b>')).toBe('&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
    expect(esc(null)).toBe('');
  });

  it('only allows http(s) and image data URLs', () => {
    expect(safeUrl('javascript:alert(1)')).toBe('');
    expect(safeUrl('https://a.com/x.jpg?a=1&b=2')).toBe('https://a.com/x.jpg?a=1&amp;b=2');
    expect(safeUrl('data:image/png;base64,AAAA')).toBe('data:image/png;base64,AAAA');
    expect(safeUrl('data:text/html;base64,AAAA')).toBe('');
  });

  it('rejects non-hex colors', () => {
    expect(safeColor('red;}</style><script>', '#000')).toBe('#000');
    expect(safeColor('#FFAA00', '#000')).toBe('#FFAA00');
  });

  it('produces script-safe JS strings', () => {
    expect(jsString('</script><script>alert(1)')).not.toContain('</script>');
  });
});

describe('buildStandaloneHTML', () => {
  it('does not inject user-controlled markup', () => {
    const data = generatePageData('متجر عطور', 'editorial');
    data.brandName = `</script>${XSS}`;
    data.headline = XSS;
    data.heroImage = 'javascript:alert(1)';
    data.whatsappPhone = '966"><script>';
    data.products = [{ name: XSS, desc: XSS, price: XSS, image: '" onerror="alert(1)' }];
    data.faqs = [{ q: XSS, a: XSS }];
    data.customColors = { enabled: true, background: '</style><script>alert(1)</script>', text: '#111' };
    data.typography = { heroSize: '40px;}</style><script>' };

    const html = buildStandaloneHTML(data, 'editorial');
    expect(html).not.toContain(XSS);
    expect(html).not.toContain('javascript:');
    expect(html).not.toContain('onerror="alert');
    expect(html.match(/<script/g)).toHaveLength(2); // tailwind CDN + our own handler only
    expect(html).toContain('wa.me/966');
    expect(html).not.toContain('</style><script>');
  });

  it('falls back to the default theme for unknown keys', () => {
    const data = generatePageData('مقهى', 'editorial');
    expect(() => buildStandaloneHTML(data, '__proto__')).not.toThrow();
  });
});
