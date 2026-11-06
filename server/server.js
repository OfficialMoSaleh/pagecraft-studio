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
  res.json({ status: 'ok', service: 'PageCraft Studio API', timestamp: new Date().toISOString() });
});

app.post('/api/pages', (req, res) => {
  try {
    const { id, pageData, theme } = req.body;
    const pageId = id || 'page_' + Math.random().toString(36).substring(2, 10);
    const pages = readPages();

    pages[pageId] = {
      id: pageId,
      pageData,
      theme: theme || 'editorial',
      updatedAt: new Date().toISOString(),
    };

    writePages(pages);
    res.status(200).json({ success: true, pageId, data: pages[pageId] });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/pages/:id', (req, res) => {
  try {
    const pages = readPages();
    const page = pages[req.params.id];
    if (!page) {
      return res.status(404).json({ success: false, error: 'الصفحة غير موجودة' });
    }
    res.status(200).json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`PageCraft Studio API running at http://localhost:${PORT}`);
});
