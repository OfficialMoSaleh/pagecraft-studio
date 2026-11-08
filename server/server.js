import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const PAGES_FILE = path.join(DATA_DIR, 'pages.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(PAGES_FILE)) {
  fs.writeFileSync(PAGES_FILE, JSON.stringify({}), 'utf-8');
}

const readPages = () => {
  try {
    return JSON.parse(fs.readFileSync(PAGES_FILE, 'utf-8') || '{}');
  } catch {
    return {};
  }
};

const writePages = (pages) => {
  fs.writeFileSync(PAGES_FILE, JSON.stringify(pages, null, 2), 'utf-8');
};

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'PageCraft Studio Live Publishing API',
    timestamp: new Date().toISOString(),
  });
});

// List all published/saved projects
app.get('/api/pages', (req, res) => {
  try {
    const pages = readPages();
    res.status(200).json({
      success: true,
      count: Object.keys(pages).length,
      data: Object.values(pages),
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Save or Publish a project with custom slug
app.post('/api/pages', (req, res) => {
  try {
    const { id, slug, name, pageData, theme, html, publishedAt } = req.body;
    const pageSlug = (slug || id || 'site_' + Math.random().toString(36).substring(2, 8))
      .trim()
      .toLowerCase();
    const pages = readPages();

    pages[pageSlug] = {
      id: id || pageSlug,
      slug: pageSlug,
      name: name || pageData?.brandName || 'مشروع منشور',
      pageData,
      theme: theme || 'editorial',
      html: html || '',
      publishedAt: publishedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    writePages(pages);
    res.status(200).json({
      success: true,
      slug: pageSlug,
      liveUrl: `/p/${pageSlug}`,
      data: pages[pageSlug],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Retrieve a published project by slug or id
app.get('/api/pages/:slug', (req, res) => {
  try {
    const target = req.params.slug;
    const pages = readPages();
    const page =
      pages[target] ||
      Object.values(pages).find((p) => p.id === target || p.slug === target);

    if (!page) {
      return res.status(404).json({ success: false, error: 'الصفحة غير موجودة' });
    }
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a published project
app.delete('/api/pages/:slug', (req, res) => {
  try {
    const target = req.params.slug;
    const pages = readPages();
    if (pages[target]) {
      delete pages[target];
      writePages(pages);
    }
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Serve standalone HTML directly at /p/:slug when hitting the Express server
app.get('/p/:slug', (req, res) => {
  const target = req.params.slug;
  const pages = readPages();
  const page =
    pages[target] ||
    Object.values(pages).find((p) => p.id === target || p.slug === target);

  if (!page || !page.html) {
    return res.status(404).send(`<!DOCTYPE html>
      <html lang="ar" dir="rtl">
      <head><meta charset="UTF-8"><title>الصفحة غير موجودة</title></head>
      <body style="font-family:sans-serif;text-align:center;padding:80px;">
        <h2>عذراً، هذا الموقع غير منشور حالياً</h2>
      </body>
      </html>`);
  }
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(page.html);
});

app.listen(PORT, () => {
  console.log(`PageCraft Studio API running at http://localhost:${PORT}`);
});
