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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  
  // Assets
  app.get('/api/assets', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('assets').select('*');
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
      res.json({ id: data?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/assets/:id', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('assets')
        .update(req.body)
        .eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.delete('/api/assets/:id', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Software
  app.get('/api/software', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('software').select('*');
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/software', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('software')
        .insert([req.body])
        .select();
      if (error) throw error;
      res.json({ id: data?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Tickets
  app.get('/api/tickets', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      res.json(data || []);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post('/api/tickets', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase
        .from('tickets')
        .insert([req.body])
        .select();
      if (error) throw error;
      res.json({ id: data?.[0]?.id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  app.patch('/api/tickets/:id', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { error } = await supabase
        .from('tickets')
        .update({ ...req.body, updated_at: new Date().toISOString() })
        .eq('id', req.params.id);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Category Configs
  app.get('/api/category-configs', async (req, res) => {
    try {
      const supabase = getSupabase();
      const { data, error } = await supabase.from('category_configs').select('*');
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
        .upsert(req.body);
      if (error) throw error;
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

  // Stats for Dashboard
  app.get('/api/stats', async (req, res) => {
    try {
      const supabase = getSupabase();
      
      const { count: assetCount } = await supabase.from('assets').select('*', { count: 'exact', head: true });
      const { count: ticketCount } = await supabase.from('tickets').select('*', { count: 'exact', head: true }).neq('status', 'Closed');
      const { count: softwareCount } = await supabase.from('software').select('*', { count: 'exact', head: true });
      
      const { data: assetsByTypeData } = await supabase.rpc('get_assets_by_type');
      const { data: ticketsByStatusData } = await supabase.rpc('get_tickets_by_status');

      res.json({
        totals: { assets: assetCount || 0, openTickets: ticketCount || 0, software: softwareCount || 0 },
        assetsByType: assetsByTypeData || [],
        ticketsByStatus: ticketsByStatusData || []
      });
    } catch (error) {
      console.error('Error in /api/stats:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
