import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';
import fs from 'fs';
import https from 'https';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      {
        name: 'sync-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url === '/api/sync' && req.method === 'POST') {
              res.setHeader('Content-Type', 'application/json');
              try {
                // Drain request body
                await new Promise((resolve) => {
                  req.on('data', () => {});
                  req.on('end', resolve);
                });

                const sheetUrl = env.VITE_SHEET_API_URL;
                if (!sheetUrl) throw new Error('VITE_SHEET_API_URL is missing in .env');

                console.log('--- Sync Start ---');
                const response = await fetch(sheetUrl, {
                  method: "POST",
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ action: "get_catalog" })
                });

                const text = await response.text();
                if (!text) throw new Error('Google Sheet returned an empty response');

                const newData = JSON.parse(text);
                if (!newData.success) throw new Error(newData.message || 'Sheet reported failure');

                const dataDir = path.resolve(__dirname, 'public/data');
                const imageDir = path.resolve(__dirname, 'public/images/products');
                if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
                if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

                // Download Footer Logo as well to be safe
                const footerLogoPath = path.join(__dirname, 'public/images/ssl-logo.png');
                if (!fs.existsSync(path.dirname(footerLogoPath))) fs.mkdirSync(path.dirname(footerLogoPath), { recursive: true });
                
                await new Promise((resolve) => {
                  https.get('https://securepay.sslcommerz.com/public/image/SSLCommerz-Logo.png', (imgRes) => {
                    if (imgRes.statusCode === 200) {
                      const file = fs.createWriteStream(footerLogoPath);
                      imgRes.pipe(file);
                      file.on('finish', () => { file.close(); resolve(true); });
                    } else { resolve(false); }
                  }).on('error', () => resolve(false));
                });

                const catalogPath = path.join(dataDir, 'catalog.json');
                let oldData: any = { catalog: [] };
                if (fs.existsSync(catalogPath)) {
                  try {
                    oldData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
                  } catch (e) {}
                }

                const newCatalog = newData.catalog || [];
                const oldCatalog = oldData.catalog || [];
                
                const stats = {
                  added: [] as string[],
                  updated: [] as string[],
                  deleted: [] as string[],
                };

                const updatedCatalog = [];
                const newIds = new Set(newCatalog.map((item: any) => String(item.id)));

                // Detect Deleted
                for (const oldItem of oldCatalog) {
                  if (!newIds.has(String(oldItem.id))) {
                    stats.deleted.push(oldItem.title || oldItem.id);
                  }
                }

                console.log(`Processing ${newCatalog.length} products...`);
                for (const item of newCatalog) {
                  const id = String(item.id);
                  const oldItem = oldCatalog.find((o: any) => String(o.id) === id);

                  if (!oldItem) {
                    stats.added.push(item.title || id);
                  } else if (JSON.stringify(oldItem) !== JSON.stringify(item)) {
                    stats.updated.push(item.title || id);
                  }

                  const imageUrl = item.Image_Link;
                  if (imageUrl && imageUrl.startsWith('http')) {
                    try {
                      const urlObj = new URL(imageUrl);
                      const ext = path.extname(urlObj.pathname) || '.jpg';
                      const imageName = `${item.id}${ext}`;
                      const imagePath = path.join(imageDir, imageName);
                      
                      await new Promise((resolve) => {
                        https.get(imageUrl, (imgRes) => {
                          if (imgRes.statusCode === 200) {
                            const file = fs.createWriteStream(imagePath);
                            imgRes.pipe(file);
                            file.on('finish', () => { file.close(); resolve(true); });
                          } else { resolve(false); }
                        }).on('error', () => resolve(false));
                      });
                      item.Image_Link = `/images/products/${imageName}`;
                    } catch (e) {}
                  }
                  updatedCatalog.push(item);
                }

                fs.writeFileSync(catalogPath, JSON.stringify({...newData, catalog: updatedCatalog}, null, 2));
                console.log('--- Sync Success ---');
                res.end(JSON.stringify({ 
                  success: true, 
                  count: updatedCatalog.length,
                  summary: stats 
                }));
              } catch (error: any) {
                console.error('--- Sync Error ---', error.message);
                res.statusCode = 500;
                res.end(JSON.stringify({ success: false, error: error.message }));
              }
              return;
            }
            next();
          });
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: {
        ignored: ['**/public/data/catalog.json'] // Prevent full reload when catalog syncs
      }
    }
  };
});
