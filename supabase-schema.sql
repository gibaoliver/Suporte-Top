-- ============================================================================
-- MONITOR — TOP TECNOLOGIA
-- SCRIPT SQL PARA O SUPABASE SQL EDITOR
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabela de Categorias (Módulos do Menu)
CREATE TABLE IF NOT EXISTS public.modules (
    id TEXT PRIMARY KEY DEFAULT ('mod-' || floor(extract(epoch from now()))::text || '-' || substr(md5(random()::text), 1, 6)),
    order_index INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    badge_text TEXT DEFAULT '',
    read_time TEXT DEFAULT '',
    target_audience TEXT DEFAULT '',
    icon TEXT DEFAULT '',
    mascot_image TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Tabela de Subcategorias (Subtópicos do Menu)
CREATE TABLE IF NOT EXISTS public.subtopics (
    id TEXT PRIMARY KEY DEFAULT ('sub-' || floor(extract(epoch from now()))::text || '-' || substr(md5(random()::text), 1, 6)),
    module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon TEXT DEFAULT '',
    lead_text TEXT DEFAULT '',
    interactive_type TEXT DEFAULT 'none',
    content_html TEXT DEFAULT '',
    placeholder_title TEXT DEFAULT '',
    placeholder_desc TEXT DEFAULT '',
    tip_title TEXT DEFAULT '',
    tip_content TEXT DEFAULT '',
    tip_mascot TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Configurações Administrativas
CREATE TABLE IF NOT EXISTS public.admin_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_title TEXT DEFAULT 'Monitor TOP',
    system_version TEXT DEFAULT '2.4.0',
    admin_contact TEXT DEFAULT 'suporte@toptecnologia.com',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public Read Modules" ON public.modules;
DROP POLICY IF EXISTS "Allow All Modules" ON public.modules;
DROP POLICY IF EXISTS "Public Read Subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Allow All Subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Public Read Admin Config" ON public.admin_config;
DROP POLICY IF EXISTS "Allow All Admin Config" ON public.admin_config;

CREATE POLICY "Public Read Modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Allow All Modules" ON public.modules FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Subtopics" ON public.subtopics FOR SELECT USING (true);
CREATE POLICY "Allow All Subtopics" ON public.subtopics FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Admin Config" ON public.admin_config FOR SELECT USING (true);
CREATE POLICY "Allow All Admin Config" ON public.admin_config FOR ALL USING (true) WITH CHECK (true);

-- Carga das Categorias Iniciais
INSERT INTO public.modules (id, order_index, title, slug)
VALUES
('mod-1', 1, 'Dashboard', 'dashboard'),
('mod-2', 2, 'Gestão de Usuários', 'gestao-usuarios'),
('mod-3', 3, 'Operação e Viagens', 'operacao-viagens'),
('mod-4', 4, 'Taxas e Financeiro', 'taxas-financeiro'),
('mod-5', 5, 'Comunicação e Relatórios', 'comunicacao-relatorios'),
('mod-6', 6, 'Avançadas e Sistema', 'avancadas-sistema')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_index = EXCLUDED.order_index;

-- Carga das Subcategorias Iniciais (com conteúdo em branco)
INSERT INTO public.subtopics (id, module_id, order_index, title, slug)
VALUES
('sub-1-1', 'mod-1', 1, 'Visão geral da operação', 'visao-geral-operacao'),
('sub-1-2', 'mod-1', 2, 'Tipos de motorista', 'tipos-motorista'),
('sub-1-3', 'mod-1', 3, 'Clientes', 'clientes'),
('sub-1-4', 'mod-1', 4, 'Movimentação de viagens', 'movimentacao-viagens'),
('sub-1-5', 'mod-1', 5, 'Rankings', 'rankings'),

('sub-2-1', 'mod-2', 1, 'Clientes', 'clientes'),
('sub-2-2', 'mod-2', 2, 'Motoristas', 'motoristas'),

('sub-3-1', 'mod-3', 1, 'Monitoramento', 'monitoramento'),
('sub-3-2', 'mod-3', 2, 'Viagens e Delivery', 'viagens-delivery'),
('sub-3-3', 'mod-3', 3, 'Grupos de Chamados', 'grupos-chamados'),

('sub-4-1', 'mod-4', 1, 'Financeiro', 'financeiro'),
('sub-4-2', 'mod-4', 2, 'Configuração de Taxas', 'configuracao-taxas'),

('sub-5-1', 'mod-5', 1, 'Mensagens e Fale Conosco', 'mensagens-fale-conosco'),
('sub-5-2', 'mod-5', 2, 'Relatórios', 'relatorios'),

('sub-6-1', 'mod-6', 1, 'Mapas e Zonas de Risco', 'mapas-zonas-risco'),
('sub-6-2', 'mod-6', 2, 'Perfil de Administrador', 'perfil-administrador')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, order_index = EXCLUDED.order_index;
