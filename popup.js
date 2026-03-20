let activeTab = null;
let isRunning = false;
let currentDelay = 1200;
let waitSeconds = 30;

const dot          = document.getElementById('dot');
const btnLikes     = document.getElementById('btnLikes');
const btnComments  = document.getElementById('btnComments');
const btnUntag     = document.getElementById('btnUntag');
const btnStop      = document.getElementById('btnStop');
const logBox       = document.getElementById('logBox');
const counterNum   = document.getElementById('counterNum');
const counterLabel = document.getElementById('counterLabel');
const speedLabel   = document.getElementById('speedLabel');
const waitLabel    = document.getElementById('waitLabel');
const notOnPage    = document.getElementById('notOnPage');
const mainContent  = document.getElementById('mainContent');

async function init() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  activeTab = tab;
  if (!tab?.url?.includes('instagram.com')) {
    mainContent.style.display = 'none';
    notOnPage.style.display = 'block';
    return;
  }
  try {
    await chrome.scripting.executeScript({ target: { tabId: tab.id }, files: ['content.js'] });
  } catch(e) {}
  startPolling();
  dot.classList.add('ready');
}

function sendToContent(detail) {
  if (!activeTab) return;
  chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: (d) => window.dispatchEvent(new CustomEvent('igcleaner_from_popup', { detail: d })),
    args: [detail],
  });
}

function startPolling() {
  chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    func: () => { if (!window.__igCleanerMessages) window.__igCleanerMessages = []; },
  });
  setInterval(async () => {
    if (!activeTab) return;
    try {
      const res = await chrome.scripting.executeScript({
        target: { tabId: activeTab.id },
        func: () => { const m = window.__igCleanerMessages || []; window.__igCleanerMessages = []; return m; },
      });
      for (const msg of (res?.[0]?.result || [])) handleMsg(msg);
    } catch(e) {}
  }, 600);
}

function handleMsg(msg) {
  const { type, msg: text, total } = msg;
  if (type === 'LOG')     appendLog(text);
  if (type === 'COUNT')   { counterNum.textContent = total; }
  if (type === 'DONE')    { setRunning(false); appendLog('✅ Completato! Totale: ' + total, 'success'); counterNum.textContent = total; }
  if (type === 'STOPPED') { setRunning(false); appendLog('⏹ Fermato. Totale: ' + total, 'warn'); counterNum.textContent = total; }
  if (type === 'ERROR')   { setRunning(false); appendLog('❌ ' + text, 'error'); }
}

function appendLog(txt, cls = '') {
  const line = document.createElement('div');
  line.className = 'log-line ' + cls;
  const t = new Date().toLocaleTimeString('it-IT', { hour:'2-digit', minute:'2-digit', second:'2-digit' });
  line.textContent = `[${t}] ${txt}`;
  logBox.appendChild(line);
  logBox.scrollTop = logBox.scrollHeight;
}

function setRunning(val) {
  isRunning = val;
  btnLikes.disabled = val;
  btnComments.disabled = val;
  btnUntag.disabled = val;
  dot.className = 'dot ' + (val ? 'running' : 'ready');
}

function startMode(mode) {
  if (isRunning) return;
  setRunning(true);
  counterNum.textContent = '0';
  counterLabel.textContent = mode === 'likes' ? 'like rimossi' : 'commenti eliminati';
  appendLog(`▶ Avvio ${mode === 'likes' ? 'rimozione like' : 'eliminazione commenti'} (attesa: ${waitSeconds}s)...`, 'info');
  sendToContent({ type: 'START', delayMs: currentDelay, waitSeconds, startMode: mode });
}

btnLikes.addEventListener('click',    () => startMode('likes'));
btnComments.addEventListener('click', () => startMode('comments'));

btnUntag.addEventListener('click', () => {
  if (isRunning) return;
  setRunning(true);
  counterNum.textContent = '0';
  counterLabel.textContent = 'tag rimossi';
  appendLog('▶ Avvio rimozione tag post salvati...', 'info');
  sendToContent({ type: 'START_UNTAG', delayMs: currentDelay });
});

btnStop.addEventListener('click', () => {
  sendToContent({ type: 'STOP' });
  setRunning(false);
  appendLog('⏸ Stop...', 'warn');
});

document.querySelectorAll('.opt[data-wait]').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.opt[data-wait]').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    waitSeconds = parseInt(opt.dataset.wait);
    waitLabel.textContent = waitSeconds + 's';
  });
});

document.querySelectorAll('.opt[data-delay]').forEach(opt => {
  opt.addEventListener('click', () => {
    document.querySelectorAll('.opt[data-delay]').forEach(o => o.classList.remove('active'));
    opt.classList.add('active');
    currentDelay = parseInt(opt.dataset.delay);
    speedLabel.textContent = opt.dataset.label;
  });
});

init();
