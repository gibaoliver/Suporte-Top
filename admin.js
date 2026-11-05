/* ==========================================================================
   MONITOR ADMIN — TOP TECNOLOGIA
   Gestão Completa de Categorias de Tutoriais e Subtópicos
   Design System: Intercom Style / Help Center Admin
   ========================================================================== */

import {
  checkAdminSession,
  performAdminLogin,
  performAdminLogout,
  fetchModulesWithSubtopics,
  saveModule,
  deleteModule,
  saveSubtopic,
  deleteSubtopic,
  getSupabaseConfig,
  saveSupabaseConfig,
  syncLocalDataToSupabase
} from './supabaseClient.js';

let currentModulesData = [];
let activeSearchQuery = '';

// Default icon mapper
function getDefaultIcon(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('dashboard') || t.includes('visão') || t.includes('visao')) return '📊';
  if (t.includes('usuário') || t.includes('usuario') || t.includes('cliente') || t.includes('motorista')) return '👥';
  if (t.includes('viagen') || t.includes('viagem') || t.includes('opera') || t.includes('mapa') || t.includes('frota')) return '🛵';
  if (t.includes('taxa') || t.includes('financeiro') || t.includes('tarifa') || t.includes('repasse')) return '💰';
  if (t.includes('comunica') || t.includes('relatório') || t.includes('relatorio') || t.includes('mensagem')) return '💬';
  if (t.includes('avançada') || t.includes('avancada') || t.includes('sistema') || t.includes('config')) return '⚙️';
  return '📁';
}

// ============================================================================
// INITIALIZATION & AUTH CHECKS
// ============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  setupAuth();
  setupForms();
  checkAuthAndRender();
});

function checkAuthAndRender() {
  const isLoggedIn = checkAdminSession();
  const loginView = document.getElementById('loginView');
  const dashboardView = document.getElementById('adminDashboardView');

  if (isLoggedIn) {
    if (loginView) loginView.style.display = 'none';
    if (dashboardView) dashboardView.style.display = 'flex';
    loadAndRenderModules();
    updateDbStatusBadge();
  } else {
    if (loginView) loginView.style.display = 'flex';
    if (dashboardView) dashboardView.style.display = 'none';
  }
}

function setupAuth() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('adminUsername').value;
    const pass = document.getElementById('adminPassword').value;

    const res = performAdminLogin(user, pass);
    if (res.success) {
      showToast('Login efetuado com sucesso!');
      checkAuthAndRender();
    } else {
      alert(res.message || 'Credenciais inválidas.');
    }
  });
}

window.handleLogout = function () {
  if (confirm('Deseja realmente sair do painel administrativo?')) {
    performAdminLogout();
    checkAuthAndRender();
  }
};

// ============================================================================
// LOAD AND RENDER CATEGORIES & TUTORIALS
// ============================================================================

async function loadAndRenderModules(filterText = '') {
  const listEl = document.getElementById('modulesAdminList');
  if (!listEl) return;

  if (!filterText) {
    listEl.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:30px;">Carregando categorias de tutoriais...</div>';
    const { data, source } = await fetchModulesWithSubtopics();
    currentModulesData = data || [];
    updateDbStatusBadge(source);
  }

  // Update Stats Counters
  updateAdminStats(currentModulesData);

  // Filter if search query exists
  const query = filterText.toLowerCase().trim();
  const filtered = query
    ? currentModulesData.filter((mod) => {
        const modMatch = (mod.title || '').toLowerCase().includes(query);
        const subMatch = (mod.subtopics || []).some((sub) =>
          (sub.title || '').toLowerCase().includes(query)
        );
        return modMatch || subMatch;
      })
    : currentModulesData;

  if (!filtered || filtered.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:48px; background:var(--bg-card); border-radius:14px; border:1px dashed var(--border-medium);">
        <p style="color:var(--text-secondary); margin-bottom:16px; font-size:1.05rem;">
          ${query ? 'Nenhuma categoria ou tutorial encontrado com esse termo.' : 'Nenhuma categoria cadastrada ainda.'}
        </p>
        <button class="btn-primary" onclick="openModuleModal()">+ Criar Primeira Categoria</button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = filtered
    .map((mod, idx) => {
      const subCount = (mod.subtopics || []).length;
      const padNum = String(mod.order_index || idx + 1).padStart(2, '0');
      const icon = mod.icon || getDefaultIcon(mod.title);

      const subtopicsRows = (mod.subtopics || [])
        .map(
          (sub, sIdx) => `
            <tr>
              <td style="width:50px; font-weight:700; color:var(--brand-gold);">#${sub.order_index || sIdx + 1}</td>
              <td style="font-weight:600; color:var(--text-primary);">
                ${escapeHtml(sub.title)}
              </td>
              <td style="text-align:right; white-space:nowrap;">
                <button class="btn-secondary" style="padding:5px 12px; font-size:0.78rem;" onclick="openSubtopicModal('${mod.id}', '${sub.id}')">Editar</button>
                <button class="btn-danger" style="padding:5px 12px; font-size:0.78rem; margin-left:6px;" onclick="handleDeleteSubtopic('${mod.id}', '${sub.id}')">Excluir</button>
              </td>
            </tr>
          `
        )
        .join('');

      return `
        <div class="category-admin-card" id="card-${mod.id}">
          <div class="category-card-header">
            <div class="category-card-left" onclick="toggleSubtopicsDrawer('${mod.id}')">
              <div class="category-icon-admin">${icon}</div>
              <div class="category-card-title-group">
                <h3>
                  <span>${escapeHtml(mod.title)}</span>
                  <span class="category-order-tag">#${padNum}</span>
                </h3>
                <p>
                  ${subCount} ${subCount === 1 ? 'tutorial cadastrado' : 'tutoriais cadastrados'} • Clique para ${subCount > 0 ? 'expandir' : 'adicionar'}
                </p>
              </div>
            </div>

            <div class="category-card-actions">
              <button class="btn-secondary" style="font-size:0.82rem; padding:8px 14px;" onclick="openSubtopicModal('${mod.id}')">
                + Tutorial
              </button>
              <button class="btn-secondary" style="font-size:0.82rem; padding:8px 14px;" onclick="openModuleModal('${mod.id}')">
                Editar
              </button>
              <button class="btn-danger" style="font-size:0.82rem; padding:8px 14px;" onclick="handleDeleteModule('${mod.id}', '${escapeHtml(mod.title)}')">
                Excluir
              </button>
            </div>
          </div>

          <div class="tutorials-drawer" id="drawer-${mod.id}">
            <div class="tutorials-drawer-header">
              <h4>Tutoriais de ${escapeHtml(mod.title)}</h4>
              <button class="btn-secondary" style="font-size:0.75rem; padding:5px 12px;" onclick="openSubtopicModal('${mod.id}')">
                + Adicionar Tutorial
              </button>
            </div>

            ${
              subCount > 0
                ? `
                <table class="tutorials-table">
                  <thead>
                    <tr>
                      <th style="width:60px;">Ordem</th>
                      <th>Título do Tutorial</th>
                      <th style="text-align:right;">Ações</th>
                    </tr>
                  </thead>
                  <tbody>${subtopicsRows}</tbody>
                </table>
              `
                : `
                <div style="font-size:0.88rem; color:var(--text-muted); padding:16px; background:rgba(255,255,255,0.02); border-radius:8px; border:1px dashed var(--border-subtle); text-align:center;">
                  Nenhum tutorial/subtópico cadastrado nesta categoria.<br/>
                  <button class="btn-secondary" style="margin-top:10px; font-size:0.78rem;" onclick="openSubtopicModal('${mod.id}')">
                    + Cadastrar Primeiro Tutorial
                  </button>
                </div>
              `
            }
          </div>
        </div>
      `;
    })
    .join('');
}

function updateAdminStats(modules) {
  const catCountEl = document.getElementById('statCategoriesCount');
  const tutCountEl = document.getElementById('statTutorialsCount');

  if (catCountEl) {
    catCountEl.textContent = modules.length;
  }

  if (tutCountEl) {
    const totalTuts = modules.reduce((sum, mod) => sum + (mod.subtopics || []).length, 0);
    tutCountEl.textContent = totalTuts;
  }
}

window.handleAdminSearch = function (query) {
  activeSearchQuery = query;
  loadAndRenderModules(query);
};

window.toggleSubtopicsDrawer = function (modId) {
  const drawer = document.getElementById(`drawer-${modId}`);
  if (!drawer) return;
  drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
};

// ============================================================================
// CATEGORY CRUD (MODAL & ACTIONS)
// ============================================================================

window.selectEmoji = function (emoji) {
  const input = document.getElementById('modIcon');
  if (input) {
    input.value = emoji;
  }
};

window.openModuleModal = function (modId = null) {
  const modal = document.getElementById('moduleModal');
  const titleEl = document.getElementById('moduleModalTitle');
  const form = document.getElementById('moduleForm');
  form.reset();

  if (modId) {
    const mod = currentModulesData.find((m) => m.id === modId);
    if (mod) {
      titleEl.textContent = 'Editar Categoria';
      document.getElementById('modId').value = mod.id;
      document.getElementById('modTitle').value = mod.title || '';
      document.getElementById('modIcon').value = mod.icon || getDefaultIcon(mod.title);
      document.getElementById('modOrder').value = mod.order_index || 1;
    }
  } else {
    titleEl.textContent = 'Nova Categoria de Tutoriais';
    document.getElementById('modId').value = '';
    document.getElementById('modTitle').value = '';
    document.getElementById('modIcon').value = '📁';
    document.getElementById('modOrder').value = currentModulesData.length + 1;
  }

  modal.classList.add('open');
  setTimeout(() => document.getElementById('modTitle').focus(), 60);
};

window.closeModuleModal = function () {
  document.getElementById('moduleModal').classList.remove('open');
};

window.handleDeleteModule = async function (modId, title) {
  if (confirm(`Tem certeza que deseja excluir a categoria "${title}" e todos os seus tutoriais?`)) {
    await deleteModule(modId);
    showToast('Categoria de tutorial excluída.');
    await loadAndRenderModules(activeSearchQuery);
  }
};

// ============================================================================
// TUTORIAL (SUBTOPIC) CRUD
// ============================================================================

window.openSubtopicModal = function (moduleId, subId = null) {
  const modal = document.getElementById('subtopicModal');
  const titleEl = document.getElementById('subtopicModalTitle');
  const form = document.getElementById('subtopicForm');
  form.reset();

  document.getElementById('subModuleId').value = moduleId;
  const mod = currentModulesData.find((m) => m.id === moduleId);

  if (subId && mod) {
    const sub = (mod.subtopics || []).find((s) => s.id === subId);
    if (sub) {
      titleEl.textContent = 'Editar Tutorial';
      document.getElementById('subId').value = sub.id;
      document.getElementById('subTitle').value = sub.title || '';
      document.getElementById('subOrder').value = sub.order_index || 1;
    }
  } else {
    titleEl.textContent = `Novo Tutorial em "${mod ? mod.title : 'Categoria'}"`;
    document.getElementById('subId').value = '';
    document.getElementById('subTitle').value = '';
    document.getElementById('subOrder').value = mod && mod.subtopics ? mod.subtopics.length + 1 : 1;
  }

  modal.classList.add('open');
  setTimeout(() => document.getElementById('subTitle').focus(), 60);
};

window.closeSubtopicModal = function () {
  document.getElementById('subtopicModal').classList.remove('open');
};

window.handleDeleteSubtopic = async function (moduleId, subId) {
  if (confirm('Deseja realmente excluir este tutorial?')) {
    await deleteSubtopic(moduleId, subId);
    showToast('Tutorial excluído.');
    await loadAndRenderModules(activeSearchQuery);
  }
};

// ============================================================================
// FORMS SUBMISSION
// ============================================================================

function setupForms() {
  // Category Form
  const moduleForm = document.getElementById('moduleForm');
  if (moduleForm) {
    moduleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const modId = document.getElementById('modId').value;
      const title = document.getElementById('modTitle').value.trim();
      const icon = document.getElementById('modIcon').value.trim() || getDefaultIcon(title);
      const order = Number(document.getElementById('modOrder').value) || 1;

      if (!title) return;

      const payload = {
        id: modId || undefined,
        title: title,
        icon: icon,
        order_index: order,
        slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: ''
      };

      await saveModule(payload);
      closeModuleModal();
      showToast('Categoria salva com sucesso!');
      await loadAndRenderModules(activeSearchQuery);
    });
  }

  // Tutorial / Subtopic Form
  const subtopicForm = document.getElementById('subtopicForm');
  if (subtopicForm) {
    subtopicForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const subId = document.getElementById('subId').value;
      const moduleId = document.getElementById('subModuleId').value;
      const title = document.getElementById('subTitle').value.trim();
      const order = Number(document.getElementById('subOrder').value) || 1;

      if (!title) return;

      const payload = {
        id: subId || undefined,
        module_id: moduleId,
        title: title,
        order_index: order,
        slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        content_html: '',
        lead_text: '',
        interactive_type: 'none'
      };

      await saveSubtopic(payload);
      closeSubtopicModal();
      showToast('Tutorial salvo com sucesso!');
      await loadAndRenderModules(activeSearchQuery);
    });
  }

  // Supabase Config Form
  const sbForm = document.getElementById('supabaseConfigForm');
  if (sbForm) {
    sbForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = document.getElementById('sbUrlInput').value;
      const key = document.getElementById('sbKeyInput').value;
      saveSupabaseConfig(url, key);
      showToast('Credenciais do Supabase salvas!');
      closeSupabaseModal();
      await loadAndRenderModules();
    });
  }
}

// ============================================================================
// SUPABASE MODAL & SYNC
// ============================================================================

window.openSupabaseModal = function () {
  const { url, key } = getSupabaseConfig();
  document.getElementById('sbUrlInput').value = url;
  document.getElementById('sbKeyInput').value = key;
  document.getElementById('supabaseModal').classList.add('open');
};

window.closeSupabaseModal = function () {
  document.getElementById('supabaseModal').classList.remove('open');
};

window.handleSyncAllToSupabase = async function () {
  const btn = document.getElementById('btnSyncAll');
  try {
    btn.disabled = true;
    btn.textContent = 'Enviando ao Supabase...';
    const res = await syncLocalDataToSupabase();
    showToast(`🎉 Sincronizado: ${res.modulesCount} categorias e ${res.subtopicsCount} tutoriais salvos no Supabase!`);
    await loadAndRenderModules();
  } catch (err) {
    alert(`Erro ao sincronizar com Supabase: ${err.message}`);
  } finally {
    btn.disabled = false;
    btn.textContent = '📤 Sincronizar Tudo com o Supabase';
  }
};

function updateDbStatusBadge(source = null) {
  const badge = document.getElementById('dbStatusBadge');
  const text = document.getElementById('dbStatusText');
  const statStatus = document.getElementById('statCloudStatus');
  const { isConfigured } = getSupabaseConfig();

  const isConnected = isConfigured || source === 'supabase';

  if (badge && text) {
    if (isConnected) {
      badge.className = 'status-badge-live';
      text.textContent = 'Conectado: Supabase Cloud';
    } else {
      badge.className = 'status-badge-live local';
      text.textContent = 'Modo Local (LocalStorage Ativo)';
    }
  }

  if (statStatus) {
    statStatus.textContent = isConnected ? 'Supabase Nuvem' : 'Local (Offline)';
    statStatus.style.color = isConnected ? 'var(--status-active)' : 'var(--brand-gold)';
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

function showToast(message) {
  const toast = document.getElementById('toastNotice');
  if (!toast) return;
  toast.textContent = message;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 3500);
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
