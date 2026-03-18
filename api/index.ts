import express from 'express';
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
    
    console.log('--- Supabase Diagnostic ---');
    console.log('SUPABASE_URL exists:', !!url);
    if (url) console.log('SUPABASE_URL starts with:', url.substring(0, 10));
    console.log('SUPABASE_ANON_KEY exists:', !!key);
    console.log('---------------------------');

    if (!url || !key) {
      throw new Error('SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required');
    }
    supabaseClient = createClient(url, key);
  }
  return supabaseClient;
}

const app = express();
const PORT = 3000;

// Middleware básico configurado IMEDIATAMENTE
app.use(express.json());

// API Routes configuradas IMEDIATAMENTE (sem async)
app.post('/api/login', async (req, res) => {
  const { email, password, portalType } = req.body;
  console.log(`Login attempt: ${email} on ${portalType}`);
  
  try {
    const supabase = getSupabase();
    const table = portalType === 'Gestão' ? 'gestao_users' : 'portal_users';
    
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('email', email)
      .eq('password', password)
      .single();

    if (error || !data) {
      return res.status(401).json({ error: 'Credenciais inválidas para este portal.' });
    }

    res.json({ 
      success: true, 
      user: { id: data.id, name: data.name, email: data.email, portalType } 
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

app.get('/api/stats', async (req, res) => {
  console.log('GET /api/stats');
  try {
    const { user_id } = req.query;
    const supabase = getSupabase();
    
    let assetQuery = supabase.from('assets').select('*', { count: 'exact', head: true });
    let ticketQuery = supabase.from('tickets').select('*', { count: 'exact', head: true }).eq('status', 'Aberto');
    
    if (user_id) {
      const userIdNum = Number(user_id);
      if (!isNaN(userIdNum)) {
        ticketQuery = ticketQuery.eq('user_id', userIdNum);
      } else {
        ticketQuery = ticketQuery.eq('user_id', user_id);
      }
    }

    const { count: assetCount, error: assetError } = await assetQuery;
    const { count: ticketCount, error: ticketError } = await ticketQuery;
    
    // Inventory stats
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('inventory')
      .select('name, quantity, min_quantity');
    
    if (assetError) console.error('Asset count error:', JSON.stringify(assetError, null, 2));
    if (ticketError) console.error('Ticket count error:', JSON.stringify(ticketError, null, 2));
    if (inventoryError) console.error('Inventory stats error:', JSON.stringify(inventoryError, null, 2));

    const totalInventory = inventoryData?.reduce((acc, item) => acc + (item.quantity || 0), 0) || 0;

    res.json({
      totals: { assets: assetCount || 0, openTickets: ticketCount || 0, software: 0, inventory: totalInventory },
      assetsByType: [],
      ticketsByStatus: [],
      inventoryLevels: inventoryData || []
    });
  } catch (error) {
    console.error('Stats error:', JSON.stringify(error, null, 2));
    res.json({ totals: { assets: 0, openTickets: 0, software: 0 }, assetsByType: [], ticketsByStatus: [] });
  }
});

app.get('/api/tickets', async (req, res) => {
  console.log('GET /api/tickets', req.query);
  try {
    const { user_id } = req.query;
    const supabase = getSupabase();
    
    // Removendo o join com assets que está causando erro de relacionamento
    let query = supabase
      .from('tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (user_id && user_id !== 'undefined') {
      const userIdNum = Number(user_id);
      if (!isNaN(userIdNum)) {
        query = query.eq('user_id', userIdNum);
      } else {
        query = query.eq('user_id', user_id);
      }
    }

    const { data, error } = await query;
    if (error) {
      console.error('Supabase tickets error:', JSON.stringify(error, null, 2));
      throw error;
    }
    
    console.log(`Found ${data?.length || 0} tickets`);
    res.json(data || []);
  } catch (error) {
    console.error('Route /api/tickets error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets', async (req, res) => {
  console.log('POST /api/tickets body:', req.body);
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tickets')
      .insert([req.body])
      .select();
    if (error) {
      console.error('Insert ticket error:', error);
      throw error;
    }
    res.json(data?.[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/tickets/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('tickets')
      .update(req.body)
      .eq('id', req.params.id)
      .select();
    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase.from('tickets').delete().eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/:id/messages', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('ticket_messages')
      .select('*')
      .eq('ticket_id', req.params.id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets/:id/messages', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('ticket_messages')
      .insert([{ ...req.body, ticket_id: req.params.id }])
      .select();
    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/category-configs', async (req, res) => {
  console.log('GET /api/category-configs');
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase.from('category_configs').select('*').order('category');
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/category-configs', async (req, res) => {
  console.log('POST /api/category-configs', req.body);
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('category_configs')
      .upsert(req.body, { onConflict: 'category' });
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Post category error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/category-configs/:category', async (req, res) => {
  console.log('DELETE /api/category-configs', req.params.category);
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('category_configs')
      .delete()
      .eq('category', req.params.category);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message });
  }
});

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

app.get('/api/inventory', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inventory')
      .insert([req.body])
      .select();
    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/inventory/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('inventory')
      .update(req.body)
      .eq('id', req.params.id)
      .select();
    if (error) throw error;
    res.json(data?.[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const supabase = getSupabase();
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', req.params.id);
    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/profile', async (req, res) => {
  const { id, name, email, password, portalType } = req.body;
  try {
    const supabase = getSupabase();
    const table = portalType === 'Gestão' ? 'gestao_users' : 'portal_users';
    
    const updateData: any = { name, email };
    if (password) updateData.password = password;

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json({ success: true, user: { id: data[0].id, name: data[0].name, email: data[0].email, portalType } });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Erro ao atualizar perfil.' });
  }
});

async function startServer() {
  // Vite middleware (apenas em dev)
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
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

  // Só inicia o listen se não estiver no Vercel (Vercel usa o export default)
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export { app };
export default app;
