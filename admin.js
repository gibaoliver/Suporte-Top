/* ==========================================================================
   MONITOR ACADEMY — ADMIN JAVASCRIPT LOGIC
   Gestão Simplificada: Somente Nome da Categoria e Subcategoria
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
// LOAD AND RENDER CATEGORIAS & SUBCATEGORIAS
// ============================================================================

async function loadAndRenderModules() {
  const listEl = document.getElementById('modulesAdminList');
  if (!listEl) return;

  listEl.innerHTML = '<div style="color:var(--text-muted); text-align:center; padding:30px;">Carregando categorias...</div>';

  const { data, source } = await fetchModulesWithSubtopics();
  currentModulesData = data || [];
  updateDbStatusBadge(source);

  if (!data || data.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center; padding:40px; background:var(--bg-card); border-radius:12px; border:1px dashed var(--border-subtle);">
        <p style="color:var(--text-secondary); margin-bottom:14px;">Nenhuma categoria cadastrada ainda.</p>
        <button class="btn-primary" onclick="openModuleModal()">+ Criar Primeira Categoria</button>
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
          (sub, sIdx) => `
            <tr>
              <td style="width:50px; font-weight:700; color:var(--brand-gold);">${sIdx + 1}</td>
              <td style="font-weight:600; color:var(--text-primary);">
                ${escapeHtml(sub.title)}
              </td>
              <td style="text-align:right;">
                <button class="btn-secondary" style="padding:5px 12px; font-size:0.8rem;" onclick="openSubtopicModal('${mod.id}', '${sub.id}')">Editar</button>
                <button class="btn-danger" style="padding:5px 12px; font-size:0.8rem; margin-left:6px;" onclick="handleDeleteSubtopic('${mod.id}', '${sub.id}')">Excluir</button>
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
                  <span>${escapeHtml(mod.title)}</span>
                  <span style="font-size:0.75rem; background:rgba(255,255,255,0.06); padding:2px 10px; border-radius:99px; color:var(--brand-gold); font-weight:600;">
                    ${subCount} subcategoria(s)
                  </span>
                </h3>
              </div>
            </div>

            <div class="module-card-actions">
              <button class="btn-secondary" style="font-size:0.82rem; padding:8px 14px;" onclick="openSubtopicModal('${mod.id}')">
                + Nova Subcategoria
              </button>
              <button class="btn-secondary" style="font-size:0.82rem; padding:8px 14px;" onclick="openModuleModal('${mod.id}')">
                Editar
              </button>
              <button class="btn-danger" style="font-size:0.82rem; padding:8px 14px;" onclick="handleDeleteModule('${mod.id}', '${escapeHtml(mod.title)}')">
                Excluir
              </button>
            </div>
          </div>

          <div class="subtopics-drawer" id="drawer-${mod.id}">
            <div class="subtopics-header">
              <h4>Subcategorias de ${escapeHtml(mod.title)}</h4>
              <button class="btn-secondary" style="font-size:0.75rem; padding:4px 10px;" onclick="openSubtopicModal('${mod.id}')">
                + Adicionar Subcategoria
              </button>
            </div>

            ${
              subCount > 0
                ? `
                <table class="subtopics-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Nome da Subcategoria</th>
                      <th style="text-align:right;">Ações</th>
                    </tr>
                  </thead>
                  <tbody>${subtopicsRows}</tbody>
                </table>
              `
                : `<div style="font-size:0.85rem; color:var(--text-muted); padding:10px 0;">Nenhuma subcategoria cadastrada nesta categoria.</div>`
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
// CATEGORY (MODULE) CRUD — APENAS NOME
// ============================================================================

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
    }
  } else {
    titleEl.textContent = 'Nova Categoria';
    document.getElementById('modId').value = '';
    document.getElementById('modTitle').value = '';
  }

  modal.classList.add('open');
  setTimeout(() => document.getElementById('modTitle').focus(), 50);
};

window.closeModuleModal = function () {
  document.getElementById('moduleModal').classList.remove('open');
};

window.handleDeleteModule = async function (modId, title) {
  if (confirm(`Tem certeza que deseja excluir a categoria "${title}" e todas as suas subcategorias?`)) {
    await deleteModule(modId);
    showToast('Categoria excluída.');
    await loadAndRenderModules();
  }
};

// ============================================================================
// SUBCATEGORY (SUBTOPIC) CRUD — APENAS NOME
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
      titleEl.textContent = 'Editar Subcategoria';
      document.getElementById('subId').value = sub.id;
      document.getElementById('subTitle').value = sub.title || '';
    }
  } else {
    titleEl.textContent = 'Nova Subcategoria';
    document.getElementById('subId').value = '';
    document.getElementById('subTitle').value = '';
  }

  modal.classList.add('open');
  setTimeout(() => document.getElementById('subTitle').focus(), 50);
};

window.closeSubtopicModal = function () {
  document.getElementById('subtopicModal').classList.remove('open');
};

window.handleDeleteSubtopic = async function (moduleId, subId) {
  if (confirm('Deseja realmente excluir esta subcategoria?')) {
    await deleteSubtopic(moduleId, subId);
    showToast('Subcategoria excluída.');
    await loadAndRenderModules();
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
      if (!title) return;

      const existingMod = currentModulesData.find((m) => m.id === modId);
      const order = existingMod ? existingMod.order_index : currentModulesData.length + 1;

      const payload = {
        id: modId || undefined,
        title: title,
        order_index: order,
        slug: title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
        description: ''
      };

      await saveModule(payload);
      closeModuleModal();
      showToast('Categoria salva com sucesso!');
      await loadAndRenderModules();
    });
  }

  // Subcategory Form
  const subtopicForm = document.getElementById('subtopicForm');
  if (subtopicForm) {
    subtopicForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const subId = document.getElementById('subId').value;
      const moduleId = document.getElementById('subModuleId').value;
      const title = document.getElementById('subTitle').value.trim();
      if (!title) return;

      const mod = currentModulesData.find((m) => m.id === moduleId);
      const existingSub = mod && mod.subtopics ? mod.subtopics.find((s) => s.id === subId) : null;
      const order = existingSub ? existingSub.order_index : (mod && mod.subtopics ? mod.subtopics.length + 1 : 1);

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
      showToast('Subcategoria salva com sucesso!');
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
    showToast(`🎉 Sincronizado: ${res.modulesCount} categorias salvas no Supabase!`);
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
