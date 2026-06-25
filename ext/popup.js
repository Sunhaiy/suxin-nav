const NAV = 'file:///C:/Users/SUNHIY/Desktop/suxin-nav/index.html';

function uid() { return Math.random().toString(36).slice(2,10); }
function fixUrl(u) {
  if (!u) return '';
  if (/^https?:\/\//i.test(u)) return u;
  if (/^(localhost|127\.|192\.168\.)/.test(u)) return 'http://' + u;
  return 'https://' + u;
}

const $ = id => document.getElementById(id);
let groups = [];

// ── Fill URL/title from active tab ──
chrome.tabs.query({active:true, currentWindow:true}, ([tab]) => {
  if (!tab) return;
  $('name').value = tab.title || '';
  $('url').value  = tab.url  || '';
  $('name').select();
});

// ── Load groups from chrome.storage.local ──
chrome.storage.local.get('sx-groups', data => {
  groups = (data['sx-groups'] || []).map(g => ({cols:0, ...g}));
  renderGroups();
});

function renderGroups() {
  const gc = $('groups');
  gc.innerHTML = '';
  if (!groups.length) {
    gc.innerHTML = '<span class="no-data">请先打开一次导航首页以同步分组数据</span>';
    return;
  }
  groups.forEach(g => {
    const btn = document.createElement('button');
    btn.className = 'grp-btn';
    btn.textContent = g.name;
    btn.onclick = () => saveToGroup(g, btn);
    gc.appendChild(btn);
  });
  // "+ 新建分组" button
  const nb = document.createElement('button');
  nb.className = 'grp-btn new-btn';
  nb.innerHTML = `<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M12 5v14M5 12h14"/></svg>新建分组`;
  nb.onclick = () => { $('new-panel').classList.add('show'); $('new-name').focus(); };
  gc.appendChild(nb);
}

function getFields() {
  return {
    name: $('name').value.trim(),
    url:  fixUrl($('url').value.trim()),
  };
}

// Write ops to sx-pending queue so data survives even if nav page is closed
function enqueue(ops, onDone) {
  chrome.storage.local.get('sx-pending', data => {
    const pending = (data['sx-pending'] || []).concat(ops);
    // Also update the in-memory sx-groups snapshot so popup reflects the change
    chrome.storage.local.set({'sx-pending': pending, 'sx-groups': groups}, onDone);
  });
}

function saveToGroup(g, btn) {
  const { name, url } = getFields();
  if (!name) { showMsg('请填写名称', 'err'); $('name').focus(); return; }
  if (!url)  { showMsg('请填写地址', 'err'); $('url').focus();  return; }

  const item = { id: uid(), name, url };
  // Optimistically update local groups copy
  g.items.push(item);
  btn.classList.add('ok');

  enqueue([{type: 'add-item', gid: g.id, item}], () => {
    showMsg('✓ 已添加到「' + g.name + '」', 'ok');
    setTimeout(() => window.close(), 900);
  });
}

function saveNewGroup() {
  const gname = $('new-name').value.trim();
  if (!gname) { $('new-name').focus(); return; }
  const { name, url } = getFields();
  if (!name) { showMsg('请填写名称', 'err'); $('name').focus(); return; }
  if (!url)  { showMsg('请填写地址', 'err'); $('url').focus();  return; }

  const zone  = $('new-zone').value;
  const order = groups.filter(g => g.zone === zone).length;
  const group = { id: uid(), name: gname, zone, order, cols: 0,
                  items: [{ id: uid(), name, url }] };
  groups.push(group);

  enqueue([{type: 'add-group', group}], () => {
    showMsg('✓ 已新建「' + gname + '」并添加', 'ok');
    setTimeout(() => window.close(), 900);
  });
}

function showMsg(text, type) {
  $('msg').textContent = text;
  $('msg').className = 'msg ' + (type || '');
}

// ── Event bindings ──
$('name').addEventListener('keydown', e => { if (e.key === 'Enter') $('url').focus(); });
$('url').addEventListener('keydown',  e => { if (e.key === 'Enter') $('url').blur(); });

$('new-confirm').onclick = saveNewGroup;
$('new-cancel').onclick  = () => { $('new-panel').classList.remove('show'); $('new-name').value = ''; };
$('new-name').addEventListener('keydown', e => {
  if (e.key === 'Enter')  saveNewGroup();
  if (e.key === 'Escape') $('new-cancel').click();
});

$('file-link').onclick = () => {
  chrome.tabs.create({ url: 'chrome://extensions/?id=' + chrome.runtime.id });
  window.close();
};
