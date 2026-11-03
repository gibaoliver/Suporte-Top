/* ==========================================================================
   MONITOR — MENU PRINCIPAL NA ESQUERDA & CENTRO EM BRANCO
   ========================================================================== */

import { fetchModulesWithSubtopics } from './supabaseClient.js';

let loadedModules = [];
let activeCategoryId = null;
let activeSubcategoryId = null;

async function initNavigation() {
  const { data } = await fetchModulesWithSubtopics();
  loadedModules = data || [];

  renderSidebar(loadedModules);

  // Clear center content completely
  const centerEl = document.getElementById('contentContainer');
  if (centerEl) {
    centerEl.innerHTML = '';
  }
}

function renderSidebar(modules) {
  const navList = document.getElementById('moduleNavList');
  const sectionLabel = document.getElementById('sidebarSectionLabel');
  if (!navList) return;

  if (sectionLabel) {
    sectionLabel.textContent = `Categorias (${modules.length})`;
  }

  if (modules.length === 0) {
    navList.innerHTML = `
      <li style="padding: 16px; color: var(--text-muted); font-size: 0.85rem;">
        Nenhuma categoria cadastrada. Crie categorias no <a href="/admin" style="color:var(--brand-gold);">/admin</a>.
      </li>
    `;
    return;
  }

  navList.innerHTML = modules
    .map((mod, idx) => {
      const padNum = String(idx + 1).padStart(2, '0');
      const isExpanded = idx === 0;

      const subLinks = (mod.subtopics || [])
        .map(
          (sub) => `
            <li>
              <a href="#sub-${sub.id}" class="sub-nav-link" data-sub-id="${sub.id}" onclick="selectSubcategory('${mod.id}', '${sub.id}', this); return false;">
                ${escapeHtml(sub.title)}
              </a>
            </li>
          `
        )
        .join('');

      return `
        <li class="nav-item ${isExpanded ? 'expanded' : ''}" data-mod="${mod.id}" id="nav-item-${mod.id}">
          <button class="nav-btn ${idx === 0 ? 'active' : ''}" onclick="toggleCategory('${mod.id}')">
            <span class="nav-btn-left">
              <span class="nav-step-num">${padNum}</span>
              <span>${escapeHtml(mod.title)}</span>
            </span>
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

export function toggleCategory(modId) {
  activeCategoryId = modId;

  document.querySelectorAll('.nav-item').forEach((item) => {
    const isTarget = item.getAttribute('data-mod') === modId;
    if (isTarget) {
      item.classList.toggle('expanded');
      const btn = item.querySelector('.nav-btn');
      if (btn) btn.classList.add('active');
    } else {
      const btn = item.querySelector('.nav-btn');
      if (btn) btn.classList.remove('active');
    }
  });

  // Center remains blank as requested
  const centerEl = document.getElementById('contentContainer');
  if (centerEl) centerEl.innerHTML = '';
}

export function selectSubcategory(modId, subId, linkEl) {
  activeCategoryId = modId;
  activeSubcategoryId = subId;

  document.querySelectorAll('.sub-nav-link').forEach((a) => {
    a.classList.remove('active');
    a.style.color = '';
    a.style.fontWeight = '';
  });

  if (linkEl) {
    linkEl.classList.add('active');
    linkEl.style.color = 'var(--brand-gold)';
    linkEl.style.fontWeight = '700';
  }

  // Center remains blank as requested
  const centerEl = document.getElementById('contentContainer');
  if (centerEl) centerEl.innerHTML = '';
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

window.toggleCategory = toggleCategory;
window.selectSubcategory = selectSubcategory;

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  setupThemeToggle();
  setupMobileMenu();
});
