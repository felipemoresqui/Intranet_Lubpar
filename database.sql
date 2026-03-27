-- SQL para criação das tabelas no Supabase

-- Tabela de Usuários do Portal (Clientes)
CREATE TABLE portal_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Usuários de Gestão (TI/Admin)
CREATE TABLE gestao_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Ativos (Equipamentos)
CREATE TABLE assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  serial_number TEXT,
  status TEXT DEFAULT 'Ativo',
  user_id UUID REFERENCES portal_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Chamados
CREATE TABLE tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Aberto',
  priority TEXT DEFAULT 'Média',
  user_id UUID REFERENCES portal_users(id),
  user_name TEXT, -- Denormalized for easier display
  asset_id UUID REFERENCES assets(id),
  responsible_id UUID REFERENCES gestao_users(id),
  responsible_name TEXT, -- Denormalized for easier display
  resolution TEXT,
  attachments TEXT[], -- Array of base64 strings or URLs
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Mensagens dos Chamados
CREATE TABLE ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES tickets(id) ON DELETE CASCADE,
  user_id UUID, -- Pode ser portal_user ou gestao_user
  user_name TEXT,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Estoque (Inventory)
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir usuário de teste para Gestão (se necessário)
-- INSERT INTO gestao_users (name, email, password) VALUES ('Admin', 'gestaoti.lubpar@gmail.com', 'admin123');
