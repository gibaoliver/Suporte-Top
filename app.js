/* ==========================================================================
   MONITOR ACADEMY — TOP TECNOLOGIA
   Interactive Application Logic (app.js)
   ========================================================================== */

const TOTAL_MODULES = 6;
let currentModule = 'mod-1';
let completedModules = new Set(
  JSON.parse(localStorage.getItem('monitor_completed_modules') || '[]')
);

// Dashboard Top Metrics Mock Data per Category
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

// Switch between the 6 Tutorial Modules
function switchModule(modId) {
  currentModule = modId;

  // Toggle active section
  document.querySelectorAll('.module-section').forEach((sec) => {
    sec.classList.toggle('active', sec.id === modId);
  });

  // Update sidebar buttons and expanded submenu
  document.querySelectorAll('.nav-item').forEach((item) => {
    const isMatch = item.getAttribute('data-mod') === modId;
    item.classList.toggle('expanded', isMatch);
    const btn = item.querySelector('.nav-btn');
    if (btn) btn.classList.toggle('active', isMatch);
  });

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');

  // Scroll to top smoothly
  window.scrollTo({ top: 0, behavior: 'smooth' });
  updateProgressUI();
}

// Mark/Unmark a module as completed
function toggleModuleComplete(modId) {
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
  const count = Math.max(1, completedModules.size);
  const pct = Math.round((completedModules.size / TOTAL_MODULES) * 100);
  const progressText = document.getElementById('progressText');
  const progressBarFill = document.getElementById('progressBarFill');

  if (progressText) {
    progressText.textContent = `${completedModules.size}/${TOTAL_MODULES} Concluídos`;
  }
  if (progressBarFill) {
    progressBarFill.style.width = `${Math.max(12, pct)}%`;
  }

  for (let i = 1; i <= TOTAL_MODULES; i++) {
    const id = `mod-${i}`;
    const isDone = completedModules.has(id);
    const navItem = document.querySelector(`.nav-item[data-mod="${id}"] .nav-btn`);
    if (navItem) {
      navItem.classList.toggle('completed', isDone);
    }
    const btnComplete = document.getElementById(`btn-complete-${id}`);
    if (btnComplete) {
      btnComplete.classList.toggle('is-done', isDone);
      btnComplete.innerHTML = isDone
        ? `✅ Módulo 0${i} Concluído!`
        : `✓ Marcar Módulo 0${i} como Concluído`;
    }
  }
}

// Simulator 1: Dashboard Driver Categories & Statuses
function selectDriverCategory(catKey, btnEl) {
  selectedCatKey = catKey;
  document.querySelectorAll('#driverCategoryTabs .cat-tab').forEach((b) => {
    b.classList.remove('active');
  });
  if (btnEl) btnEl.classList.add('active');

  const data = driverCategoryData[catKey];
  document.getElementById('simDriverTotal').textContent = data.total;
  document.getElementById('simDriverActive').textContent = data.ativos;
  document.getElementById('simDriverPending').textContent = data.pendentes;
  document.getElementById('simDriverBlocked').textContent = data.bloqueados;

  const explainer = document.getElementById('driverSimulatorExplainer');
  if (explainer) {
    explainer.innerHTML = data.descriptions[selectedStatusKey];
  }
}

function explainDriverStatus(statusKey, tileEl) {
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

// Simulator 2: KYC Driver Approval Checklist
function updateKycSimulator() {
  const checks = document.querySelectorAll('.kyc-check');
  let checkedCount = 0;
  checks.forEach((c) => {
    if (c.checked) checkedCount++;
  });

  const badge = document.getElementById('kycStatusBadge');
  const result = document.getElementById('kycSimulatorResult');

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

// Simulator 3: Real-Time Monitoring Map Legend
function filterRadarMap(type, btnEl) {
  const parent = btnEl.parentElement;
  parent.querySelectorAll('.cat-tab').forEach((b) => b.classList.remove('active'));
  btnEl.classList.add('active');

  const explainer = document.getElementById('radarMapExplainer');
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

// Simulator 4: Live Fare & App Fee Calculator
function formatBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function recalcFare() {
  const base = parseFloat(document.getElementById('rngBaseFare').value);
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

// Interactive Screenshot Placeholder Preview
function previewScreenshot(inputEl) {
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

  const keywordMap = [
    { keys: ['dashboard', 'particular', 'mulher', 'mototaxista', 'ranking', 'metricas', 'topo'], mod: 'mod-1' },
    { keys: ['cliente', 'passageiro', 'motorista', 'cnh', 'documento', 'pendente', 'exclusao', 'pf', 'pj'], mod: 'mod-2' },
    { keys: ['mapa', 'monitoramento', 'viagem', 'delivery', 'entrega', 'grupo', 'chamado', 'rota'], mod: 'mod-3' },
    { keys: ['financeiro', 'taxa', 'tarifa', 'km', 'minuto', 'repasse', 'comissao', 'extrato'], mod: 'mod-4' },
    { keys: ['mensagem', 'fale conosco', 'suporte', 'relatorio', 'push', 'ticket'], mod: 'mod-5' },
    { keys: ['avancada', 'zona', 'risco', 'cache', 'senha', 'perfil', 'tep', 'top'], mod: 'mod-6' }
  ];

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim().toLowerCase();
      if (!q) return;

      for (const entry of keywordMap) {
        if (entry.keys.some((k) => q.includes(k))) {
          switchModule(entry.mod);
          searchInput.blur();
          return;
        }
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

// Theme Toggle (Dark / Light)
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

// Mobile Sidebar Drawer
function setupMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!btn || !sidebar) return;

  btn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });
}

// Expose functions globally for HTML event attributes
window.switchModule = switchModule;
window.toggleModuleComplete = toggleModuleComplete;
window.selectDriverCategory = selectDriverCategory;
window.explainDriverStatus = explainDriverStatus;
window.updateKycSimulator = updateKycSimulator;
window.filterRadarMap = filterRadarMap;
window.recalcFare = recalcFare;
window.previewScreenshot = previewScreenshot;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  updateProgressUI();
  recalcFare();
  setupSearchAndShortcuts();
  setupThemeToggle();
  setupMobileMenu();
});

