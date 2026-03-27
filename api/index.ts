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
    
    // Tenta buscar todas as colunas primeiro
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

    let { data, error } = await query;
    
    // Se falhar (provavelmente por colunas novas que não existem no DB real),
    // tenta um fallback com as colunas básicas originais
    if (error && (error.code === '42703' || error.message?.includes('column') || error.message?.includes('not found'))) {
      console.warn('Supabase tickets full select failed, trying fallback:', error.message);
      let fallbackQuery = supabase
        .from('tickets')
        .select('id, title, description, status, priority, user_id, created_at')
        .order('created_at', { ascending: false });

      if (user_id && user_id !== 'undefined') {
        const userIdNum = Number(user_id);
        if (!isNaN(userIdNum)) {
          fallbackQuery = fallbackQuery.eq('user_id', userIdNum);
        } else {
          fallbackQuery = fallbackQuery.eq('user_id', user_id);
        }
      }
      
      const fallbackResult = await fallbackQuery;
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

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
    // Só inclui o user_id se o usuário estiver logado
    if (req.body.user_id) {
      try {
        // Busca o nome do usuário para denormalizar
        const { data: userData, error: userError } = await supabase
          .from('portal_users')
          .select('name')
          .eq('id', req.body.user_id)
          .single();
        
        if (userData && !userError) {
          req.body.user_name = userData.name;
        }
      } catch (e) {
        console.warn('Failed to fetch user name for denormalization:', e);
      }
    }

    let { data, error } = await supabase
      .from('tickets')
      .insert([req.body])
      .select();
      
    // Se falhar por coluna não existente, tenta remover as colunas novas
    if (error && (error.code === '42703' || error.message?.includes('column'))) {
      console.warn('Insert ticket failed due to missing columns, trying fallback:', error.message);
      const { user_name, responsible_id, responsible_name, resolution, attachments, ...fallbackBody } = req.body;
      const fallbackResult = await supabase
        .from('tickets')
        .insert([fallbackBody])
        .select();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

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
    let { data, error } = await supabase
      .from('tickets')
      .update(req.body)
      .eq('id', req.params.id)
      .select();

    // Se falhar por coluna não existente, tenta remover as colunas novas
    if (error && (error.code === '42703' || error.message?.includes('column'))) {
      console.warn('Update ticket failed due to missing columns, trying fallback:', error.message);
      const { user_name, responsible_id, responsible_name, resolution, attachments, ...fallbackBody } = req.body;
      const fallbackResult = await supabase
        .from('tickets')
        .update(fallbackBody)
        .eq('id', req.params.id)
        .select();
      data = fallbackResult.data;
      error = fallbackResult.error;
    }

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

app.get('/api/users', async (req, res) => {
  try {
    const supabase = getSupabase();
    
    const { data: portalUsers, error: portalError } = await supabase
      .from('portal_users')
      .select('id, name, email, created_at');
      
    const { data: gestaoUsers, error: gestaoError } = await supabase
      .from('gestao_users')
      .select('id, name, email, created_at');

    if (portalError) throw portalError;
    if (gestaoError) throw gestaoError;

    const allUsers = [
      ...(portalUsers || []).map(u => ({ ...u, type: 'Cliente' })),
      ...(gestaoUsers || []).map(u => ({ ...u, type: 'Gestão' }))
    ];

    res.json(allUsers);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/users', async (req, res) => {
  const { name, email, password, type } = req.body;
  try {
    const supabase = getSupabase();
    const table = type === 'Gestão' ? 'gestao_users' : 'portal_users';
    
    const { data, error } = await supabase
      .from(table)
      .insert([{ name, email, password }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  const { name, email, password, type, oldType } = req.body;
  const { id } = req.params;
  try {
    const supabase = getSupabase();
    
    // Se o tipo mudou, precisamos mover o usuário de tabela
    if (type !== oldType) {
      const oldTable = oldType === 'Gestão' ? 'gestao_users' : 'portal_users';
      const newTable = type === 'Gestão' ? 'gestao_users' : 'portal_users';
      
      // 1. Deleta da tabela antiga
      const { error: deleteError } = await supabase
        .from(oldTable)
        .delete()
        .eq('id', id);
      
      if (deleteError) throw deleteError;
      
      // 2. Insere na nova tabela (mantendo o ID se possível, mas UUIDs gen_random_uuid() podem complicar se não passarmos)
      // No Supabase, se passarmos o ID ele tenta usar.
      const insertData: any = { id, name, email, password };
      const { data: newData, error: insertError } = await supabase
        .from(newTable)
        .insert([insertData])
        .select();
        
      if (insertError) throw insertError;
      return res.json(newData[0]);
    }

    // Se o tipo não mudou, apenas atualiza
    const table = type === 'Gestão' ? 'gestao_users' : 'portal_users';
    const updateData: any = { name, email };
    if (password) updateData.password = password;

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq('id', id)
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { type } = req.query;
  const { id } = req.params;
  try {
    const supabase = getSupabase();
    const table = type === 'Gestão' ? 'gestao_users' : 'portal_users';
    
    const { error } = await supabase
      .from(table)
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
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
