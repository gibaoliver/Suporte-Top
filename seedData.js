/* ==========================================================================
   INITIAL SEED DATA — 6 MÓDULOS COMPLETOS E SUBTÓPICOS
   ========================================================================== */

export const INITIAL_MODULES = [
  {
    id: "mod-1",
    order_index: 1,
    slug: "dashboard",
    title: "Visão Geral (Dashboard)",
    badge_text: "Módulo 01 • Painel Principal",
    read_time: "5 min",
    target_audience: "Gestores & Operadores",
    icon: "📊",
    mascot_image: "assets/tep-tablet.png",
    description: "A tela inicial do Monitor é o centro de comando da sua operação de mobilidade urbana. Nela, o gestor enxerga em segundos a disponibilidade da frota, a base de passageiros, o fluxo financeiro das corridas e os líderes de produtividade.",
    subtopics: [
      {
        id: "sub-1-1",
        order_index: 1,
        slug: "metricas-topo",
        title: "1.1. Lendo as Métricas do Topo (Categorias e Status da Frota)",
        icon: "📊",
        lead_text: "Logo no topo do Dashboard, o Monitor agrupa seus condutores por Categoria de Serviço (Particular, Mulher, Mototaxista, Delivery, Executivo) e subdivide cada categoria em três indicadores vitais de saúde operacional: Ativos, Pendentes e Bloqueados.",
        interactive_type: "simulator_kpi",
        content_html: `
          <p>O topo da tela é a bússola diária do gestor. Ao abrir o sistema pela manhã, verifique imediatamente a contagem de motoristas em cada status:</p>
          <ul style="margin: 14px 0 14px 20px; line-height: 1.8; color: var(--text-secondary);">
            <li><strong>Ativos:</strong> Motoristas aprovados, aptos a ficar online e receber chamadas agora.</li>
            <li><strong>Pendentes:</strong> Cadastros novos aguardando aprovação de documentos. Meta da equipe: zerar essa fila diariamente!</li>
            <li><strong>Bloqueados:</strong> Condutores suspensos por pendência financeira, CNH vencida ou queixas graves.</li>
          </ul>
        `,
        placeholder_title: "Espaço para Captura de Tela #01 — Topo do Dashboard (Métricas de Motoristas)",
        placeholder_desc: "Insira aqui o print oficial dos cards superiores do seu painel Monitor mostrando as categorias (Particular, Mulher, Mototaxista, etc.)."
      },
      {
        id: "sub-1-2",
        order_index: 2,
        slug: "secao-clientes",
        title: "1.2. Interpretando a Seção Clientes (Passageiros)",
        icon: "👥",
        lead_text: "Abaixo dos indicadores de motoristas, o painel apresenta o termômetro da demanda: a base de Clientes (Passageiros PF e Empresas PJ).",
        interactive_type: "none",
        content_html: `
          <div class="grid-4">
            <div class="card">
              <div class="card-header"><span class="card-title">🌐 Total</span><span class="status-badge info">Base Bruta</span></div>
              <p>Soma histórica de todas as contas de passageiros criadas no aplicativo desde o lançamento.</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">✅ Ativos</span><span class="status-badge active">Aptos</span></div>
              <p>Passageiros com cadastro validado e liberados para solicitar corridas e entregas imediatamente.</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">⏳ Pendentes</span><span class="status-badge pending">Verificação</span></div>
              <p>Usuários que iniciaram o cadastro mas ainda aguardam validação de SMS, e-mail ou aprovação corporativa.</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">🚫 Bloqueados</span><span class="status-badge blocked">Suspensos</span></div>
              <p>Contas suspensas manualmente por fraude, inadimplência recorrente ou solicitação de exclusão.</p>
            </div>
          </div>
        `
      },
      {
        id: "sub-1-3",
        order_index: 3,
        slug: "movimentacao-rankings",
        title: "1.3. Movimentação de Viagens e Rankings (Top Motoristas e Clientes)",
        icon: "🏆",
        lead_text: "Na metade inferior do Dashboard, o gestor analisa a conversão real de corridas e identifica quem são os maiores geradores de receita da plataforma.",
        interactive_type: "none",
        content_html: `
          <div class="grid-2">
            <div class="card">
              <div class="card-header"><span class="card-title">📈 Movimentação de Viagens</span><span class="status-badge active">Tempo Real</span></div>
              <p>Divide o volume de corridas por Meio de Pagamento (PIX, Cartão no App, Dinheiro, Voucher PJ) e por Status Final (Concluídas, Em Andamento e Canceladas).</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">🥇 Rankings (Top Motoristas & Clientes)</span><span class="status-badge pending">Fidelização</span></div>
              <p>Lista automaticamente os condutores com maior número de viagens concluídas e os passageiros mais frequentes para campanhas de bonificação.</p>
            </div>
          </div>
        `,
        tip_title: "Rotina Matinal Recomendada pelo Tep",
        tip_content: "Todo dia às 08h00, confira no Dashboard: 1) Fila de Motoristas Pendentes (meta: zerar até as 10h), 2) Taxa de Cancelamento do dia anterior e 3) Top 5 Motoristas da semana!",
        tip_mascot: "assets/tep-rocket.png"
      }
    ]
  },
  {
    id: "mod-2",
    order_index: 2,
    slug: "gestao-usuarios",
    title: "Gestão de Usuários",
    badge_text: "Módulo 02 • Cadastros & Compliance",
    read_time: "6 min",
    target_audience: "Gestores & Suporte",
    icon: "🪪",
    mascot_image: "assets/tep-car.png",
    description: "Aprenda a operar os menus Clientes e Motoristas com segurança jurídica e agilidade operacional: desde a gestão de passageiros PF/PJ até a auditoria documental para liberação de novos condutores.",
    subtopics: [
      {
        id: "sub-2-1",
        order_index: 1,
        slug: "gestao-clientes",
        title: "2.1. Menu Clientes: Aprovar, Bloquear e Gerenciar Passageiros",
        icon: "🧑",
        lead_text: "No menu lateral Clientes, o sistema subdivide a gestão em três submódulos estratégicos: Pessoa Física, Pessoa Jurídica e Solicitação de Exclusão.",
        interactive_type: "none",
        content_html: `
          <div class="grid-3">
            <div class="card">
              <div class="card-header"><span class="card-title">📄 Lista de Pessoa Física</span><span class="status-badge info">Passageiros PF</span></div>
              <p>Consulte nome, CPF, telefone, e-mail, nota e histórico de viagens. Edite dados ou bloqueie usuários com histórico de fraude.</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">🏢 Lista de Pessoa Jurídica</span><span class="status-badge active">Empresas PJ</span></div>
              <p>Gerencie empresas conveniadas com vouchers corporativos para transporte de colaboradores com faturamento quinzenal ou mensal.</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">🗑️ Solicitação de Exclusão</span><span class="status-badge blocked">LGPD</span></div>
              <p>Atenda a pedidos de encerramento de conta garantindo que não existam dívidas ativas antes da exclusão definitiva.</p>
            </div>
          </div>
        `,
        placeholder_title: "Espaço para Captura de Tela #02 — Menu Clientes (Lista PF / PJ / Exclusão)",
        placeholder_desc: "Adicione aqui a captura da listagem de clientes do Monitor destacando a barra de busca e os botões de ação rápida."
      },
      {
        id: "sub-2-2",
        order_index: 2,
        slug: "gestao-motoristas-kyc",
        title: "2.2. Menu Motoristas: Análise de Documentação e Liberação de Frota",
        icon: "🪪",
        lead_text: "A qualidade e a segurança da sua plataforma começam na aprovação rigorosa dos motoristas. Conheça as etapas e experimente o simulador de conferência documental:",
        interactive_type: "kyc_checklist",
        content_html: `
          <div class="steps-timeline">
            <div class="step-card">
              <div class="step-number-badge">1</div>
              <div class="step-body"><h4>Acesse a Fila de Cadastros Pendentes</h4><p>Clique em Motoristas > Pendentes no menu lateral.</p></div>
            </div>
            <div class="step-card">
              <div class="step-number-badge">2</div>
              <div class="step-body"><h4>Inspecione os Documentos e Fotos</h4><p>Valide CNH com observação EAR, CRLV do veículo, Certidão de Antecedentes Criminais e foto de perfil.</p></div>
            </div>
            <div class="step-card">
              <div class="step-number-badge">3</div>
              <div class="step-body"><h4>Atribua a Categoria e Aprove</h4><p>Vincule as categorias autorizadas (Particular, Mulher, Moto) e clique em Aprovar Motorista.</p></div>
            </div>
          </div>
        `
      }
    ]
  },
  {
    id: "mod-3",
    order_index: 3,
    slug: "operacao-viagens",
    title: "Operação e Viagens",
    badge_text: "Módulo 03 • Tempo Real & Despacho",
    read_time: "6 min",
    target_audience: "Operadores de Tráfego",
    icon: "🛵",
    mascot_image: "assets/tep-delivery.png",
    description: "Domine o acompanhamento geolocalizado da frota no menu Monitoramento, a auditoria de rotas em Viagens e Delivery e a inteligência de distribuição por Grupos de Chamados.",
    subtopics: [
      {
        id: "sub-3-1",
        order_index: 1,
        slug: "monitoramento-mapa",
        title: "3.1. Monitoramento: Acompanhando Motoristas e Corridas no Mapa",
        icon: "🗺️",
        lead_text: "Ao acessar Monitoramento no menu lateral, o gestor visualiza o mapa interativo atualizado via GPS em tempo real.",
        interactive_type: "radar_map",
        content_html: `
          <p>O mapa ao vivo permite visualizar a densidade de veículos em cada bairro, prevenir pontos desatendidos e acompanhar corridas em andamento.</p>
        `,
        placeholder_title: "Espaço para Captura de Tela #03 — Mapa de Monitoramento em Tempo Real",
        placeholder_desc: "Insira aqui o print da tela Monitoramento mostrando os veículos distribuídos no mapa da sua cidade."
      },
      {
        id: "sub-3-2",
        order_index: 2,
        slug: "viagens-delivery",
        title: "3.2. Viagens e Delivery: Solicitações, Rotas e Histórico",
        icon: "🛣️",
        lead_text: "No menu Viagens, você audita tanto corridas de passageiros quanto entregas de pacotes (Delivery).",
        interactive_type: "none",
        content_html: `
          <div class="grid-3">
            <div class="card">
              <div class="card-header"><span class="card-title">📍 Trajeto e Telemetria</span><span class="status-badge info">Rota GPS</span></div>
              <p>Origem, paradas intermediárias, destino final, distância estimada vs. real e horários de embarque.</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">📦 Gestão de Delivery</span><span class="status-badge pending">Entregas</span></div>
              <p>Código de segurança para confirmação da entrega e observações especiais de coleta de encomendas.</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">🛠️ Intervenção Operacional</span><span class="status-badge active">Suporte ao Vivo</span></div>
              <p>Ferramenta para finalizar manualmente viagens ou cancelar sem cobrança em emergências mecânicas.</p>
            </div>
          </div>
        `
      },
      {
        id: "sub-3-3",
        order_index: 3,
        slug: "grupos-chamados",
        title: "3.3. Grupos de Chamados: Organizando a Distribuição de Corridas",
        icon: "📡",
        lead_text: "Os Grupos de Chamados organizam como o algoritmo distribui as solicitações aos condutores.",
        interactive_type: "none",
        content_html: `
          <p>Crie regras de prioridade por cooperativa, ponto de apoio ou categoria de condutor com tempos de toque escalonados.</p>
        `
      }
    ]
  },
  {
    id: "mod-4",
    order_index: 4,
    slug: "taxas-financeiro",
    title: "Taxas e Financeiro",
    badge_text: "Módulo 04 • Receita & Precificação",
    read_time: "7 min",
    target_audience: "Diretoria & Financeiro",
    icon: "💰",
    mascot_image: "assets/tep-moto.png",
    description: "Aprenda a controlar o fluxo de caixa no menu Financeiro (faturamentos, extratos, recargas de crédito e repasses) e a calibrar a precificação completa em Avançadas > Configurações.",
    subtopics: [
      {
        id: "sub-4-1",
        order_index: 1,
        slug: "financeiro-repasses",
        title: "4.1. Menu Financeiro: Faturamentos, Extratos e Repasses",
        icon: "💳",
        lead_text: "No menu lateral Financeiro, todas as movimentações monetárias entre passageiros, motoristas e plataforma ficam centralizadas em submódulos auditáveis.",
        interactive_type: "none",
        content_html: `
          <div class="grid-3">
            <div class="card">
              <div class="card-header"><span class="card-title">📊 Produção do Motorista</span><span class="status-badge active">Extrato</span></div>
              <p>Faturamento por forma de pagamento (Dinheiro, PIX, Cartão App) e saldo da carteira virtual do condutor.</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">🔄 Solicitações de Saque</span><span class="status-badge pending">Repasses PIX</span></div>
              <p>Fila de auditoria e liberação de transferências solicitadas pelos condutores com saldo positivo.</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">🪙 Compra de Crédito</span><span class="status-badge info">Comissões</span></div>
              <p>Gestão de planos pré-pagos e conciliação de recebíveis no Dashboard Adquirente.</p>
            </div>
          </div>
        `
      },
      {
        id: "sub-4-2",
        order_index: 2,
        slug: "configuracao-taxas",
        title: "4.2. Passo a Passo: Configurando Tarifas e Taxa do Aplicativo",
        icon: "🧮",
        lead_text: "Para definir quanto o passageiro paga pela corrida e qual a comissão retida pela plataforma, acesse Avançadas > Configurações:",
        interactive_type: "calc_fare",
        content_html: `
          <div class="steps-timeline">
            <div class="step-card"><div class="step-number-badge">1</div><div class="step-body"><h4>Acesse Avançadas > Configurações</h4><p>Selecione a aba de Categorias e Tarifas da modalidade desejada.</p></div></div>
            <div class="step-card"><div class="step-number-badge">2</div><div class="step-body"><h4>Defina a Tarifa Base e Mínima</h4><p>Insira a bandeirada inicial (ex: R$ 4,50) e a tarifa mínima garantida por corrida (ex: R$ 8,00).</p></div></div>
            <div class="step-card"><div class="step-number-badge">3</div><div class="step-body"><h4>Configure o Valor por KM e por Minuto</h4><p>Calibre a remuneração por distância percorrida e tempo em trânsito lento.</p></div></div>
            <div class="step-card"><div class="step-number-badge">4</div><div class="step-body"><h4>Defina a Taxa do Aplicativo (%)</h4><p>Percentual retido pela plataforma sobre as corridas intermediadas (ex: 15%).</p></div></div>
          </div>
        `,
        placeholder_title: "Espaço para Captura de Tela #04 — Tela de Configuração de Taxas e Tarifas",
        placeholder_desc: "Insira aqui o print da tela Avançadas > Configurações onde aparecem os campos de Tarifa Base, Valor por KM, Minuto e Taxa do App."
      }
    ]
  },
  {
    id: "mod-5",
    order_index: 5,
    slug: "comunicacao-relatorios",
    title: "Comunicação & Relatórios",
    badge_text: "Módulo 05 • Atendimento & BI",
    read_time: "5 min",
    target_audience: "Atendimento & Gestão",
    icon: "💬",
    mascot_image: "assets/tep-tablet.png",
    description: "Mantenha um canal próximo com passageiros e motoristas através dos menus Mensagens e Fale Conosco, e extraia dados estratégicos para tomada de decisão em Relatórios.",
    subtopics: [
      {
        id: "sub-5-1",
        order_index: 1,
        slug: "mensagens-fale-conosco",
        title: "5.1. Mensagens e Fale Conosco: Suporte e Engajamento",
        icon: "💬",
        lead_text: "A comunicação ágil evita cancelamentos, resolve objetos esquecidos e aumenta a retenção da frota.",
        interactive_type: "none",
        content_html: `
          <div class="grid-2">
            <div class="card">
              <div class="card-header"><span class="card-title">📣 Menu Mensagens</span><span class="status-badge info">Push Geral</span></div>
              <p>Envie avisos em massa para todos os motoristas, passageiros ou usuários individuais com alertas de chuva, alta demanda ou cupons.</p>
            </div>
            <div class="card">
              <div class="card-header"><span class="card-title">🎧 Fale Conosco</span><span class="status-badge pending">Tickets SAC</span></div>
              <p>Gerencie chamados abertos pelo aplicativo com histórico de conversa e link direto para a corrida em questão.</p>
            </div>
          </div>
        `
      },
      {
        id: "sub-5-2",
        order_index: 2,
        slug: "relatorios-gerenciais",
        title: "5.2. Relatórios: Extraindo Dados Operacionais e Financeiros",
        icon: "📑",
        lead_text: "Em Financeiro > Relatórios, exporte planilhas prontas para contabilidade e auditoria operacional.",
        interactive_type: "none",
        content_html: `
          <div class="grid-3">
            <div class="card"><div class="card-header"><span class="card-title">📈 Corridas</span><span class="status-badge active">Operação</span></div><p>Horários de pico, volume de solicitações e conversão por bairro.</p></div>
            <div class="card"><div class="card-header"><span class="card-title">💵 Receitas</span><span class="status-badge pending">Financeiro</span></div><p>Volume bruto transacionado e comissões líquidas da plataforma.</p></div>
            <div class="card"><div class="card-header"><span class="card-title">🏢 Empresas PJ</span><span class="status-badge info">B2B</span></div><p>Extratos corporativos para faturamento direto com centros de custo.</p></div>
          </div>
        `,
        placeholder_title: "Espaço para Captura de Tela #05 — Central de Mensagens e Relatórios",
        placeholder_desc: "Adicione aqui o print da tela de Relatórios ou Fale Conosco do painel Monitor."
      }
    ]
  },
  {
    id: "mod-6",
    order_index: 6,
    slug: "avancadas-sistema",
    title: "Avançadas e Sistema",
    badge_text: "Módulo 06 • Engenharia & Segurança",
    read_time: "6 min",
    target_audience: "Administradores Master",
    icon: "⚙️",
    mascot_image: "assets/tep-rocket.png",
    description: "Configure cercas virtuais, mapas, Zonas de Risco e regras de negócio no menu Avançadas, além de gerenciar as ferramentas de administrador (Alterar Senha, Limpar Cache e Notificações).",
    subtopics: [
      {
        id: "sub-6-1",
        order_index: 1,
        slug: "zonas-risco-regras",
        title: "6.1. Menu Avançadas: Mapas, Zonas de Risco e Regras de Negócio",
        icon: "🛡️",
        lead_text: "O menu Avançadas reúne os parâmetros estratégicos que moldam o comportamento do aplicativo na sua cidade.",
        interactive_type: "none",
        content_html: `
          <div class="grid-3">
            <div class="card"><div class="card-header"><span class="card-title">🗺️ Áreas de Atuação</span><span class="status-badge info">Geofence</span></div><p>Desenho de polígonos no mapa delimitando onde o app opera e integração de mapas.</p></div>
            <div class="card"><div class="card-header"><span class="card-title">⚠️ Zonas de Risco</span><span class="status-badge blocked">Segurança</span></div><p>Demarcação de perímetros de segurança com aviso sonoro/visual ao motorista antes de aceitar.</p></div>
            <div class="card"><div class="card-header"><span class="card-title">⚙️ Regras de Negócio</span><span class="status-badge pending">Parâmetros</span></div><p>Tempo de cancelamento gratuito, tolerância de espera e limites de inadimplência.</p></div>
          </div>
        `
      },
      {
        id: "sub-6-2",
        order_index: 2,
        slug: "perfil-administrador",
        title: "6.2. Perfil de Administrador: Senha, Limpar Cache e Notificações",
        icon: "🔐",
        lead_text: "No canto superior direito do painel, você encontra os utilitários indispensáveis para segurança e propagação de mudanças.",
        interactive_type: "none",
        content_html: `
          <div class="steps-timeline">
            <div class="step-card"><div class="step-number-badge">🔑</div><div class="step-body"><h4>Alterar Senha do Administrador</h4><p>Mantenha senhas robustas trocadas periodicamente para proteção da base de dados.</p></div></div>
            <div class="step-card"><div class="step-number-badge">🧹</div><div class="step-body"><h4>Limpar Cache do Sistema</h4><p><strong>Atenção:</strong> Sempre que alterar tarifas ou zonas de risco, clique em Limpar Cache para que os apps dos passageiros e motoristas recebam os novos valores imediatamente.</p></div></div>
            <div class="step-card"><div class="step-number-badge">🔔</div><div class="step-body"><h4>Central de Notificações</h4><p>Alertas em tempo real de novos motoristas cadastrados e solicitações de saque pendentes.</p></div></div>
          </div>
        `,
        placeholder_title: "Espaço para Captura de Tela #06 — Menu Avançadas e Perfil do Administrador",
        placeholder_desc: "Insira aqui o print mostrando o menu de Zonas de Risco ou o botão de Limpar Cache do perfil."
      }
    ]
  }
];
