import express from 'express';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let supabaseClient: SupabaseClient | null = null;

function getSupabase() {
  if (!supabaseClient) {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_ANON_KEY;
    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

const app = express();
const PORT = 3000;

async function startServer() {
  app.use(express.json());

  // API simplificada apenas para o Dashboard
  app.get('/api/stats', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { count: assetCount } = await supabase.from('assets').select('*', { count: 'exact', head: true });
      res.json({
        totals: { assets: assetCount || 0, openTickets: 0, software: 0 },
        assetsByType: [],
        ticketsByStatus: []
      });
    } catch (error) {
      res.json({ totals: { assets: 0, openTickets: 0, software: 0 }, assetsByType: [], ticketsByStatus: [] });
    }
  });

  // Rotas de Configuração de Categorias
  app.get('/api/category-configs', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('category_configs').select('*').order('category');
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/category-configs', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('category_configs')
        .upsert(req.body, { onConflict: 'category' });
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/category-configs/:category', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('category_configs')
        .delete()
        .eq('category', req.params.category);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Rotas de Ativos
  app.get('/api/assets', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('assets').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/assets', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('assets')
        .insert([req.body])
        .select();
      if (error) throw error;
      res.json(data?.[0]);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/assets/:id', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase.from('assets').delete().eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, '..', 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export { app };
export default app;
