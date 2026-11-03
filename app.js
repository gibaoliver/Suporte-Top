/* ==========================================================================
   MONITOR ACADEMY — TOP TECNOLOGIA
   Dynamic Public Site Application Logic (app.js)
   Powered by Supabase & LocalStorage Data Engine
   ========================================================================== */

import { fetchModulesWithSubtopics } from './supabaseClient.js';

let loadedModules = [];
let currentModuleId = null;
let completedModules = new Set(
  JSON.parse(localStorage.getItem('monitor_completed_modules') || '[]')
);

// Interactive Mock Data for Dashboard Top Metrics
const driverCategoryData = {
  particular: {
    name: 'Particular',
    total: 428,
    ativos: 382,
    pendentes: 31,
    bloqueados: 15,
    descriptions: {
      total:
        '<strong>💡 Como interpretar (Particular — Visão Total):</strong> Soma de todos os motoristas de automóvel padrão cadastrados na base. Use como termômetro de expansão da frota na cidade.',
      ativos:
        '<strong>✅ Motoristas Ativos (Particular):</strong> Condutores com CNH/CRLV validados e liberados para ficar online e receber chamadas imediatamente.',
      pendentes:
        '<strong>⏳ Motoristas Pendentes (Particular):</strong> Cadastros aguardando conferência de documentos pelo gestor. Clique neste indicador no Monitor para abrir a fila de aprovação!',
      bloqueados:
        '<strong>⛔ Motoristas Bloqueados (Particular):</strong> Contas suspensas por pendência financeira, documento vencido ou infração às regras da plataforma.'
    }
  },
  mulher: {
    name: 'Motorista Mulher',
    total: 94,
    ativos: 86,
    pendentes: 6,
    bloqueados: 2,
    descriptions: {
      total:
        '<strong>💡 Como interpretar (Motorista Mulher — Visão Total):</strong> Condutoras habilitadas para atender tanto a categoria exclusiva para passageiras quanto corridas gerais.',
      ativos:
        '<strong>✅ Motoristas Ativas (Categoria Mulher):</strong> Condutoras homologadas e prontas para atender chamadas prioritárias de passageiras.',
      pendentes:
        '<strong>⏳ Pendentes (Categoria Mulher):</strong> Priorize a análise documental desta fila para garantir cobertura em todos os bairros nos horários de pico.',
      bloqueados:
        '<strong>⛔ Bloqueadas (Categoria Mulher):</strong> Condutoras temporariamente inativas ou com documentação aguardando renovação.'
    }
  },
  moto: {
    name: 'Mototaxista',
    total: 215,
    ativos: 194,
    pendentes: 14,
    bloqueados: 7,
    descriptions: {
      total:
        '<strong>💡 Como interpretar (Mototaxista — Visão Total):</strong> Frota de transporte rápido de passageiros em duas rodas — alta demanda em horários de pico comercial.',
      ativos:
        '<strong>✅ Mototaxistas Ativos:</strong> Condutores com CNH categoria "A" com EAR e exigências de segurança (2 capacetes) devidamente aprovadas.',
      pendentes:
        '<strong>⏳ Mototaxistas Pendentes:</strong> Verifique atentamente o ano da motocicleta e a observação EAR antes de aprovar.',
      bloqueados:
        '<strong>⛔ Mototaxistas Bloqueados:</strong> Condutores suspensos por saldo devedor de comissão ou documentação expirada.'
    }
  },
  delivery: {
    name: 'Moto Delivery',
    total: 162,
    ativos: 149,
    pendentes: 9,
    bloqueados: 4,
    descriptions: {
      total:
        '<strong>💡 Como interpretar (Moto Delivery — Visão Total):</strong> Entregadores habilitados para coleta e envio de encomendas, documentos e pacotes.',
      ativos:
        '<strong>✅ Entregadores Ativos:</strong> Motoboys aptos a receber chamados de entrega expressa e rotas com múltiplas paradas.',
      pendentes:
        '<strong>⏳ Entregadores Pendentes:</strong> Confira se o condutor possui baú/bag regulamentado conforme o padrão operacional.',
      bloqueados:
        '<strong>⛔ Entregadores Bloqueados:</strong> Contas restritas preventivamente pela auditoria operacional.'
    }
  }
};

let selectedCatKey = 'particular';
let selectedStatusKey = 'total';

// ============================================================================
// DYNAMIC CURRICULUM RENDERER
// ============================================================================

async function initCurriculum() {
  const { data } = await fetchModulesWithSubtopics();
  loadedModules = data || [];

  if (loadedModules.length === 0) return;

  renderSidebar(loadedModules);
  renderContent(loadedModules);

  // Set initial active module
  const initialMod = loadedModules[0].id;
  switchModule(initialMod);

  // Re-attach interactive components
  recalcFare();
}

function renderSidebar(modules) {
  const navList = document.getElementById('moduleNavList');
  const sectionLabel = document.getElementById('sidebarSectionLabel');
  if (!navList) return;

  if (sectionLabel) {
    sectionLabel.textContent = `Trilha do Gestor • ${modules.length} Módulos`;
  }

  navList.innerHTML = modules
    .map((mod, idx) => {
      const padNum = String(mod.order_index || idx + 1).padStart(2, '0');
      const isCompleted = completedModules.has(mod.id);

      const subLinks = (mod.subtopics || [])
        .map(
          (sub) => `
            <li>
              <a href="#sec-${mod.id}-${sub.id}" class="sub-nav-link" onclick="scrollToSubtopic('${mod.id}', 'sec-${mod.id}-${sub.id}'); return false;">
                ${escapeHtml(sub.title)}
              </a>
            </li>
          `
        )
        .join('');

      return `
        <li class="nav-item ${idx === 0 ? 'expanded' : ''}" data-mod="${mod.id}">
          <button class="nav-btn ${idx === 0 ? 'active' : ''} ${isCompleted ? 'completed' : ''}" onclick="switchModule('${mod.id}')">
            <span class="nav-btn-left">
              <span class="nav-step-num">${padNum}</span>
              <span>${escapeHtml(mod.title)}</span>
            </span>
            <span class="nav-check" id="check-${mod.id}">✓</span>
          </button>
          ${
            subLinks
              ? `<ul class="sub-nav-list">${subLinks}</ul>`
              : ''
          }
        </li>
      `;
    })
    .join('');
}

function renderContent(modules) {
  const container = document.getElementById('contentContainer');
  if (!container) return;

  container.innerHTML = modules
    .map((mod, modIdx) => {
      const prevMod = modIdx > 0 ? modules[modIdx - 1] : null;
      const nextMod = modIdx < modules.length - 1 ? modules[modIdx + 1] : null;

      const subtopicsHtml = (mod.subtopics || [])
        .map((sub) => {
          let interactiveHtml = '';
          if (sub.interactive_type === 'simulator_kpi') {
            interactiveHtml = getKpiSimulatorHtml();
          } else if (sub.interactive_type === 'kyc_checklist') {
            interactiveHtml = getKycChecklistHtml();
          } else if (sub.interactive_type === 'radar_map') {
            interactiveHtml = getRadarMapHtml();
          } else if (sub.interactive_type === 'calc_fare') {
            interactiveHtml = getCalcFareHtml();
          }

          let placeholderHtml = '';
          if (sub.placeholder_title) {
            placeholderHtml = `
              <div class="screenshot-placeholder">
                <div class="placeholder-header">
                  🖼️ ${escapeHtml(sub.placeholder_title)}
                </div>
                <p class="placeholder-desc">
                  ${escapeHtml(sub.placeholder_desc || 'Insira aqui a captura de tela correspondente do seu sistema Monitor:')}
                </p>
                <label class="placeholder-btn">
                  📤 Carregar Print do Monitor
                  <input type="file" accept="image/*" hidden onchange="previewScreenshot(this)" />
                </label>
                <img class="placeholder-preview-img" alt="Preview da Captura" />
              </div>
            `;
          }

          let tipHtml = '';
          if (sub.tip_title && sub.tip_content) {
            tipHtml = `
              <div class="tep-tip-box">
                <img src="${sub.tip_mascot || 'assets/tep-rocket.png'}" alt="Mascote Tep" />
                <div class="tep-tip-content">
                  <h5>${escapeHtml(sub.tip_title)}</h5>
                  <p>${escapeHtml(sub.tip_content)}</p>
                </div>
              </div>
            `;
          }

          return `
            <div class="doc-block" id="sec-${mod.id}-${sub.id}">
              <div class="doc-block-header">
                <h2 class="doc-block-title">
                  <span class="title-accent-icon">${sub.icon || '📌'}</span>
                  ${escapeHtml(sub.title)}
                </h2>
              </div>
              ${
                sub.lead_text
                  ? `<p class="doc-lead">${escapeHtml(sub.lead_text)}</p>`
                  : ''
              }
              ${sub.content_html || ''}
              ${interactiveHtml}
              ${placeholderHtml}
              ${tipHtml}
            </div>
          `;
        })
        .join('');

      return `
        <section class="module-section ${modIdx === 0 ? 'active' : ''}" id="${mod.id}">
          <div class="module-hero">
            <div class="module-hero-text">
              <div class="breadcrumb-pill">${escapeHtml(mod.badge_text || 'Módulo ' + (modIdx + 1))}</div>
              <h1>${escapeHtml(mod.title)}</h1>
              <p>${escapeHtml(mod.description || '')}</p>
              <div class="hero-meta-tags">
                <span class="meta-tag">⏱️ Leitura: ${escapeHtml(mod.read_time || '5 min')}</span>
                <span class="meta-tag">🎯 Público: ${escapeHtml(mod.target_audience || 'Gestores')}</span>
                <span class="meta-tag">⚡ Interativo</span>
              </div>
            </div>
            <div class="module-hero-art">
              <img src="${mod.mascot_image || 'assets/tep-tablet.png'}" alt="Mascote Tep" />
            </div>
          </div>

          ${subtopicsHtml}

          <div class="module-footer-nav">
            ${
              prevMod
                ? `<button class="nav-card-btn" onclick="switchModule('${prevMod.id}')">
                    <small>← Módulo Anterior</small>
                    <span>${escapeHtml(prevMod.title)}</span>
                   </button>`
                : `<div></div>`
            }
            <button class="complete-module-btn" id="btn-complete-${mod.id}" onclick="toggleModuleComplete('${mod.id}')">
              ${completedModules.has(mod.id) ? '✅ Módulo Concluído!' : '✓ Marcar como Concluído'}
            </button>
            ${
              nextMod
                ? `<button class="nav-card-btn" onclick="switchModule('${nextMod.id}')">
                    <small>Próximo Módulo →</small>
                    <span>${escapeHtml(nextMod.title)}</span>
                   </button>`
                : `<button class="nav-card-btn" onclick="switchModule('${modules[0].id}')">
                    <small>Voltar ao Início ↺</small>
                    <span>${escapeHtml(modules[0].title)}</span>
                   </button>`
            }
          </div>
        </section>
      `;
    })
    .join('');
}

// ============================================================================
// INTERACTIVE COMPONENT TEMPLATES
// ============================================================================

function getKpiSimulatorHtml() {
  return `
    <div class="simulator-box">
      <div class="simulator-topbar">
        <div class="simulator-label">
          <span class="pulse-dot"></span>
          Simulador Interativo — Topo do Dashboard Monitor
        </div>
        <div class="category-tabs" id="driverCategoryTabs">
          <button class="cat-tab active" onclick="selectDriverCategory('particular', this)">🚗 Particular</button>
          <button class="cat-tab" onclick="selectDriverCategory('mulher', this)">👩 Motorista Mulher</button>
          <button class="cat-tab" onclick="selectDriverCategory('moto', this)">🏍️ Mototaxista</button>
          <button class="cat-tab" onclick="selectDriverCategory('delivery', this)">📦 Moto Delivery</button>
        </div>
      </div>

      <div class="kpi-status-grid">
        <div class="kpi-tile selected" onclick="explainDriverStatus('total', this)">
          <div class="kpi-tile-top">
            <span>Total na Categoria</span>
            <span class="status-badge info">Frota Cadastrada</span>
          </div>
          <div class="kpi-number" id="simDriverTotal">428</div>
        </div>

        <div class="kpi-tile" onclick="explainDriverStatus('ativos', this)">
          <div class="kpi-tile-top">
            <span>Motoristas Ativos</span>
            <span class="status-badge active">● Liberados</span>
          </div>
          <div class="kpi-number" id="simDriverActive">382</div>
        </div>

        <div class="kpi-tile" onclick="explainDriverStatus('pendentes', this)">
          <div class="kpi-tile-top">
            <span>Pendentes de Análise</span>
            <span class="status-badge pending">⏳ Fila KYC</span>
          </div>
          <div class="kpi-number" id="simDriverPending">31</div>
        </div>

        <div class="kpi-tile" onclick="explainDriverStatus('bloqueados', this)">
          <div class="kpi-tile-top">
            <span>Bloqueados / Inativos</span>
            <span class="status-badge blocked">⛔ Restritos</span>
          </div>
          <div class="kpi-number" id="simDriverBlocked">15</div>
        </div>
      </div>

      <div class="simulator-explainer" id="driverSimulatorExplainer">
        <strong>💡 Como interpretar (Particular — Visão Total):</strong> Soma de todos os motoristas de automóvel padrão cadastrados na base. Use como termômetro de expansão da frota na cidade.
      </div>
    </div>
  `;
}

function getKycChecklistHtml() {
  return `
    <div class="simulator-box">
      <div class="simulator-topbar">
        <div class="simulator-label">
          <span class="pulse-dot"></span>
          Checklist Interativo de Homologação de Motorista (Treinamento)
        </div>
        <span class="status-badge pending" id="kycStatusBadge">⏳ Aguardando Conferência (0/4)</span>
      </div>

      <div class="grid-2" style="margin-bottom: 16px;">
        <label class="kpi-tile" style="display:flex; align-items:center; gap:12px;">
          <input type="checkbox" class="kyc-check" onchange="updateKycSimulator()" style="width:18px; height:18px; accent-color: var(--brand-gold);" />
          <div>
            <strong style="display:block; font-size:0.9rem;">1. CNH Válida com EAR</strong>
            <span style="font-size:0.78rem; color:#a8a8b8;">Dentro da validade e com "Exerce Atividade Remunerada".</span>
          </div>
        </label>

        <label class="kpi-tile" style="display:flex; align-items:center; gap:12px;">
          <input type="checkbox" class="kyc-check" onchange="updateKycSimulator()" style="width:18px; height:18px; accent-color: var(--brand-gold);" />
          <div>
            <strong style="display:block; font-size:0.9rem;">2. CRLV e Ano Mínimo do Veículo</strong>
            <span style="font-size:0.78rem; color:#a8a8b8;">Placa confere com o cadastro e licenciamento em dia.</span>
          </div>
        </label>

        <label class="kpi-tile" style="display:flex; align-items:center; gap:12px;">
          <input type="checkbox" class="kyc-check" onchange="updateKycSimulator()" style="width:18px; height:18px; accent-color: var(--brand-gold);" />
          <div>
            <strong style="display:block; font-size:0.9rem;">3. Selfie & Antecedentes Criminais</strong>
            <span style="font-size:0.78rem; color:#a8a8b8;">Rosto nítido compatível com a CNH e nada consta validado.</span>
          </div>
        </label>

        <label class="kpi-tile" style="display:flex; align-items:center; gap:12px;">
          <input type="checkbox" class="kyc-check" onchange="updateKycSimulator()" style="width:18px; height:18px; accent-color: var(--brand-gold);" />
          <div>
            <strong style="display:block; font-size:0.9rem;">4. Categoria & Dados Bancários/PIX</strong>
            <span style="font-size:0.78rem; color:#a8a8b8;">Categoria atribuída (Particular/Mulher/Moto) e chave PIX titular.</span>
          </div>
        </label>
      </div>

      <div class="simulator-explainer" id="kycSimulatorResult">
        Marque os 4 itens de verificação acima para simular a liberação do motorista no painel Monitor.
      </div>
    </div>
  `;
}

function getRadarMapHtml() {
  return `
    <div class="simulator-box">
      <div class="simulator-topbar">
        <div class="simulator-label">
          <span class="pulse-dot"></span>
          Legenda Interativa da Tela de Monitoramento (Clique para filtrar)
        </div>
        <div class="category-tabs">
          <button class="cat-tab active" onclick="filterRadarMap('todos', this)">🌐 Todos no Mapa (48)</button>
          <button class="cat-tab" onclick="filterRadarMap('livres', this)">🟢 Livres / Online (32)</button>
          <button class="cat-tab" onclick="filterRadarMap('ocupados', this)">🟡 Em Corrida (14)</button>
          <button class="cat-tab" onclick="filterRadarMap('alerta', this)">🔴 Sem Sinal GPS (2)</button>
        </div>
      </div>

      <div class="simulator-explainer" id="radarMapExplainer">
        <strong>📍 Visão Geral do Mapa:</strong> Ao clicar sobre o ícone de qualquer veículo no mapa do Monitor, uma janela flutuante exibe o <strong>Nome do Motorista</strong>, <strong>Placa/Modelo</strong>, <strong>Telefone</strong>, <strong>Nível de Bateria do Celular</strong> e o link direto para a corrida atual.
      </div>
    </div>
  `;
}

function getCalcFareHtml() {
  return `
    <div class="simulator-box">
      <div class="simulator-topbar">
        <div class="simulator-label">
          <span class="pulse-dot"></span>
          Simulador de Precificação — Menu Avançadas &gt; Configurações
        </div>
        <span class="status-badge active">Simulação Instantânea</span>
      </div>

      <div class="calc-grid">
        <div class="calc-controls">
          <div class="input-group">
            <label>
              <span>Tarifa Base (Bandeirada)</span>
              <strong id="lblBaseFare" style="color:var(--brand-gold);">R$ 4,50</strong>
            </label>
            <input type="range" id="rngBaseFare" min="2" max="12" step="0.5" value="4.5" oninput="recalcFare()" />
          </div>

          <div class="input-group">
            <label>
              <span>Valor por KM (R$/km)</span>
              <strong id="lblPerKm" style="color:var(--brand-gold);">R$ 1,80</strong>
            </label>
            <input type="range" id="rngPerKm" min="0.8" max="4.5" step="0.1" value="1.8" oninput="recalcFare()" />
          </div>

          <div class="input-group">
            <label>
              <span>Valor por Minuto (R$/min)</span>
              <strong id="lblPerMin" style="color:var(--brand-gold);">R$ 0,30</strong>
            </label>
            <input type="range" id="rngPerMin" min="0.1" max="1.2" step="0.05" value="0.3" oninput="recalcFare()" />
          </div>

          <div class="input-group">
            <label>
              <span>Taxa do Aplicativo (% Comissão)</span>
              <strong id="lblAppFee" style="color:var(--brand-gold);">15%</strong>
            </label>
            <input type="range" id="rngAppFee" min="5" max="30" step="1" value="15" oninput="recalcFare()" />
          </div>
        </div>

        <div class="calc-result-box">
          <div>
            <div style="font-size:0.78rem; text-transform:uppercase; letter-spacing:0.06em; color:var(--brand-gold); font-weight:700; margin-bottom:10px;">
              Exemplo: Corrida de 8 KM e 15 Minutos
            </div>
            <div class="calc-row">
              <span>Tarifa Base:</span>
              <strong id="resBase">R$ 4,50</strong>
            </div>
            <div class="calc-row">
              <span>Distância (8 km):</span>
              <strong id="resKm">R$ 14,40</strong>
            </div>
            <div class="calc-row">
              <span>Tempo (15 min):</span>
              <strong id="resMin">R$ 4,50</strong>
            </div>
            <div class="calc-row">
              <span>Receita da Plataforma (Taxa App):</span>
              <strong id="resPlatform" style="color:var(--status-info);">R$ 3,51</strong>
            </div>
            <div class="calc-row">
              <span>Repasse Líquido do Motorista:</span>
              <strong id="resDriver" style="color:var(--status-active);">R$ 19,89</strong>
            </div>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:baseline; padding-top:12px;">
            <span style="font-size:0.86rem; color:#c8c8d4;">Valor Total ao Passageiro:</span>
            <span class="calc-total" id="resTotal">R$ 23,40</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ============================================================================
// NAVIGATION & PROGRESS LOGIC
// ============================================================================

export function switchModule(modId) {
  currentModuleId = modId;

  document.querySelectorAll('.module-section').forEach((sec) => {
    sec.classList.toggle('active', sec.id === modId);
  });

  document.querySelectorAll('.nav-item').forEach((item) => {
    const isMatch = item.getAttribute('data-mod') === modId;
    item.classList.toggle('expanded', isMatch);
    const btn = item.querySelector('.nav-btn');
    if (btn) btn.classList.toggle('active', isMatch);
  });

  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');

  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateProgressUI();
}

export function scrollToSubtopic(modId, elementId) {
  switchModule(modId);
  setTimeout(() => {
    const el = document.getElementById(elementId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, 100);
}

export function toggleModuleComplete(modId) {
  if (completedModules.has(modId)) {
    completedModules.delete(modId);
  } else {
    completedModules.add(modId);
  }
  localStorage.setItem(
    'monitor_completed_modules',
    JSON.stringify(Array.from(completedModules))
  );
  updateProgressUI();
}

function updateProgressUI() {
  const total = loadedModules.length || 6;
  const count = completedModules.size;
  const pct = Math.round((count / total) * 100);

  const progressText = document.getElementById('progressText');
  const progressBarFill = document.getElementById('progressBarFill');

  if (progressText) {
    progressText.textContent = `${count}/${total} Concluídos`;
  }
  if (progressBarFill) {
    progressBarFill.style.width = `${Math.max(10, pct)}%`;
  }

  loadedModules.forEach((m) => {
    const isDone = completedModules.has(m.id);
    const navItemBtn = document.querySelector(`.nav-item[data-mod="${m.id}"] .nav-btn`);
    if (navItemBtn) {
      navItemBtn.classList.toggle('completed', isDone);
    }
    const btnComplete = document.getElementById(`btn-complete-${m.id}`);
    if (btnComplete) {
      btnComplete.classList.toggle('is-done', isDone);
      btnComplete.innerHTML = isDone
        ? '✅ Módulo Concluído!'
        : '✓ Marcar como Concluído';
    }
  });
}

// ============================================================================
// SIMULATOR HANDLERS
// ============================================================================

export function selectDriverCategory(catKey, btnEl) {
  selectedCatKey = catKey;
  document.querySelectorAll('#driverCategoryTabs .cat-tab').forEach((b) => {
    b.classList.remove('active');
  });
  if (btnEl) btnEl.classList.add('active');

  const data = driverCategoryData[catKey];
  const t = document.getElementById('simDriverTotal');
  const a = document.getElementById('simDriverActive');
  const p = document.getElementById('simDriverPending');
  const b = document.getElementById('simDriverBlocked');

  if (t) t.textContent = data.total;
  if (a) a.textContent = data.ativos;
  if (p) p.textContent = data.pendentes;
  if (b) b.textContent = data.bloqueados;

  const explainer = document.getElementById('driverSimulatorExplainer');
  if (explainer) {
    explainer.innerHTML = data.descriptions[selectedStatusKey];
  }
}

export function explainDriverStatus(statusKey, tileEl) {
  selectedStatusKey = statusKey;
  const container = tileEl.parentElement;
  container.querySelectorAll('.kpi-tile').forEach((t) => t.classList.remove('selected'));
  tileEl.classList.add('selected');

  const data = driverCategoryData[selectedCatKey];
  const explainer = document.getElementById('driverSimulatorExplainer');
  if (explainer && data) {
    explainer.innerHTML = data.descriptions[statusKey];
  }
}

export function updateKycSimulator() {
  const checks = document.querySelectorAll('.kyc-check');
  let checkedCount = 0;
  checks.forEach((c) => {
    if (c.checked) checkedCount++;
  });

  const badge = document.getElementById('kycStatusBadge');
  const result = document.getElementById('kycSimulatorResult');

  if (!badge || !result) return;

  if (checkedCount === 4) {
    badge.className = 'status-badge active';
    badge.textContent = '✅ Homologado (4/4) — Pronto para Ativar!';
    result.innerHTML =
      '<strong>🎉 Motorista Aprovado com Sucesso!</strong> Todos os 4 requisitos de compliance estão validados. No Monitor, basta clicar no botão <strong>"Aprovar / Ativar Motorista"</strong> para que ele passe do status <em>Pendente</em> para <em>Ativo</em> imediatamente.';
  } else {
    badge.className = 'status-badge pending';
    badge.textContent = `⏳ Em Conferência (${checkedCount}/4)`;
    result.innerHTML = `Faltam <strong>${4 - checkedCount} requisito(s)</strong> para concluir a homologação. Lembre-se: nunca ative um condutor com CNH vencida ou sem conferência da placa no CRLV.`;
  }
}

export function filterRadarMap(type, btnEl) {
  const parent = btnEl.parentElement;
  parent.querySelectorAll('.cat-tab').forEach((b) => b.classList.remove('active'));
  btnEl.classList.add('active');

  const explainer = document.getElementById('radarMapExplainer');
  if (!explainer) return;

  const messages = {
    todos:
      '<strong>📍 Visão Geral do Mapa (48 veículos):</strong> Exibe simultaneamente toda a frota conectada. Clique em qualquer veículo para ver placa, telefone, bateria e histórico de GPS.',
    livres:
      '<strong>🟢 Motoristas Livres / Online (32 veículos):</strong> Condutores com aplicativo aberto aguardando chamado. Use esta visão para verificar se há cobertura suficiente nos bairros centrais.',
    ocupados:
      '<strong>🟡 Motoristas em Corrida (14 veículos):</strong> Condutores em deslocamento até o passageiro ou realizando uma viagem/entrega neste momento. Você pode acompanhar a rota ao vivo.',
    alerta:
      '<strong>🔴 Sem Sinal GPS / Alerta (2 veículos):</strong> Condutores cujo aparelho parou de enviar pacotes de localização há mais de 3 minutos (possível queda de internet ou aplicativo em segundo plano).'
  };
  explainer.innerHTML = messages[type] || messages.todos;
}

export function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function recalcFare() {
  const baseEl = document.getElementById('rngBaseFare');
  if (!baseEl) return;

  const base = parseFloat(baseEl.value);
  const perKm = parseFloat(document.getElementById('rngPerKm').value);
  const perMin = parseFloat(document.getElementById('rngPerMin').value);
  const appFeePct = parseFloat(document.getElementById('rngAppFee').value);

  document.getElementById('lblBaseFare').textContent = formatBRL(base);
  document.getElementById('lblPerKm').textContent = formatBRL(perKm);
  document.getElementById('lblPerMin').textContent = formatBRL(perMin);
  document.getElementById('lblAppFee').textContent = `${appFeePct}%`;

  const distKm = 8;
  const durationMin = 15;
  const costKm = distKm * perKm;
  const costMin = durationMin * perMin;
  const totalRide = base + costKm + costMin;
  const platformFee = totalRide * (appFeePct / 100);
  const driverNet = totalRide - platformFee;

  document.getElementById('resBase').textContent = formatBRL(base);
  document.getElementById('resKm').textContent = formatBRL(costKm);
  document.getElementById('resMin').textContent = formatBRL(costMin);
  document.getElementById('resPlatform').textContent = `${formatBRL(platformFee)} (${appFeePct}%)`;
  document.getElementById('resDriver').textContent = formatBRL(driverNet);
  document.getElementById('resTotal').textContent = formatBRL(totalRide);
}

export function previewScreenshot(inputEl) {
  const file = inputEl.files && inputEl.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (e) {
    const container = inputEl.closest('.screenshot-placeholder');
    const img = container.querySelector('.placeholder-preview-img');
    if (img) {
      img.src = e.target.result;
      img.style.display = 'block';
    }
  };
  reader.readAsDataURL(file);
}

// Global Search & Keyboard Shortcut (Ctrl+K)
function setupSearchAndShortcuts() {
  const searchInput = document.getElementById('globalSearchInput');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return;

      const foundMod = loadedModules.find(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.subtopics || []).some((s) => s.title.toLowerCase().includes(q))
      );

      if (foundMod) {
        switchModule(foundMod.id);
        searchInput.blur();
      }
    }
  });

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      searchInput.focus();
    }
  });
}

function setupThemeToggle() {
  const btn = document.getElementById('themeToggleBtn');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
  });
}

function setupMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Expose functions globally for HTML event attributes
window.switchModule = switchModule;
window.scrollToSubtopic = scrollToSubtopic;
window.toggleModuleComplete = toggleModuleComplete;
window.selectDriverCategory = selectDriverCategory;
window.explainDriverStatus = explainDriverStatus;
window.updateKycSimulator = updateKycSimulator;
window.filterRadarMap = filterRadarMap;
window.recalcFare = recalcFare;
window.previewScreenshot = previewScreenshot;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initCurriculum();
  setupSearchAndShortcuts();
  setupThemeToggle();
  setupMobileMenu();
});
