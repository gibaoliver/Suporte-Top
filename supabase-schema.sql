-- ============================================================================
-- MONITOR TOP — ESQUEMA COMPLETO PARA O SUPABASE SQL EDITOR
-- Sistema de Gestão de Categorias de Tutoriais e Subtópicos
-- ============================================================================

-- Habilitar extensão para geração de UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. TABELA DE CATEGORIAS DE TUTORIAIS (MÓDULOS)
CREATE TABLE IF NOT EXISTS public.modules (
    id TEXT PRIMARY KEY DEFAULT ('mod-' || floor(extract(epoch from now()))::text || '-' || substr(md5(random()::text), 1, 6)),
    order_index INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon TEXT DEFAULT '📁',
    badge_text TEXT DEFAULT '',
    read_time TEXT DEFAULT '',
    target_audience TEXT DEFAULT '',
    mascot_image TEXT DEFAULT '',
    description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Garantir coluna icon se tabela já existir
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='modules' AND column_name='icon') THEN
        ALTER TABLE public.modules ADD COLUMN icon TEXT DEFAULT '📁';
    END IF;
END $$;

-- 2. TABELA DE TUTORIAIS / SUBTÓPICOS
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

-- 3. HABILITAR ROW LEVEL SECURITY (RLS)
ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;

-- 4. POLÍTICAS DE ACESSO (PERMISSÃO DE LEITURA E GESTÃO NO ADMIN)
DROP POLICY IF EXISTS "Public Read Modules" ON public.modules;
DROP POLICY IF EXISTS "Allow All Modules" ON public.modules;
DROP POLICY IF EXISTS "Public Read Subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Allow All Subtopics" ON public.subtopics;

CREATE POLICY "Public Read Modules" ON public.modules 
    FOR SELECT USING (true);

CREATE POLICY "Allow All Modules" ON public.modules 
    FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Subtopics" ON public.subtopics 
    FOR SELECT USING (true);

CREATE POLICY "Allow All Subtopics" ON public.subtopics 
    FOR ALL USING (true) WITH CHECK (true);

-- 5. CARGA INICIAL DE CATEGORIAS DE TUTORIAIS
INSERT INTO public.modules (id, order_index, title, slug, icon, description)
VALUES
('mod-1', 1, '(Dashboard)', 'dashboard', '📊', ''),
('mod-2', 2, 'Gestão de Usuários', 'gestao-usuarios', '👥', ''),
('mod-3', 3, 'Operação e Viagens', 'operacao-viagens', '🛵', ''),
('mod-4', 4, 'Taxas e Financeiro', 'taxas-financeiro', '💰', ''),
('mod-5', 5, 'Comunicação & Relatórios', 'comunicacao-relatorios', '💬', ''),
('mod-6', 6, 'Avançadas e Sistema', 'avancadas-sistema', '⚙️', ''),
('mod-7', 7, 'Configurações avançadas', 'configuracoes-avancadas', '🛠️', '')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title, 
    order_index = EXCLUDED.order_index, 
    icon = EXCLUDED.icon;

-- 6. CARGA INICIAL DE TUTORIAIS / SUBTÓPICOS (COM CONTEÚDO EM BRANCO)
INSERT INTO public.subtopics (id, module_id, order_index, title, slug, content_html, lead_text)
VALUES
-- Subtópicos de (Dashboard)
('sub-1-1', 'mod-1', 1, 'Visão geral da operação', 'visao-geral-operacao', '', ''),
('sub-1-2', 'mod-1', 2, 'Tipos de motorista', 'tipos-motorista', '', ''),
('sub-1-3', 'mod-1', 3, 'Clientes', 'clientes', '', ''),
('sub-1-4', 'mod-1', 4, 'Movimentação de viagens', 'movimentacao-viagens', '', ''),
('sub-1-5', 'mod-1', 5, 'Rankings', 'rankings', '', ''),

-- Subtópicos de Gestão de Usuários
('sub-2-1', 'mod-2', 1, 'Clientes', 'clientes-gestao', '', ''),
('sub-2-2', 'mod-2', 2, 'Motoristas', 'motoristas-gestao', '', ''),

-- Subtópicos de Operação e Viagens
('sub-3-1', 'mod-3', 1, 'Monitoramento ao Vivo', 'monitoramento-ao-vivo', '', ''),
('sub-3-2', 'mod-3', 2, 'Viagens e Delivery', 'viagens-delivery', '', ''),
('sub-3-3', 'mod-3', 3, 'Grupos de Chamados', 'grupos-chamados', '', ''),

-- Subtópicos de Taxas e Financeiro
('sub-4-1', 'mod-4', 1, 'Financeiro e Repasses', 'financeiro-repasses', '', ''),
('sub-4-2', 'mod-4', 2, 'Configuração de Taxas', 'configuracao-taxas', '', ''),

-- Subtópicos de Comunicação & Relatórios
('sub-5-1', 'mod-5', 1, 'Mensagens e Fale Conosco', 'mensagens-fale-conosco', '', ''),
('sub-5-2', 'mod-5', 2, 'Relatórios Gerenciais', 'relatorios-gerenciais', '', ''),

-- Subtópicos de Avançadas e Sistema
('sub-6-1', 'mod-6', 1, 'Mapas e Zonas de Risco', 'mapas-zonas-risco', '', ''),
('sub-6-2', 'mod-6', 2, 'Perfil de Administrador', 'perfil-administrador', '', '')
ON CONFLICT (id) DO UPDATE SET 
    title = EXCLUDED.title, 
    order_index = EXCLUDED.order_index;
