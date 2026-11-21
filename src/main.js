import { apis, categories } from './data.js';

const byId = (id) => document.getElementById(id);
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
}[character]));

const searchText = new Map(apis.map((api) => [
  api.id,
  [api.name, api.header, api.since, api.level, api.brief, api.signature,
    api.returns, api.pitfall, api.code, api.keywords,
    categories.find((category) => category.id === api.category)?.title ?? '']
    .join(' ').toLocaleLowerCase()
]));

function badge(label, className = '') {
  return `<span class="badge ${className}">${escapeHtml(label)}</span>`;
}

function renderApi(api) {
  return `
    <details class="api-card" id="api-${escapeHtml(api.id)}" data-api-id="${escapeHtml(api.id)}">
      <summary>
        <span class="api-title"><span class="api-name">${escapeHtml(api.name)}</span></span>
        <span class="badges">
          ${badge(api.level, `level-${api.level}`)}
          ${badge(api.since, api.since.includes('C++20') ? 'new' : '')}
        </span>
        <p class="api-brief">${escapeHtml(api.brief)}</p>
      </summary>
      <div class="api-body">
        <div class="signature"><code>${escapeHtml(api.signature)}</code></div>
        <dl class="api-facts">
          <div class="fact"><dt>头文件</dt><dd><code>${escapeHtml(api.header)}</code></dd></div>
          <div class="fact"><dt>返回什么</dt><dd>${escapeHtml(api.returns)}</dd></div>
          <div class="fact warning"><dt>注意</dt><dd>${escapeHtml(api.pitfall)}</dd></div>
        </dl>
        <div class="code-heading">
          <span>示例</span>
          <button class="copy-button" type="button" data-copy="${escapeHtml(api.id)}" aria-label="复制 ${escapeHtml(api.name)} 的示例代码">复制代码</button>
        </div>
        <pre><code>${escapeHtml(api.code)}</code></pre>
      </div>
    </details>`;
}

function renderHandbook() {
  byId('categoryNav').innerHTML = categories.map((category) => {
    const count = apis.filter((api) => api.category === category.id).length;
    return `<a class="category-link" href="#category-${escapeHtml(category.id)}" data-category="${escapeHtml(category.id)}">
      <span>${escapeHtml(category.title)}</span><span>${count}</span>
    </a>`;
  }).join('');

  byId('categorySelect').innerHTML = '<option value="">跳转到分类……</option>' + categories.map((category) =>
    `<option value="${escapeHtml(category.id)}">${escapeHtml(category.title)}</option>`
  ).join('');

  byId('apiContent').innerHTML = categories.map((category) => {
    const entries = apis.filter((api) => api.category === category.id);
    return `<section class="api-section" id="category-${escapeHtml(category.id)}" data-section="${escapeHtml(category.id)}">
      <div class="section-heading">
        <h2>${escapeHtml(category.title)}</h2>
        <span class="section-count">${entries.length} 条</span>
      </div>
      <p class="section-description">${escapeHtml(category.description)}</p>
      <div class="api-list">${entries.map(renderApi).join('')}</div>
    </section>`;
  }).join('');

  byId('totalCount').textContent = apis.length;
}

let activeFilter = 'all';
let query = '';
let toastTimer;

function matches(api) {
  const filterMatch = activeFilter === 'all'
    || (activeFilter === 'A' && api.level === 'A')
    || (activeFilter === '20' && api.since.includes('C++20'));
  if (!filterMatch) return false;
  const tokens = query.toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const haystack = searchText.get(api.id);
  return tokens.every((token) => haystack.includes(token));
}

function applyFilters() {
  let visible = 0;
  for (const api of apis) {
    const card = byId(`api-${api.id}`);
    const show = matches(api);
    card.hidden = !show;
    if (show) {
      visible += 1;
      if (query) card.open = true;
    }
  }

  for (const category of categories) {
    const section = byId(`category-${category.id}`);
    section.hidden = !apis.some((api) => api.category === category.id && matches(api));
  }

  byId('resultCount').textContent = `显示 ${visible} / ${apis.length} 条`;
  byId('emptyState').hidden = visible !== 0;
  byId('apiContent').hidden = visible === 0;
}

function setFilter(filter) {
  activeFilter = filter;
  document.querySelectorAll('[data-filter]').forEach((button) => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  applyFilters();
}

function resetFilters() {
  query = '';
  byId('searchInput').value = '';
  setFilter('all');
}

function showToast(message) {
  const toast = byId('toast');
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 1600);
}

async function copyCode(apiId) {
  const code = document.querySelector(`#api-${CSS.escape(apiId)} pre code`).textContent;
  try {
    await navigator.clipboard.writeText(code);
  } catch {
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
  }
  showToast('示例代码已复制');
}

function openApiTarget(id) {
  const card = byId(id);
  if (!card?.classList.contains('api-card')) return;
  if (card.hidden) resetFilters();
  card.open = true;
}

renderHandbook();
applyFilters();

byId('searchInput').addEventListener('input', (event) => {
  query = event.target.value.trim();
  applyFilters();
});

document.querySelectorAll('[data-filter]').forEach((button) => {
  button.addEventListener('click', () => setFilter(button.dataset.filter));
});

byId('expandButton').addEventListener('click', () => {
  apis.filter(matches).forEach((api) => { byId(`api-${api.id}`).open = true; });
  showToast('已展开当前结果');
});

byId('collapseButton').addEventListener('click', () => {
  document.querySelectorAll('.api-card').forEach((card) => { card.open = false; });
  showToast('已收起全部条目');
});

byId('resetButton').addEventListener('click', () => {
  resetFilters();
  byId('searchInput').focus();
});

document.addEventListener('click', (event) => {
  const copyButton = event.target.closest('[data-copy]');
  if (copyButton) copyCode(copyButton.dataset.copy);

  const anchor = event.target.closest('a[href^="#api-"]');
  if (anchor) openApiTarget(anchor.getAttribute('href').slice(1));

  const categoryLink = event.target.closest('[data-category]');
  if (categoryLink) {
    resetFilters();
    document.querySelectorAll('.category-link').forEach((link) => {
      link.classList.toggle('active', link === categoryLink);
    });
  }
});

byId('categorySelect').addEventListener('change', (event) => {
  const categoryId = event.target.value;
  if (!categoryId) return;
  resetFilters();
  byId(`category-${categoryId}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
  event.target.value = '';
});

document.addEventListener('keydown', (event) => {
  const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName);
  if ((event.ctrlKey || event.metaKey) && event.key.toLocaleLowerCase() === 'k') {
    event.preventDefault();
    byId('searchInput').focus();
    byId('searchInput').select();
  } else if (event.key === '/' && !typing && !event.altKey && !event.ctrlKey && !event.metaKey) {
    event.preventDefault();
    byId('searchInput').focus();
  } else if (event.key === 'Escape' && document.activeElement === byId('searchInput') && query) {
    resetFilters();
  }
});

window.addEventListener('hashchange', () => openApiTarget(location.hash.slice(1)));
openApiTarget(location.hash.slice(1));

byId('backToTop').addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
window.addEventListener('scroll', () => {
  byId('backToTop').hidden = window.scrollY < 600;
}, { passive: true });
