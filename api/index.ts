import express from 'express';
import pg from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let pool: pg.Pool | null = null;
let dbInitialized = false;

async function getPool(): Promise<pg.Pool> {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    
    console.log('--- Neon Database Diagnostic ---');
    console.log('DATABASE_URL exists:', !!connectionString);
    if (connectionString) console.log('DATABASE_URL prefix:', connectionString.substring(0, 20));
    console.log('---------------------------');

    if (!connectionString) {
      throw new Error('DATABASE_URL environment variable is required for neon.tech');
    }
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes('localhost') || connectionString.includes('127.0.0.1') ? false : { rejectUnauthorized: false }
    });
  }

  if (!dbInitialized) {
    dbInitialized = true;
    await initializeDatabase(pool);
  }

  return pool;
}

async function initializeDatabase(pool: pg.Pool) {
  try {
    console.log('Iniciando checagem/criação automática de tabelas no Neon...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS portal_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS gestao_users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS assets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        serial_number TEXT,
        status TEXT DEFAULT 'Ativo',
        user_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS tickets (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        status TEXT DEFAULT 'Aberto',
        priority TEXT DEFAULT 'Média',
        user_id UUID REFERENCES portal_users(id) ON DELETE SET NULL,
        user_name TEXT,
        asset_id UUID REFERENCES assets(id) ON DELETE SET NULL,
        responsible_id UUID REFERENCES gestao_users(id) ON DELETE SET NULL,
        responsible_name TEXT,
        resolution TEXT,
        attachments TEXT[],
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS ticket_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
        user_id UUID,
        user_name TEXT,
        message TEXT NOT NULL,
        is_admin BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS inventory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name TEXT NOT NULL,
        category TEXT,
        quantity INTEGER DEFAULT 0,
        min_quantity INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS category_configs (
        category TEXT PRIMARY KEY,
        icon TEXT,
        columns JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    // Cadastro de usuários de teste padrão usando ON CONFLICT
    await pool.query(`
      INSERT INTO gestao_users (name, email, password) 
      VALUES ('Gestão de Teste', 'gestao@lubpar.com', 'teste123')
      ON CONFLICT (email) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO gestao_users (name, email, password) 
      VALUES ('Admin TI', 'gestaoti.lubpar@gmail.com', 'admin123')
      ON CONFLICT (email) DO NOTHING;
    `);

    await pool.query(`
      INSERT INTO portal_users (name, email, password) 
      VALUES ('Colaborador de Teste', 'colaborador@lubpar.com', 'teste123')
      ON CONFLICT (email) DO NOTHING;
    `);

    console.log('Database Neon inicializado perfeitamente.');
  } catch (error) {
    console.error('Erro na inicialização automática do banco de dados Neon:', error);
  }
}

async function insertRow(pool: pg.Pool, table: string, rowData: any) {
  const keys = Object.keys(rowData).filter(k => rowData[k] !== undefined);
  const values = keys.map(k => rowData[k]);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders}) RETURNING *`;
  const result = await pool.query(sql, values);
  return result.rows[0];
}

async function updateRow(pool: pg.Pool, table: string, id: any, rowData: any) {
  const keys = Object.keys(rowData).filter(k => k !== 'id' && rowData[k] !== undefined);
  const values = keys.map(k => rowData[k]);
  const sets = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');
  values.push(id);
  const sql = `UPDATE ${table} SET ${sets} WHERE id = $${values.length} RETURNING *`;
  const result = await pool.query(sql, values);
  return result.rows[0];
}

const app = express();
const PORT = 3000;

app.use(express.json());

app.post('/api/login', async (req, res) => {
  const { email, password, portalType } = req.body;
  console.log(`Login attempt: ${email} on ${portalType}`);
  
  try {
    const pool = await getPool();
    const table = portalType === 'Gestão' ? 'gestao_users' : 'portal_users';
    
    const { rows } = await pool.query(`SELECT * FROM ${table} WHERE email = $1 AND password = $2 LIMIT 1`, [email, password]);
    const data = rows[0];

    if (!data) {
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
    const pool = await getPool();
    
    const { rows: assetRows } = await pool.query('SELECT count(*) as count FROM assets');
    const assetCount = parseInt(assetRows[0].count, 10);

    let ticketQuery = "SELECT count(*) as count FROM tickets WHERE status = 'Aberto'";
    const ticketParams = [];
    if (user_id) {
      ticketQuery += " AND user_id = $1";
      ticketParams.push(user_id);
    }
    const { rows: ticketRows } = await pool.query(ticketQuery, ticketParams);
    const ticketCount = parseInt(ticketRows[0].count, 10);
    
    const { rows: inventoryData } = await pool.query('SELECT name, quantity, min_quantity FROM inventory');
    
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
    const pool = await getPool();
    
    let data;
    try {
      let queryText = "SELECT * FROM tickets";
      const queryParams = [];
      if (user_id && user_id !== 'undefined') {
        queryText += " WHERE user_id = $1";
        queryParams.push(user_id);
      }
      queryText += " ORDER BY created_at DESC";
      const resQuery = await pool.query(queryText, queryParams);
      data = resQuery.rows;
    } catch (error) {
      console.warn('Postgres tickets full select failed, trying fallback:', error.message);
      let queryText = "SELECT id, title, description, status, priority, user_id, created_at FROM tickets";
      const queryParams = [];
      if (user_id && user_id !== 'undefined') {
        queryText += " WHERE user_id = $1";
        queryParams.push(user_id);
      }
      queryText += " ORDER BY created_at DESC";
      const resQuery = await pool.query(queryText, queryParams);
      data = resQuery.rows;
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
    const pool = await getPool();
    if (req.body.user_id) {
      try {
        const { rows: userRows } = await pool.query('SELECT name FROM portal_users WHERE id = $1', [req.body.user_id]);
        if (userRows.length > 0) {
          req.body.user_name = userRows[0].name;
        }
      } catch (e) {
        console.warn('Failed to fetch user name for denormalization:', e);
      }
    }

    let data;
    try {
      data = await insertRow(pool, 'tickets', req.body);
    } catch (error) {
      console.warn('Insert ticket failed due to missing columns, trying fallback:', error.message);
      const { user_name, responsible_id, responsible_name, resolution, attachments, ...fallbackBody } = req.body;
      data = await insertRow(pool, 'tickets', fallbackBody);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/tickets/:id', async (req, res) => {
  try {
    const pool = await getPool();
    let data;
    try {
      data = await updateRow(pool, 'tickets', req.params.id, req.body);
    } catch (error) {
      console.warn('Update ticket failed due to missing columns, trying fallback:', error.message);
      const { user_name, responsible_id, responsible_name, resolution, attachments, ...fallbackBody } = req.body;
      data = await updateRow(pool, 'tickets', req.params.id, fallbackBody);
    }
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/tickets/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.query('DELETE FROM tickets WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/tickets/:id/messages', async (req, res) => {
  try {
    const pool = await getPool();
    const { rows } = await pool.query('SELECT * FROM ticket_messages WHERE ticket_id = $1 ORDER BY created_at ASC', [req.params.id]);
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/tickets/:id/messages', async (req, res) => {
  try {
    const pool = await getPool();
    const data = await insertRow(pool, 'ticket_messages', { ...req.body, ticket_id: req.params.id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/category-configs', async (req, res) => {
  console.log('GET /api/category-configs');
  try {
    const pool = await getPool();
    const { rows } = await pool.query('SELECT * FROM category_configs ORDER BY category');
    res.json(rows || []);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/category-configs', async (req, res) => {
  console.log('POST /api/category-configs', req.body);
  const { category, icon, columns } = req.body;
  try {
    const pool = await getPool();
    const sql = `
      INSERT INTO category_configs (category, icon, columns)
      VALUES ($1, $2, $3)
      ON CONFLICT (category) 
      DO UPDATE SET icon = EXCLUDED.icon, columns = EXCLUDED.columns
    `;
    await pool.query(sql, [category, icon, JSON.stringify(columns)]);
    res.json({ success: true });
  } catch (error) {
    console.error('Post category error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/category-configs/:category', async (req, res) => {
  console.log('DELETE /api/category-configs', req.params.category);
  try {
    const pool = await getPool();
    await pool.query('DELETE FROM category_configs WHERE category = $1', [req.params.category]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete category error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/assets', async (req, res) => {
  try {
    const pool = await getPool();
    const { rows } = await pool.query('SELECT * FROM assets ORDER BY created_at DESC');
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/assets', async (req, res) => {
  try {
    const pool = await getPool();
    const data = await insertRow(pool, 'assets', req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/assets/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.query('DELETE FROM assets WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/inventory', async (req, res) => {
  try {
    const pool = await getPool();
    const { rows } = await pool.query('SELECT * FROM inventory ORDER BY name');
    res.json(rows || []);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/inventory', async (req, res) => {
  try {
    const pool = await getPool();
    const data = await insertRow(pool, 'inventory', req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/inventory/:id', async (req, res) => {
  try {
    const pool = await getPool();
    const data = await updateRow(pool, 'inventory', req.params.id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/inventory/:id', async (req, res) => {
  try {
    const pool = await getPool();
    await pool.query('DELETE FROM inventory WHERE id = $1', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const pool = await getPool();
    
    const { rows: portalUsers } = await pool.query('SELECT id, name, email, created_at FROM portal_users');
    const { rows: gestaoUsers } = await pool.query('SELECT id, name, email, created_at FROM gestao_users');

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
    const pool = await getPool();
    const table = type === 'Gestão' ? 'gestao_users' : 'portal_users';
    const data = await insertRow(pool, table, { name, email, password });
    res.json(data);
  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.patch('/api/users/:id', async (req, res) => {
  const { name, email, password, type, oldType } = req.body;
  const { id } = req.params;
  try {
    const pool = await getPool();
    
    if (type !== oldType) {
      const oldTable = oldType === 'Gestão' ? 'gestao_users' : 'portal_users';
      const newTable = type === 'Gestão' ? 'gestao_users' : 'portal_users';
      
      const { rows } = await pool.query(`SELECT * FROM ${oldTable} WHERE id = $1`, [id]);
      const oldData = rows[0];
      if (!oldData) throw new Error('User not found');
      
      await pool.query(`DELETE FROM ${oldTable} WHERE id = $1`, [id]);
      
      const insertData: any = { 
        id, 
        name, 
        email, 
        password: password || oldData.password 
      };
      
      const newData = await insertRow(pool, newTable, insertData);
      return res.json(newData);
    }

    const table = type === 'Gestão' ? 'gestao_users' : 'portal_users';
    const updateData: any = { name, email };
    if (password) updateData.password = password;

    const data = await updateRow(pool, table, id, updateData);
    res.json(data);
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/users/:id', async (req, res) => {
  const { type } = req.query;
  const { id } = req.params;
  try {
    const pool = await getPool();
    const table = type === 'Gestão' ? 'gestao_users' : 'portal_users';
    await pool.query(`DELETE FROM ${table} WHERE id = $1`, [id]);
    res.json({ success: true });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/boletos', async (req, res) => {
  const { searchBy, searchData, branch, filial, pedido } = req.body;
  console.log('POST /api/boletos', { searchBy, searchData, branch, filial, pedido });

  try {
    const tokenUrl = process.env.TOTVS_TOKEN_URL || 'https://lubparcomercio183175.protheus.cloudtotvs.com.br:4050/rest/api/oauth2/v1/token?grant_type=password';
    const username = process.env.TOTVS_API_USER || 'USER.PORTALSIM';
    const password = process.env.TOTVS_API_PASSWORD || ']lDQz0+^fM!\\U;Xm';
    const apiUrl = process.env.TOTVS_BOLETO_API_URL || 'https://lubparcomercio183175.protheus.cloudtotvs.com.br:4050/rest/INT_LUBPAR_BOLETO_2';

    // 1. Get Token
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        username: username,
        password: password,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Totvs Token Error:', errorText);
      return res.status(tokenResponse.status).json({ error: 'Erro ao autenticar com a API Totvs.' });
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    if (!accessToken) {
      return res.status(500).json({ error: 'Token não recebido da API Totvs.' });
    }

    // 2. Fetch Boletos
    const queryParams = new URLSearchParams();
    if (filial) queryParams.append('filial', filial);
    if (pedido) queryParams.append('pedido', pedido);
    
    // Fallback to previous params if new ones aren't provided (for backward compatibility if needed)
    if (!filial && branch) queryParams.append('branch', branch);
    if (!pedido && searchBy && searchData) {
      queryParams.append('searchBy', searchBy);
      queryParams.append('searchData', searchData);
    }

    const boletoResponse = await fetch(`${apiUrl}?${queryParams}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!boletoResponse.ok) {
      const errorText = await boletoResponse.text();
      console.error('Totvs API Error:', errorText);
      return res.status(boletoResponse.status).json({ error: 'Erro ao buscar boletos na API Totvs.' });
    }

    const rawText = await boletoResponse.text();
    console.log('Totvs API Raw Response:', rawText);

    let boletosData;
    try {
      // Try to clean the JSON if it has common Protheus/REST errors like ": ," or ": }"
      // This handles cases where a value is missing between a colon and a comma or brace
      const cleanedText = rawText
        .replace(/:\s*,/g, ': null,')
        .replace(/:\s*}/g, ': null}')
        .replace(/\[\s*,/g, '[null,')
        .replace(/,\s*,/g, ', null,')
        .replace(/,\s*\]/g, ', null]');
      
      boletosData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Totvs API response:', parseError);
      return res.status(500).json({ 
        error: 'A API do Totvs retornou um formato inválido.',
        details: rawText.substring(0, 200) 
      });
    }
    
    // Transform the data if necessary to match the frontend expectations
    // For now, we'll return it as is, but we might need to map it.
    res.json(boletosData);

  } catch (error) {
    console.error('Boleto API error:', error);
    res.status(500).json({ error: 'Erro interno ao processar solicitação de boleto.' });
  }
});

app.patch('/api/profile', async (req, res) => {
  const { id, name, email, password, portalType } = req.body;
  try {
    const pool = await getPool();
    const table = portalType === 'Gestão' ? 'gestao_users' : 'portal_users';
    
    const updateData: any = { name, email };
    if (password) updateData.password = password;

    const data = await updateRow(pool, table, id, updateData);
    res.json({ success: true, user: { id: data.id, name: data.name, email: data.email, portalType } });
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
