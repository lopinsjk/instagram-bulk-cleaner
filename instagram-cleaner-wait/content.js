// Instagram Bulk Cleaner v9 — like + commenti
if (window.__igCleanerLoaded) {
  console.log('[IGCleaner] già caricato');
} else {
  window.__igCleanerLoaded = true;
  window.__igCleanerMessages = [];

  (function () {
    let isRunning = false;
    let totalRemoved = 0;
    let delay = 1200;
    let waitSecs = 30;
    let mode = 'likes'; // 'likes' | 'comments'

    function send(type, payload = {}) {
      window.__igCleanerMessages.push({ type, ...payload });
    }
    function log(msg) {
      console.log('[IGCleaner]', msg);
      send('LOG', { msg });
    }

    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
    const rnd   = (base) => base + Math.floor(Math.random() * 400);

    function realClick(el) {
      el.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
      el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent('mouseup',   { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent('click',     { bubbles: true, cancelable: true }));
    }

    async function waitFor(fn, timeout = 6000, interval = 250) {
      const t0 = Date.now();
      while (Date.now() - t0 < timeout) {
        const r = fn();
        if (r) return r;
        await sleep(interval);
      }
      return null;
    }

    function findBloksText(keywords) {
      const spans = document.querySelectorAll('span[data-bloks-name="bk.components.Text"]');
      for (const s of spans) {
        const txt = (s.innerText || '').trim().toLowerCase();
        if (keywords.some(k => txt === k.toLowerCase())) return s;
      }
      for (const s of spans) {
        const txt = (s.innerText || '').trim().toLowerCase();
        if (keywords.some(k => txt.includes(k.toLowerCase()))) return s;
      }
      return null;
    }

    // ── Controlla e chiude popup di errore Instagram ──────────────────────────
    // Popup: h3 "Si è verificato un errore" + button._a9-- con div._aacu
    function dismissErrorPopup() {
      const buttons = document.querySelectorAll('button._a9--');
      for (const b of buttons) {
        const inner = b.querySelector('div._aacu');
        if (inner) {
          log('⚠️ Popup di errore rilevato — clicco OK...');
          realClick(b);
          return true;
        }
      }
      return false;
    }

    // ── STEP 1: clicca "Seleziona" ────────────────────────────────────────────
    async function clickSeleziona() {
      const btn = findBloksText(['seleziona', 'select']);
      if (!btn) return false;
      log('📌 Clicco "Seleziona"...');
      realClick(btn);
      return true;
    }

    // ── STEP 2: seleziona celle (dal 6° in poi, 20 elementi) ─────────────────
    async function selectCells() {
      const appeared = await waitFor(
        () => document.querySelectorAll('[data-testid="bulk_action_checkbox"]').length > 0,
        5000
      );
      if (!appeared) { log('⚠️ Checkbox non apparsi'); return 0; }

      // Like: parte dal 6° (skip 5 problematici)
      // Commenti: parte dal 1° (nessun problema noto, si parte da 0)
      const start = mode === 'likes' ? 5 : 0;
      const end   = start + 20;

      const containers = [...document.querySelectorAll('[data-testid="bulk_action_checkbox"]')].slice(start, end);
      log(`🔲 Seleziono ${containers.length} elementi (dal ${start + 1}°)...`);

      let selected = 0;
      for (const container of containers) {
        if (!isRunning) return selected;
        let target = container;
        let el = container.parentElement;
        while (el && el !== document.body) {
          const cs = window.getComputedStyle(el);
          if (cs.cursor === 'pointer' && cs.pointerEvents !== 'none') {
            target = el;
            break;
          }
          el = el.parentElement;
        }
        realClick(target);
        selected++;
        if (selected % 5 === 0) log(`🔲 Selezionati ${selected}/20...`);
        await sleep(rnd(100));
      }
      log(`✅ ${selected} elementi selezionati`);
      return selected;
    }

    // ── STEP 3: clicca bottone azione in basso ────────────────────────────────
    async function clickActionBar() {
      const ariaLabel = mode === 'likes' ? 'Non mi piace più' : 'Elimina';
      log(`🔍 Cerco bottone "${ariaLabel}" in basso...`);

      const btn = await waitFor(() => {
        const candidates = document.querySelectorAll(`[aria-label="${ariaLabel}"]`);
        for (const el of candidates) {
          const cs = window.getComputedStyle(el);
          if (cs.pointerEvents !== 'none' && cs.cursor === 'pointer') return el;
        }
        // fallback: cerca per testo
        const spans = document.querySelectorAll('span[data-bloks-name="bk.components.TextSpan"]');
        for (const s of spans) {
          const txt = (s.innerText || '').trim().toLowerCase();
          const keyword = mode === 'likes' ? 'non mi piace' : 'elimina';
          if (txt.includes(keyword)) {
            let el = s.parentElement;
            while (el) {
              const cs = window.getComputedStyle(el);
              if (cs.cursor === 'pointer' && cs.pointerEvents !== 'none') return el;
              el = el.parentElement;
            }
          }
        }
        return null;
      }, 5000);

      if (!btn) { log(`⚠️ Bottone "${ariaLabel}" non trovato!`); return false; }
      log(`🗑️ Clicco "${ariaLabel}"...`);
      realClick(btn);
      return true;
    }

    // ── STEP 4: conferma popup ────────────────────────────────────────────────
    // Popup like:     button._a9-- con div._aac- (senza _aacx)
    // Popup commenti: stesso schema, testo "Elimina"
    async function clickConfirmPopup() {
      log('🔍 Aspetto popup di conferma...');

      const btn = await waitFor(() => {
        const buttons = document.querySelectorAll('button._a9--');
        for (const b of buttons) {
          const inner = b.querySelector('div._aac-');
          if (inner && !inner.classList.contains('_aacx')) return b;
        }
        return null;
      }, 6000);

      if (!btn) { log('⚠️ Popup conferma non apparso!'); return false; }
      log('✔️ Confermo nel popup...');
      realClick(btn);
      return true;
    }

    // ── MODALITÀ UNTAG: rimuovi tag dai post salvati ──────────────────────────
    async function runUntag() {
      log('🚀 Avvio rimozione tag...');
      let failCount = 0;

      while (isRunning) {
        await sleep(rnd(delay));

        // Controlla popup di errore
        if (dismissErrorPopup()) { await sleep(800); continue; }

        // Step 1: clicca "Rimuovi" (il segnalibro pieno)
        const removeBtn = await waitFor(() => {
          // aria-label="Rimuovi" con role="button"
          const candidates = document.querySelectorAll('[aria-label="Rimuovi"][role="button"]');
          for (const el of candidates) {
            const cs = window.getComputedStyle(el);
            if (cs.cursor === 'pointer') return el;
          }
          // fallback: svg con title "Rimuovi"
          const titles = document.querySelectorAll('title');
          for (const t of titles) {
            if ((t.textContent || '').trim() === 'Rimuovi') {
              let el = t.closest('[role="button"]');
              if (el) return el;
            }
          }
          return null;
        }, 4000);

        if (!removeBtn) {
          failCount++;
          log(`⚠️ Bottone "Rimuovi" non trovato (${failCount}/3)`);
          if (failCount >= 3) {
            log('✅ Nessun tag rimasto. Completato!');
            send('DONE', { total: totalRemoved });
            isRunning = false;
            return;
          }
          await sleep(1500);
          continue;
        }

        failCount = 0;
        log('🔖 Clicco "Rimuovi"...');
        realClick(removeBtn);
        totalRemoved++;
        send('COUNT', { total: totalRemoved });
        log(`✅ Tag rimosso #${totalRemoved}`);
        await sleep(rnd(600));

        // Step 2: clicca "Avanti" per passare al post successivo
        const nextBtn = await waitFor(() => {
          // button._abl- con svg aria-label="Avanti"
          const btns = document.querySelectorAll('button._abl-');
          for (const b of btns) {
            if (b.querySelector('[aria-label="Avanti"]')) return b;
          }
          // fallback: qualsiasi button con aria-label="Avanti"
          return document.querySelector('[aria-label="Avanti"]')?.closest('button') || null;
        }, 3000);

        if (!nextBtn) {
          log('⚠️ Freccia "Avanti" non trovata — potrebbe essere l\'ultimo post');
          await sleep(1000);
          continue;
        }

        log('➡️ Clicco "Avanti"...');
        realClick(nextBtn);
        await sleep(rnd(delay));
      }
    }
    async function runCleaner() {
      const targetUrl = mode === 'likes'
        ? 'https://www.instagram.com/your_activity/interactions/likes'
        : 'https://www.instagram.com/your_activity/interactions/comments';

      const urlFragment = mode === 'likes' ? '/likes' : '/comments';
      if (!window.location.href.includes(urlFragment)) {
        log('🔀 Navigo alla pagina...');
        window.location.href = targetUrl;
        await sleep(3500);
      }
      await sleep(1500);

      let failCount = 0;

      while (isRunning) {
        await sleep(rnd(600));

        // Controlla sempre se c'è un popup di errore da chiudere
        if (dismissErrorPopup()) {
          await sleep(1000);
          continue; // riparte dal controllo errore finché non è pulito
        }

        const clicked = await clickSeleziona();
        if (!clicked) {
          failCount++;
          if (failCount >= 3) {
            log('✅ Nessun elemento rimasto. Completato!');
            send('DONE', { total: totalRemoved });
            isRunning = false;
            return;
          }
          log(`⚠️ "Seleziona" non trovato (${failCount}/3)`);
          await sleep(2000);
          continue;
        }
        failCount = 0;
        await sleep(rnd(500));

        const count = await selectCells();
        if (count === 0) {
          const cancel = findBloksText(['annulla', 'cancel']);
          if (cancel) realClick(cancel);
          await sleep(1000);
          continue;
        }
        await sleep(rnd(600));

        const barOk = await clickActionBar();
        if (!barOk) {
          const cancel = findBloksText(['annulla', 'cancel']);
          if (cancel) realClick(cancel);
          await sleep(1000);
          continue;
        }
        await sleep(rnd(500));

        const popupOk = await clickConfirmPopup();
        if (!popupOk) {
          await sleep(1000);
          continue;
        }

        totalRemoved += count;
        log(`💚 Batch completato! +${count} (totale: ${totalRemoved})`);
        send('COUNT', { total: totalRemoved });

        log(`⏳ Attendo ${waitSecs}s prima del prossimo batch...`);
        for (let i = waitSecs; i > 0; i--) {
          if (!isRunning) return;
          if (i % 5 === 0 || i <= 3) log(`⏳ Prossimo batch tra ${i}s...`);
          await sleep(1000);
        }
      }
    }

    // ── Listener popup ────────────────────────────────────────────────────────
    window.addEventListener('igcleaner_from_popup', async (e) => {
      const { type, delayMs, waitSeconds, startMode } = e.detail;
      if (delayMs) delay = delayMs;
      if (waitSeconds) waitSecs = waitSeconds;
      if (startMode) mode = startMode;

      if (type === 'START_UNTAG' && !isRunning) {
        isRunning = true;
        totalRemoved = 0;
        runUntag().catch((err) => {
          log('❌ ' + err.message);
          send('ERROR', { msg: err.message });
          isRunning = false;
        });
      }
      if (type === 'START' && !isRunning) {
        isRunning = true;
        totalRemoved = 0;
        runCleaner().catch((err) => {
          log('❌ ' + err.message);
          send('ERROR', { msg: err.message });
          isRunning = false;
        });
      }
      if (type === 'STOP') {
        isRunning = false;
        log('⏹️ Fermato.');
        send('STOPPED', { total: totalRemoved });
      }
    });

    send('READY');
    log('✓ v9 caricato — like + commenti');
  })();
}
