/* ==========================================================================
   TOP MOBILIDADE — CLIENT LOGIC (ESTILO MOBYAPP COM PALETA TOP)
   Header interativo, animações de scroll e categorias dinâmicas do Supabase
   ========================================================================== */

import { fetchModulesWithSubtopics } from './supabaseClient.js';

let loadedModules = [];

// Category icon mapper
function getCategoryIcon(title) {
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
// INITIALIZATION
// ============================================================================

async function initPage() {
  setupHeaderScroll();
  setupMobileMenu();
  setupActiveNavScroll();
  setupHeroSearch();

  // Load Categories & Tutorials from Supabase / LocalStorage
  const { data } = await fetchModulesWithSubtopics();
  loadedModules = data || [];
  renderCategoryCards(loadedModules);
}

// ============================================================================
// HEADER STICKY & SCROLL EFFECTS
// ============================================================================

function setupHeaderScroll() {
  const header = document.getElementById('mainHeader');
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

function setupMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const drawer = document.getElementById('mobileDrawer');
  if (!btn || !drawer) return;

  btn.addEventListener('click', () => {
    drawer.classList.toggle('open');
  });
}

export function closeMobileDrawer() {
  const drawer = document.getElementById('mobileDrawer');
  if (drawer) drawer.classList.remove('open');
}

function setupActiveNavScroll() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.capsule-menu-list .capsule-link, .mobile-nav-drawer .capsule-link');

  if (sections.length === 0 || navLinks.length === 0) return;

  window.addEventListener('scroll', () => {
    let current = '';
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 120;
      if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });

    navLinks.forEach((link) => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }, { passive: true });
}

// ============================================================================
// RENDER CATEGORY BOXES ("Caixas de Tutoriais")
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

    loadedModules.forEach((mod) => {
      if ((mod.title || '').toLowerCase().includes(query)) {
        matches.push({
          type: 'category',
          modId: mod.id,
          title: mod.title,
          categoryName: 'Categoria Principal'
        });
      }

      (mod.subtopics || []).forEach((sub) => {
        if ((sub.title || '').toLowerCase().includes(query)) {
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
                <strong class="search-result-title">${escapeHtml(m.title)}</strong>
                <span class="search-result-cat">${escapeHtml(m.categoryName)}</span>
              </div>
              <span style="color: var(--brand-gold); font-size: 1.2rem;">›</span>
            </div>
          `
        )
        .join('');
    }

    dropdown.classList.add('open');
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('.hero-search-wrap')) {
      dropdown.classList.remove('open');
    }
  });

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

// Utilities
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Expose globals for HTML inline events
window.openCategoryModal = openCategoryModal;
window.closeCategoryModal = closeCategoryModal;
window.closeMobileDrawer = closeMobileDrawer;

// Initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initPage();
});
