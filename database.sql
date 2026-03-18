-- SQL para criação das tabelas no Supabase

-- Tabela de Usuários do Portal (Clientes)
CREATE TABLE portal_users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Usuários de Gestão (TI/Admin)
CREATE TABLE gestao_users (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Ativos (Equipamentos)
CREATE TABLE assets (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  serial_number TEXT,
  status TEXT DEFAULT 'Ativo',
  user_id BIGINT REFERENCES portal_users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Chamados
CREATE TABLE tickets (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'Aberto',
  priority TEXT DEFAULT 'Média',
  user_id BIGINT REFERENCES portal_users(id),
  asset_id BIGINT REFERENCES assets(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Mensagens dos Chamados
CREATE TABLE ticket_messages (
  id BIGSERIAL PRIMARY KEY,
  ticket_id BIGINT REFERENCES tickets(id) ON DELETE CASCADE,
  user_id BIGINT, -- Pode ser portal_user ou gestao_user
  user_name TEXT,
  message TEXT NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Estoque (Inventory)
CREATE TABLE inventory (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT,
  quantity INTEGER DEFAULT 0,
  min_quantity INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inserir usuário de teste para Gestão (se necessário)
-- INSERT INTO gestao_users (name, email, password) VALUES ('Admin', 'gestaoti.lubpar@gmail.com', 'admin123');
