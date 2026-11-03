/* ==========================================================================
   SUPABASE CLIENT & DYNAMIC CONTENT MANAGER
   Supports Supabase Cloud + LocalStorage Seamless Fallback
   ========================================================================== */

import { createClient } from '@supabase/supabase-js';
import { INITIAL_MODULES } from './seedData.js';

const STORAGE_KEY_MODULES = 'monitor_academy_modules_v2';
const STORAGE_KEY_SB_URL = 'MONITOR_SUPABASE_URL';
const STORAGE_KEY_SB_KEY = 'MONITOR_SUPABASE_ANON_KEY';
const STORAGE_KEY_ADMIN_AUTH = 'monitor_admin_session';

const DEFAULT_SB_URL = 'https://pznqkbutzlsfoyzckpnz.supabase.co';
const DEFAULT_SB_KEY = 'sb_publishable_P89S0xVR1O2QNXGhDW-pPw_KF4LR5KH';

// Initialize LocalStorage with seed data if not present
if (!localStorage.getItem(STORAGE_KEY_MODULES)) {
  localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(INITIAL_MODULES));
}

// Get configured Supabase keys
export function getSupabaseConfig() {
  const url =
    localStorage.getItem(STORAGE_KEY_SB_URL) ||
    import.meta.env.VITE_SUPABASE_URL ||
    DEFAULT_SB_URL;
  const key =
    localStorage.getItem(STORAGE_KEY_SB_KEY) ||
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    DEFAULT_SB_KEY;
  return { url, key, isConfigured: Boolean(url && key) };
}

export function saveSupabaseConfig(url, key) {
  localStorage.setItem(STORAGE_KEY_SB_URL, url.trim());
  localStorage.setItem(STORAGE_KEY_SB_KEY, key.trim());
}

// Get initialized Supabase instance or null
export function getSupabase() {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return null;
  try {
    return createClient(url, key);
  } catch (err) {
    console.error('Erro ao inicializar Supabase:', err);
    return null;
  }
}

// ============================================================================
// DATA ACCESS LAYER (SUPABASE WITH AUTOMATIC LOCALSTORAGE FALLBACK)
// ============================================================================

export async function fetchModulesWithSubtopics() {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data: modules, error: modErr } = await sb
        .from('modules')
        .select('*')
        .order('order_index', { ascending: true });

      if (!modErr && modules && modules.length > 0) {
        const { data: subtopics, error: subErr } = await sb
          .from('subtopics')
          .select('*')
          .order('order_index', { ascending: true });

        if (!subErr && subtopics) {
          // Group subtopics into their modules
          const combined = modules.map((m) => ({
            ...m,
            subtopics: subtopics.filter((s) => s.module_id === m.id)
          }));
          // Keep local storage synchronized as cache
          localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(combined));
          return { data: combined, source: 'supabase' };
        }
      }
    } catch (e) {
      console.warn('Falha na consulta ao Supabase, utilizando dados locais:', e);
    }
  }

  // Fallback to LocalStorage
  const localData = JSON.parse(
    localStorage.getItem(STORAGE_KEY_MODULES) || JSON.stringify(INITIAL_MODULES)
  );
  return { data: localData, source: 'local' };
}

// Create or Update Module
export async function saveModule(modData) {
  const sb = getSupabase();
  const isNew = !modData.id || modData.id.startsWith('new-');
  const modId = isNew ? (crypto.randomUUID ? crypto.randomUUID() : `mod-${Date.now()}`) : modData.id;

  const payload = {
    id: modId,
    order_index: Number(modData.order_index) || 1,
    title: modData.title,
    slug: modData.slug || modData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    badge_text: '',
    read_time: '',
    target_audience: '',
    icon: '',
    mascot_image: '',
    description: ''
  };

  if (sb) {
    try {
      if (isNew) {
        await sb.from('modules').insert([payload]);
      } else {
        await sb.from('modules').update(payload).eq('id', modId);
      }
    } catch (err) {
      console.warn('Erro ao salvar no Supabase:', err);
    }
  }

  // Update local
  const localList = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
  const existingIndex = localList.findIndex((m) => m.id === modId);
  if (existingIndex >= 0) {
    localList[existingIndex] = {
      ...localList[existingIndex],
      ...payload
    };
  } else {
    localList.push({ ...payload, subtopics: [] });
  }
  localList.sort((a, b) => a.order_index - b.order_index);
  localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(localList));
  return payload;
}

// Delete Module
export async function deleteModule(modId) {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('subtopics').delete().eq('module_id', modId);
      await sb.from('modules').delete().eq('id', modId);
    } catch (err) {
      console.warn('Erro ao deletar no Supabase:', err);
    }
  }

  const localList = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
  const filtered = localList.filter((m) => m.id !== modId);
  localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(filtered));
}

// Create or Update Subtopic
export async function saveSubtopic(subData) {
  const sb = getSupabase();
  const isNew = !subData.id || subData.id.startsWith('new-');
  const subId = isNew ? (crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}`) : subData.id;

  const payload = {
    id: subId,
    module_id: subData.module_id,
    order_index: Number(subData.order_index) || 1,
    title: subData.title,
    slug: subData.slug || subData.title.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    icon: '',
    lead_text: '',
    interactive_type: 'none',
    content_html: '',
    placeholder_title: '',
    placeholder_desc: '',
    tip_title: '',
    tip_content: '',
    tip_mascot: ''
  };

  if (sb) {
    try {
      if (isNew) {
        await sb.from('subtopics').insert([payload]);
      } else {
        await sb.from('subtopics').update(payload).eq('id', subId);
      }
    } catch (err) {
      console.warn('Erro ao salvar subtópico no Supabase:', err);
    }
  }

  // Update local
  const localList = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
  const mod = localList.find((m) => m.id === subData.module_id);
  if (mod) {
    if (!mod.subtopics) mod.subtopics = [];
    const subIdx = mod.subtopics.findIndex((s) => s.id === subId);
    if (subIdx >= 0) {
      mod.subtopics[subIdx] = payload;
    } else {
      mod.subtopics.push(payload);
    }
    mod.subtopics.sort((a, b) => a.order_index - b.order_index);
    localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(localList));
  }
  return payload;
}

// Delete Subtopic
export async function deleteSubtopic(moduleId, subId) {
  const sb = getSupabase();
  if (sb) {
    try {
      await sb.from('subtopics').delete().eq('id', subId);
    } catch (err) {
      console.warn('Erro ao deletar subtópico no Supabase:', err);
    }
  }

  const localList = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || '[]');
  const mod = localList.find((m) => m.id === moduleId);
  if (mod && mod.subtopics) {
    mod.subtopics = mod.subtopics.filter((s) => s.id !== subId);
    localStorage.setItem(STORAGE_KEY_MODULES, JSON.stringify(localList));
  }
}

// Sync all local data to Supabase (Seeds the remote database with 1 click)
export async function syncLocalDataToSupabase() {
  const sb = getSupabase();
  if (!sb) {
    throw new Error('Supabase não está configurado. Insira a URL e Chave Anon primeiro.');
  }

  const localList = JSON.parse(localStorage.getItem(STORAGE_KEY_MODULES) || JSON.stringify(INITIAL_MODULES));

  // 1. Prepare modules
  const modulesToInsert = localList.map((m) => ({
    id: m.id,
    order_index: m.order_index,
    title: m.title,
    slug: m.slug,
    badge_text: m.badge_text,
    read_time: m.read_time,
    target_audience: m.target_audience,
    icon: m.icon,
    mascot_image: m.mascot_image,
    description: m.description
  }));

  // 2. Prepare subtopics
  const subtopicsToInsert = [];
  localList.forEach((m) => {
    if (m.subtopics) {
      m.subtopics.forEach((s) => {
        subtopicsToInsert.push({
          id: s.id,
          module_id: m.id,
          order_index: s.order_index,
          title: s.title,
          slug: s.slug,
          icon: s.icon,
          lead_text: s.lead_text,
          interactive_type: s.interactive_type || 'none',
          content_html: s.content_html || '',
          placeholder_title: s.placeholder_title || '',
          placeholder_desc: s.placeholder_desc || '',
          tip_title: s.tip_title || '',
          tip_content: s.tip_content || '',
          tip_mascot: s.tip_mascot || 'assets/tep-rocket.png'
        });
      });
    }
  });

  // Upsert modules
  const { error: modErr } = await sb.from('modules').upsert(modulesToInsert, { onConflict: 'id' });
  if (modErr) throw modErr;

  // Upsert subtopics
  if (subtopicsToInsert.length > 0) {
    const { error: subErr } = await sb.from('subtopics').upsert(subtopicsToInsert, { onConflict: 'id' });
    if (subErr) throw subErr;
  }

  return { modulesCount: modulesToInsert.length, subtopicsCount: subtopicsToInsert.length };
}

// ============================================================================
// ADMIN AUTHENTICATION
// ============================================================================

export function checkAdminSession() {
  const session = localStorage.getItem(STORAGE_KEY_ADMIN_AUTH);
  if (!session) return false;
  try {
    const data = JSON.parse(session);
    return data.isLoggedIn === true;
  } catch {
    return false;
  }
}

export function performAdminLogin(username, password) {
  // Supports default master user + custom passwords
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();

  // Master credentials for the platform manager
  if (
    (cleanUser === 'admin' && cleanPass === 'admin123') ||
    (cleanUser === 'topgestor' && cleanPass === 'monitor@top2026') ||
    (cleanUser === 'giba' && cleanPass === 'top2026')
  ) {
    const sessionData = {
      isLoggedIn: true,
      user: cleanUser,
      loginAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY_ADMIN_AUTH, JSON.stringify(sessionData));
    return { success: true };
  }

  return { success: false, message: 'Usuário ou senha incorretos.' };
}

export function performAdminLogout() {
  localStorage.removeItem(STORAGE_KEY_ADMIN_AUTH);
}

