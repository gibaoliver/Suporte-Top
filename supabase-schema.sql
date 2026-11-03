-- ============================================================================
-- MONITOR ACADEMY — TOP TECNOLOGIA
-- SCRIPT SQL PARA O SUPABASE SQL EDITOR
-- Copie todo este conteúdo e cole diretamente no SQL Editor do seu projeto Supabase!
-- ============================================================================

-- 1. Habilitar extensão para geração de UUIDs (caso ainda não esteja ativa)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Tabela de Módulos (Tópicos Principais do Menu Lateral)
CREATE TABLE IF NOT EXISTS public.modules (
    id TEXT PRIMARY KEY DEFAULT ('mod-' || floor(extract(epoch from now()))::text || '-' || substr(md5(random()::text), 1, 6)),
    order_index INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    badge_text TEXT DEFAULT 'MÓDULO',
    read_time TEXT DEFAULT '5 min',
    target_audience TEXT DEFAULT 'Gestores & Operadores',
    icon TEXT DEFAULT '📊',
    mascot_image TEXT DEFAULT 'assets/tep-tablet.png',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Tabela de Subtópicos e Conteúdo Detalhado
CREATE TABLE IF NOT EXISTS public.subtopics (
    id TEXT PRIMARY KEY DEFAULT ('sub-' || floor(extract(epoch from now()))::text || '-' || substr(md5(random()::text), 1, 6)),
    module_id TEXT REFERENCES public.modules(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL DEFAULT 0,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon TEXT DEFAULT '📌',
    lead_text TEXT,
    interactive_type TEXT DEFAULT 'none',
    content_html TEXT,
    placeholder_title TEXT,
    placeholder_desc TEXT,
    tip_title TEXT,
    tip_content TEXT,
    tip_mascot TEXT DEFAULT 'assets/tep-rocket.png',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Tabela de Configurações Administrativas
CREATE TABLE IF NOT EXISTS public.admin_config (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    site_title TEXT DEFAULT 'Monitor TOP Academy',
    system_version TEXT DEFAULT '2.4.0',
    admin_contact TEXT DEFAULT 'suporte@toptecnologia.com',
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ============================================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- Permite leitura pública para os alunos/gestores acessarem o tutorial,
-- e permite inserção/edição para o painel administrativo.
-- ============================================================================

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subtopics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_config ENABLE ROW LEVEL SECURITY;

-- Remover políticas antigas se já existirem
DROP POLICY IF EXISTS "Public Read Modules" ON public.modules;
DROP POLICY IF EXISTS "Allow All Modules" ON public.modules;
DROP POLICY IF EXISTS "Public Read Subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Allow All Subtopics" ON public.subtopics;
DROP POLICY IF EXISTS "Public Read Admin Config" ON public.admin_config;
DROP POLICY IF EXISTS "Allow All Admin Config" ON public.admin_config;

-- Criar políticas públicas de leitura e gerenciamento
CREATE POLICY "Public Read Modules" ON public.modules FOR SELECT USING (true);
CREATE POLICY "Allow All Modules" ON public.modules FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Subtopics" ON public.subtopics FOR SELECT USING (true);
CREATE POLICY "Allow All Subtopics" ON public.subtopics FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public Read Admin Config" ON public.admin_config FOR SELECT USING (true);
CREATE POLICY "Allow All Admin Config" ON public.admin_config FOR ALL USING (true) WITH CHECK (true);

-- ============================================================================
-- CARGA INICIAL (SEED) DOS 6 MÓDULOS OFICIAIS DO MONITOR ACADEMY
-- ============================================================================

INSERT INTO public.modules (id, order_index, title, slug, badge_text, read_time, target_audience, icon, mascot_image, description)
VALUES
('mod-1', 1, 'Visão Geral (Dashboard)', 'dashboard', 'Módulo 01 • Painel Principal', '5 min', 'Gestores & Operadores', '📊', 'assets/tep-tablet.png', 'A tela inicial do Monitor é o centro de comando da sua operação de mobilidade urbana. Nela, o gestor enxerga em segundos a disponibilidade da frota, a base de passageiros, o fluxo financeiro das corridas e os líderes de produtividade.'),
('mod-2', 2, 'Gestão de Usuários', 'gestao-usuarios', 'Módulo 02 • Cadastros & Compliance', '6 min', 'Gestores & Suporte', '🪪', 'assets/tep-car.png', 'Aprenda a operar os menus Clientes e Motoristas com segurança jurídica e agilidade operacional: desde a gestão de passageiros PF/PJ até a auditoria documental para liberação de novos condutores.'),
('mod-3', 3, 'Operação e Viagens', 'operacao-viagens', 'Módulo 03 • Tempo Real & Despacho', '6 min', 'Operadores de Tráfego', '🛵', 'assets/tep-delivery.png', 'Domine o acompanhamento geolocalizado da frota no menu Monitoramento, a auditoria de rotas em Viagens e Delivery e a inteligência de distribuição por Grupos de Chamados.'),
('mod-4', 4, 'Taxas e Financeiro', 'taxas-financeiro', 'Módulo 04 • Receita & Precificação', '7 min', 'Diretoria & Financeiro', '💰', 'assets/tep-moto.png', 'Aprenda a controlar o fluxo de caixa no menu Financeiro (faturamentos, extratos, recargas de crédito e repasses) e a calibrar a precificação completa em Avançadas > Configurações.'),
('mod-5', 5, 'Comunicação & Relatórios', 'comunicacao-relatorios', 'Módulo 05 • Atendimento & BI', '5 min', 'Atendimento & Gestão', '💬', 'assets/tep-tablet.png', 'Mantenha um canal próximo com passageiros e motoristas através dos menus Mensagens e Fale Conosco, e extraia dados estratégicos para tomada de decisão em Relatórios.'),
('mod-6', 6, 'Avançadas e Sistema', 'avancadas-sistema', 'Módulo 06 • Engenharia & Segurança', '6 min', 'Administradores Master', '⚙️', 'assets/tep-rocket.png', 'Configure cercas virtuais, mapas, Zonas de Risco e regras de negócio no menu Avançadas, além de gerenciar as ferramentas de administrador (Alterar Senha, Limpar Cache e Notificações).')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  order_index = EXCLUDED.order_index;

-- ============================================================================
-- CARGA INICIAL (SEED) DOS SUBTÓPICOS
-- ============================================================================

INSERT INTO public.subtopics (id, module_id, order_index, title, slug, icon, lead_text, interactive_type, placeholder_title, placeholder_desc, tip_title, tip_content, tip_mascot)
VALUES
('sub-1-1', 'mod-1', 1, '1. Visão geral da operação', 'visao-geral-operacao', '📌', 'Esse primeiro bloco serve para mostrar, de forma rápida, como a operação está se comportando no período selecionado.', 'none', NULL, NULL, NULL, NULL, NULL),
('sub-1-2', 'mod-1', 2, '2. Tipos de motorista', 'tipos-motorista', '📌', 'Logo abaixo da visão geral da operação, o Monitor agrupa seus condutores por Categoria de Serviço (Particular, Mulher, Mototaxista, Delivery) e subdivide em: Ativos, Pendentes e Bloqueados.', 'simulator_kpi', NULL, NULL, NULL, NULL, NULL),
('sub-1-3', 'mod-1', 3, '3. Clientes', 'clientes', '📌', 'Abaixo dos indicadores de motoristas, o painel apresenta o termômetro da demanda: a base de Clientes (Passageiros PF e Empresas PJ).', 'none', NULL, NULL, NULL, NULL, NULL),
('sub-1-4', 'mod-1', 4, '4. Movimentação de viagens', 'movimentacao-viagens', '📌', 'Na metade inferior do Dashboard, o gestor analisa o fluxo de corridas por forma de pagamento e taxa de conversão.', 'none', NULL, NULL, NULL, NULL, NULL),
('sub-1-5', 'mod-1', 5, '5. Rankings', 'rankings', '📌', 'Identifique quem são os principais geradores de receita e fidelização da sua plataforma.', 'none', NULL, NULL, 'Rotina Matinal Recomendada pelo Tep', 'Todo dia às 08h00, confira no Dashboard: 1) Fila de Motoristas Pendentes, 2) Taxa de Cancelamento e 3) Top 5 Motoristas da semana!', 'assets/tep-rocket.png'),

('sub-2-1', 'mod-2', 1, '2.1. Menu Clientes: Aprovar, Bloquear e Gerenciar Passageiros', 'gestao-clientes', '🧑', 'No menu lateral Clientes, o sistema subdivide a gestão em: Lista PF, Lista PJ e Solicitação de Exclusão (LGPD).', 'none', 'Espaço para Captura de Tela #02 — Menu Clientes (Lista PF / PJ / Exclusão)', 'Adicione aqui a captura da listagem de clientes do Monitor destacando a barra de busca e os botões de ação rápida.', NULL, NULL, NULL),
('sub-2-2', 'mod-2', 2, '2.2. Menu Motoristas: Análise de Documentação e Liberação de Frota', 'gestao-motoristas-kyc', '🪪', 'A qualidade e a segurança da sua plataforma começam na aprovação rigorosa dos motoristas (CNH EAR, CRLV, Antecedentes e PIX).', 'kyc_checklist', NULL, NULL, NULL, NULL, NULL),

('sub-3-1', 'mod-3', 1, '3.1. Monitoramento: Acompanhando Motoristas e Corridas no Mapa', 'monitoramento-mapa', '🗺️', 'Ao acessar Monitoramento no menu lateral, o gestor visualiza o mapa interativo atualizado via GPS em tempo real.', 'radar_map', 'Espaço para Captura de Tela #03 — Mapa de Monitoramento em Tempo Real', 'Insira aqui o print da tela Monitoramento mostrando os veículos distribuídos no mapa da sua cidade.', NULL, NULL, NULL),
('sub-3-2', 'mod-3', 2, '3.2. Viagens e Delivery: Solicitações, Rotas e Histórico', 'viagens-delivery', '🛣️', 'No menu Viagens, você audita tanto corridas de passageiros quanto entregas de pacotes (Delivery).', 'none', NULL, NULL, NULL, NULL, NULL),
('sub-3-3', 'mod-3', 3, '3.3. Grupos de Chamados: Organizando a Distribuição de Corridas', 'grupos-chamados', '📡', 'Os Grupos de Chamados organizam como o algoritmo distribui as solicitações aos condutores prioritários.', 'none', NULL, NULL, NULL, NULL, NULL),

('sub-4-1', 'mod-4', 1, '4.1. Menu Financeiro: Faturamentos, Extratos e Repasses', 'financeiro-repasses', '💳', 'No menu lateral Financeiro, todas as movimentações monetárias entre passageiros, motoristas e plataforma ficam centralizadas.', 'none', NULL, NULL, NULL, NULL, NULL),
('sub-4-2', 'mod-4', 2, '4.2. Passo a Passo: Configurando Tarifas e Taxa do Aplicativo', 'configuracao-taxas', '🧮', 'Para definir quanto o passageiro paga e qual a comissão retida pela plataforma, acesse Avançadas > Configurações.', 'calc_fare', 'Espaço para Captura de Tela #04 — Tela de Configuração de Taxas e Tarifas', 'Insira aqui o print da tela Avançadas > Configurações onde aparecem os campos de Tarifa Base, Valor por KM, Minuto e Taxa do App.', NULL, NULL, NULL),

('sub-5-1', 'mod-5', 1, '5.1. Mensagens e Fale Conosco: Suporte e Engajamento', 'mensagens-fale-conosco', '💬', 'A comunicação ágil evita cancelamentos, resolve objetos esquecidos e aumenta a retenção da frota.', 'none', NULL, NULL, NULL, NULL, NULL),
('sub-5-2', 'mod-5', 2, '5.2. Relatórios: Extraindo Dados Operacionais e Financeiros', 'relatorios-gerenciais', '📑', 'Em Financeiro > Relatórios, exporte planilhas prontas para contabilidade e auditoria operacional.', 'none', 'Espaço para Captura de Tela #05 — Central de Mensagens e Relatórios', 'Adicione aqui o print da tela de Relatórios ou Fale Conosco do painel Monitor.', NULL, NULL, NULL),

('sub-6-1', 'mod-6', 1, '6.1. Menu Avançadas: Mapas, Zonas de Risco e Regras de Negócio', 'zonas-risco-regras', '🛡️', 'O menu Avançadas reúne os parâmetros estratégicos que moldam o comportamento do aplicativo na sua cidade.', 'none', NULL, NULL, NULL, NULL, NULL),
('sub-6-2', 'mod-6', 2, '6.2. Perfil de Administrador: Senha, Limpar Cache e Notificações', 'perfil-administrador', '🔐', 'No canto superior direito do painel, você encontra os utilitários indispensáveis para segurança e propagação de mudanças.', 'none', 'Espaço para Captura de Tela #06 — Menu Avançadas e Perfil do Administrador', 'Insira aqui o print mostrando o menu de Zonas de Risco ou o botão de Limpar Cache do perfil.', NULL, NULL, NULL)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  lead_text = EXCLUDED.lead_text,
  order_index = EXCLUDED.order_index;

