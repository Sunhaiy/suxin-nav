// Runs inside the nav page (file:///...index.html)
// Bridges localStorage <-> chrome.storage.local with a pending-ops queue.

function getLocalGroups() {
  try { return JSON.parse(localStorage.getItem('sx-groups') || '[]'); } catch(e) { return []; }
}

// Apply any pending adds (written by popup while nav was closed) to localStorage
function applyPending(cb) {
  chrome.storage.local.get(['sx-groups', 'sx-pending'], data => {
    const pending = data['sx-pending'] || [];
    if (!pending.length) { pushGroups(); cb && cb(); return; }

    let groups = getLocalGroups();
    pending.forEach(op => {
      if (op.type === 'add-item') {
        const g = groups.find(g => g.id === op.gid);
        if (g && !g.items.find(i => i.id === op.item.id)) g.items.push(op.item);
      } else if (op.type === 'add-group') {
        if (!groups.find(g => g.id === op.group.id)) groups.push(op.group);
      }
    });

    localStorage.setItem('sx-groups', JSON.stringify(groups));
    chrome.storage.local.set({'sx-groups': groups, 'sx-pending': []}, () => {
      window.postMessage({type: 'sx-reload'}, '*');
      cb && cb();
    });
  });
}

// Push current localStorage → chrome.storage (so popup always has fresh groups)
function pushGroups() {
  chrome.storage.local.set({'sx-groups': getLocalGroups()});
}

// ── On nav page load: apply pending first, then sync ──
applyPending();

// When nav page's own JS writes sx-groups (manager edits), re-sync to chrome.storage
window.addEventListener('storage', e => {
  if (e.key === 'sx-groups') pushGroups();
});

// When popup writes sx-pending while nav IS open, apply immediately
chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'local') return;
  const pending = changes['sx-pending'];
  if (pending && (pending.newValue || []).length) applyPending();
});
