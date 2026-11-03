/* ==========================================================================
   MONITOR ACADEMY — ADMIN JAVASCRIPT LOGIC
   Manages Dynamic Modules, Subtopics & Supabase Sync
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
// LOAD AND RENDER MODULES & SUBTOPICS
// ============================================================================

async function loadAndRenderModules() {
  const listEl = document.getElementById('modulesAdminList');
  if (!listEl) return;

  listEl.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:30px;">Carregando módulos...</div>';

  const { data, source } = await fetchModulesWithSubtopics();
  currentModulesData = data;
  updateDbStatusBadge(source);

  if (!data || data.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:40px; background:var(--bg-card); border-radius:12px; border:1px dashed var(--border-subtle);">
        <p style="color:var(--text-secondary); margin-bottom:14px;">Nenhum módulo cadastrado ainda.</p>
        <button class="btn-primary" onclick="openModuleModal()">+ Criar Primeiro Módulo</button>
      </div>
    `;
    return;
  }

  listEl.innerHTML = data
    .map((mod, idx) => {
      const subCount = (mod.subtopics || []).length;
      const padNum = String(mod.order_index || idx + 1).padStart(2, '0');

      const subtopicsRows = (mod.subtopics || [])
        .map(
          (sub) => `
            <tr>
              <td style="width:50px; font-weight:700; color:var(--brand-gold);">${sub.order_index}</td>
              <td style="font-weight:600; color:var(--text-primary);">
                ${sub.icon || '📌'} ${escapeHtml(sub.title)}
              </td>
              <td style="max-width:280px; font-size:0.8rem; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">
                ${escapeHtml(sub.lead_text || '-')}
              </td>
              <td>
                <span class="status-badge-live ${sub.interactive_type !== 'none' ? '' : 'local'}">
                  ${sub.interactive_type !== 'none' ? '⚡ Interativo' : '📄 Padrão'}
                </span>
              </td>
              <td style="text-align:right;">
                <button class="btn-secondary" style="padding:4px 10px; font-size:0.75rem;" onclick="openSubtopicModal('${mod.id}', '${sub.id}')">Editar</button>
                <button class="btn-danger" style="padding:4px 10px; font-size:0.75rem; margin-left:4px;" onclick="handleDeleteSubtopic('${mod.id}', '${sub.id}')">Excluir</button>
              </td>
            </tr>
          `
        )
        .join('');

      return `
        <div class="module-admin-card" id="card-${mod.id}">
          <div class="module-card-header">
            <div class="module-card-left" onclick="toggleSubtopicsDrawer('${mod.id}')">
              <div class="module-order-badge">${padNum}</div>
              <div class="module-card-title-group">
                <h3>
                  <span>${mod.icon || '📁'}</span>
                  <span>${escapeHtml(mod.title)}</span>
                  <span style="font-size:0.72rem; background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:99px; color:var(--text-muted); font-weight:500;">
                    ${subCount} subtópico(s)
                  </span>
                </h3>
                <p>${escapeHtml(mod.description || 'Sem descrição cadastrada.')}</p>
              </div>
            </div>

            <div class="module-card-actions">
              <button class="btn-secondary" style="font-size:0.8rem; padding:8px 12px;" onclick="openSubtopicModal('${mod.id}')">
                + Novo Subtópico
              </button>
              <button class="btn-secondary" style="font-size:0.8rem; padding:8px 12px;" onclick="openModuleModal('${mod.id}')">
                Editar
              </button>
              <button class="btn-danger" onclick="handleDeleteModule('${mod.id}', '${escapeHtml(mod.title)}')">
                Excluir
              </button>
            </div>
          </div>

          <div class="subtopics-drawer" id="drawer-${mod.id}">
            <div class="subtopics-header">
              <h4>Subtópicos e Aulas de ${escapeHtml(mod.title)}</h4>
              <button class="btn-secondary" style="font-size:0.75rem; padding:4px 10px;" onclick="openSubtopicModal('${mod.id}')">
                + Adicionar Subtópico
              </button>
            </div>

            ${
              subCount > 0
                ? `
                <table class="subtopics-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Título do Subtópico</th>
                      <th>Lead / Descrição</th>
                      <th>Tipo</th>
                      <th style="text-align:right;">Ações</th>
                    </tr>
                  </thead>
                  <tbody>${subtopicsRows}</tbody>
                </table>
              `
                : `<div style="font-size:0.82rem; color:var(--text-muted); padding:10px 0;">Nenhum subtópico cadastrado. Clique no botão acima para adicionar o primeiro!</div>`
            }
          </div>
        </div>
      `;
    })
    .join('');
}

window.toggleSubtopicsDrawer = function (modId) {
  const drawer = document.getElementById(`drawer-${modId}`);
  if (!drawer) return;
  drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
};

// ============================================================================
// MODULE CRUD
// ============================================================================

window.openModuleModal = function (modId = null) {
  const modal = document.getElementById('moduleModal');
  const titleEl = document.getElementById('moduleModalTitle');
  const form = document.getElementById('moduleForm');
  form.reset();

  if (modId) {
    const mod = currentModulesData.find((m) => m.id === modId);
    if (mod) {
      titleEl.textContent = 'Editar Módulo Principal';
      document.getElementById('modId').value = mod.id;
      document.getElementById('modOrder').value = mod.order_index || 1;
      document.getElementById('modIcon').value = mod.icon || '📊';
      document.getElementById('modTitle').value = mod.title || '';
      document.getElementById('modBadge').value = mod.badge_text || '';
      document.getElementById('modReadTime').value = mod.read_time || '5 min';
      document.getElementById('modMascot').value = mod.mascot_image || 'assets/tep-tablet.png';
      document.getElementById('modDescription').value = mod.description || '';
    }
  } else {
    titleEl.textContent = 'Novo Módulo Principal';
    document.getElementById('modId').value = '';
    document.getElementById('modOrder').value = currentModulesData.length + 1;
  }

  modal.classList.add('open');
};

window.closeModuleModal = function () {
  document.getElementById('moduleModal').classList.remove('open');
};

window.handleDeleteModule = async function (modId, title) {
  if (confirm(`Tem certeza que deseja excluir o módulo "${title}" e todos os seus subtópicos?`)) {
    await deleteModule(modId);
    showToast('Módulo excluído com sucesso.');
    await loadAndRenderModules();
  }
};

// ============================================================================
// SUBTOPIC CRUD
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
      titleEl.textContent = 'Editar Subtópico';
      document.getElementById('subId').value = sub.id;
      document.getElementById('subOrder').value = sub.order_index || 1;
      document.getElementById('subIcon').value = sub.icon || '📌';
      document.getElementById('subTitle').value = sub.title || '';
      document.getElementById('subLead').value = sub.lead_text || '';
      document.getElementById('subInteractive').value = sub.interactive_type || 'none';
      document.getElementById('subContentHtml').value = sub.content_html || '';
      document.getElementById('subPlaceholderTitle').value = sub.placeholder_title || '';
      document.getElementById('subPlaceholderDesc').value = sub.placeholder_desc || '';
    }
  } else {
    titleEl.textContent = 'Novo Subtópico';
    document.getElementById('subId').value = '';
    const nextOrder = mod && mod.subtopics ? mod.subtopics.length + 1 : 1;
    document.getElementById('subOrder').value = nextOrder;
  }

  modal.classList.add('open');
};

window.closeSubtopicModal = function () {
  document.getElementById('subtopicModal').classList.remove('open');
};

window.handleDeleteSubtopic = async function (moduleId, subId) {
  if (confirm('Deseja realmente excluir este subtópico?')) {
    await deleteSubtopic(moduleId, subId);
    showToast('Subtópico excluído.');
    await loadAndRenderModules();
  }
};

// ============================================================================
// FORMS SUBMISSION
// ============================================================================

function setupForms() {
  // Module Form
  const moduleForm = document.getElementById('moduleForm');
  if (moduleForm) {
    moduleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: document.getElementById('modId').value || undefined,
        order_index: document.getElementById('modOrder').value,
        icon: document.getElementById('modIcon').value,
        title: document.getElementById('modTitle').value,
        badge_text: document.getElementById('modBadge').value,
        read_time: document.getElementById('modReadTime').value,
        mascot_image: document.getElementById('modMascot').value,
        description: document.getElementById('modDescription').value
      };

      await saveModule(payload);
      closeModuleModal();
      showToast('Módulo salvo com sucesso!');
      await loadAndRenderModules();
    });
  }

  // Subtopic Form
  const subtopicForm = document.getElementById('subtopicForm');
  if (subtopicForm) {
    subtopicForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        id: document.getElementById('subId').value || undefined,
        module_id: document.getElementById('subModuleId').value,
        order_index: document.getElementById('subOrder').value,
        icon: document.getElementById('subIcon').value,
        title: document.getElementById('subTitle').value,
        lead_text: document.getElementById('subLead').value,
        interactive_type: document.getElementById('subInteractive').value,
        content_html: document.getElementById('subContentHtml').value,
        placeholder_title: document.getElementById('subPlaceholderTitle').value,
        placeholder_desc: document.getElementById('subPlaceholderDesc').value
      };

      await saveSubtopic(payload);
      closeSubtopicModal();
      showToast('Subtópico salvo com sucesso!');
      await loadAndRenderModules();
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
    showToast(`🎉 Sincronizado: ${res.modulesCount} módulos e ${res.subtopicsCount} subtópicos salvos no Supabase!`);
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
  const { isConfigured } = getSupabaseConfig();

  if (badge && text) {
    if (isConfigured || source === 'supabase') {
      badge.className = 'status-badge-live';
      text.textContent = 'Conectado: Supabase Cloud';
    } else {
      badge.className = 'status-badge-live local';
      text.textContent = 'Modo Local (LocalStorage Ativo)';
    }
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

