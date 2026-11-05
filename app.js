/* ==========================================================================
   MONITOR HELP CENTER & ACADEMY — INTERCOM STYLE LOGIC
   Dynamic Category Boxes & Live Search Powered by Supabase
   ========================================================================== */

import { fetchModulesWithSubtopics } from './supabaseClient.js';

let loadedModules = [];

// Category icon mapper based on keyword matching
function getCategoryIcon(title) {
  const t = (title || '').toLowerCase();
  if (t.includes('dashboard') || t.includes('visão') || t.includes('visao')) return '📊';
  if (t.includes('usuário') || t.includes('usuario') || t.includes('cliente') || t.includes('motorista')) return '👥';
  if (t.includes('viagen') || t.includes('viagem') || t.includes('opera') || t.includes('mapa') || t.includes('frota')) return '🗺️';
  if (t.includes('taxa') || t.includes('financeiro') || t.includes('tarifa') || t.includes('repasse')) return '💰';
  if (t.includes('comunica') || t.includes('relatório') || t.includes('relatorio') || t.includes('mensagem')) return '💬';
  if (t.includes('avançada') || t.includes('avancada') || t.includes('sistema') || t.includes('config')) return '⚙️';
  return '📁';
}

// ============================================================================
// INITIALIZATION
// ============================================================================

async function initHelpCenter() {
  const { data } = await fetchModulesWithSubtopics();
  loadedModules = data || [];

  renderCategoryCards(loadedModules);
  setupHeroSearch();
  setupThemeToggle();
}

// ============================================================================
// RENDER CATEGORY BOXES ("Caixas que serão categorias de tutorials")
// ============================================================================

function renderCategoryCards(modules) {
  const grid = document.getElementById('categoriesGrid');
  if (!grid) return;

  if (modules.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; padding: 48px; text-align: center; background: var(--bg-card); border-radius: var(--radius-md); border: 1px dashed var(--border-medium);">
        <p style="color: var(--text-secondary); margin-bottom: 14px;">Nenhuma categoria de tutorial cadastrada ainda.</p>
        <a href="/admin" class="nav-btn-admin">⚙️ Criar Categorias no Painel Admin</a>
      </div>
    `;
    return;
  }

  grid.innerHTML = modules
    .map((mod) => {
      const icon = mod.icon || getCategoryIcon(mod.title);
      const subCount = (mod.subtopics || []).length;
      const countLabel = `${subCount} subtópico${subCount === 1 ? '' : 's'}`;

      return `
        <div class="category-card" onclick="openCategoryModal('${mod.id}')">
          <div class="category-card-left">
            <div class="category-icon-box">${icon}</div>
            <div class="category-card-info">
              <h3 class="category-card-title">${escapeHtml(mod.title)}</h3>
              <span class="category-card-meta">${countLabel} • Guia prático</span>
            </div>
          </div>
          <span class="category-card-arrow">›</span>
        </div>
      `;
    })
    .join('');
}

// ============================================================================
// CATEGORY DETAIL MODAL
// ============================================================================

export function openCategoryModal(modId) {
  const mod = loadedModules.find((m) => m.id === modId);
  if (!mod) return;

  const modal = document.getElementById('categoryModal');
  const iconEl = document.getElementById('modalCatIcon');
  const titleEl = document.getElementById('modalCatTitle');
  const countEl = document.getElementById('modalCatCount');
  const listEl = document.getElementById('modalSubtopicsList');

  const icon = mod.icon || getCategoryIcon(mod.title);
  const subCount = (mod.subtopics || []).length;

  iconEl.textContent = icon;
  titleEl.textContent = mod.title;
  countEl.textContent = `${subCount} subtópico${subCount === 1 ? '' : 's'} cadastrado${subCount === 1 ? '' : 's'}`;

  if (subCount === 0) {
    listEl.innerHTML = `
      <li style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.88rem; background: var(--bg-card); border-radius: var(--radius-sm);">
        Nenhum subtópico adicionado nesta categoria ainda.<br />
        <a href="/admin" style="color: var(--brand-gold); font-weight: 700; text-decoration: underline; margin-top: 6px; display: inline-block;">
          Adicionar no Admin
        </a>
      </li>
    `;
  } else {
    listEl.innerHTML = (mod.subtopics || [])
      .map(
        (sub, idx) => `
          <li>
            <div class="subtopic-cat-item">
              <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-weight: 700; color: var(--brand-gold); width: 22px;">${idx + 1}.</span>
                <span>${escapeHtml(sub.title)}</span>
              </div>
              <span style="color: var(--text-muted); font-size: 0.8rem;">Subtópico ›</span>
            </div>
          </li>
        `
      )
      .join('');
  }

  modal.classList.add('open');
}

export function closeCategoryModal() {
  const modal = document.getElementById('categoryModal');
  if (modal) modal.classList.remove('open');
}

// Open category by matching title fragment (used in the Featured Quick Links)
export function openCategoryByTitle(titleFragment) {
  const cleanFrag = titleFragment.toLowerCase();
  const found = loadedModules.find((m) => m.title.toLowerCase().includes(cleanFrag));
  if (found) {
    openCategoryModal(found.id);
  } else if (loadedModules.length > 0) {
    openCategoryModal(loadedModules[0].id);
  }
}

// ============================================================================
// INSTANT LIVE SEARCH
// ============================================================================

function setupHeroSearch() {
  const input = document.getElementById('heroSearchInput');
  const dropdown = document.getElementById('searchResultsDropdown');
  if (!input || !dropdown) return;

  input.addEventListener('input', () => {
    const query = input.value.trim().toLowerCase();
    if (!query) {
      dropdown.classList.remove('open');
      dropdown.innerHTML = '';
      return;
    }

    const matches = [];

    // Search across categories and subtopics
    loadedModules.forEach((mod) => {
      if (mod.title.toLowerCase().includes(query)) {
        matches.push({
          type: 'category',
          modId: mod.id,
          title: mod.title,
          categoryName: 'Categoria Principal'
        });
      }

      (mod.subtopics || []).forEach((sub) => {
        if (sub.title.toLowerCase().includes(query)) {
          matches.push({
            type: 'subtopic',
            modId: mod.id,
            title: sub.title,
            categoryName: mod.title
          });
        }
      });
    });

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div style="padding: 16px; color: var(--text-muted); font-size: 0.88rem; text-align: center;">
          Nenhum artigo ou categoria encontrada para "<strong>${escapeHtml(query)}</strong>".
        </div>
      `;
    } else {
      dropdown.innerHTML = matches
        .slice(0, 8)
        .map(
          (m) => `
            <div class="search-result-item" onclick="handleSearchResultClick('${m.modId}')">
              <div>
                <strong style="display: block; font-size: 0.94rem;">${escapeHtml(m.title)}</strong>
                <span class="search-result-category">${escapeHtml(m.categoryName)}</span>
              </div>
              <span style="color: var(--brand-gold);">›</span>
            </div>
          `
        )
        .join('');
    }

    dropdown.classList.add('open');
  });

  // Close dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.hero-search-wrap')) {
      dropdown.classList.remove('open');
    }
  });

  // Keyboard shortcut Ctrl+K
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      input.focus();
    }
  });
}

window.handleSearchResultClick = function (modId) {
  const dropdown = document.getElementById('searchResultsDropdown');
  if (dropdown) dropdown.classList.remove('open');
  openCategoryModal(modId);
};

// ============================================================================
// THEME & WIDGET TOGGLES
// ============================================================================

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

export function toggleBeaconBubble() {
  const bubble = document.getElementById('beaconBubble');
  if (bubble) bubble.classList.toggle('open');
}

// Utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Expose to window for inline onclick handlers
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.openCategoryByTitle = openCategoryByTitle;
window.toggleBeaconBubble = toggleBeaconBubble;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initHelpCenter();
});
