# 🧹 Instagram Bulk Cleaner — Estensione Chrome

Rimuovi in bulk tutti i **like** e i **commenti** dal tuo account Instagram.

---

## 📦 Installazione

1. **Scarica e decomprimi** il file `instagram-cleaner.zip`
2. Apri Chrome e vai su: `chrome://extensions/`
3. Attiva **"Modalità sviluppatore"** (toggle in alto a destra)
4. Clicca **"Carica estensione non pacchettizzata"**
5. Seleziona la cartella `instagram-cleaner`
6. L'icona 🧹 apparirà nella barra delle estensioni

---

## 🚀 Utilizzo

1. Vai su **[instagram.com](https://www.instagram.com)** (devi essere loggato)
2. Clicca sull'icona dell'estensione nella barra Chrome
3. Scegli cosa vuoi rimuovere:
   - **♥ Rimuovi tutti i Like** → naviga automaticamente su `/your_activity/interactions/likes`
   - **💬 Elimina tutti i Commenti** → naviga su `/your_activity/interactions/comments`
4. L'estensione seleziona automaticamente gli elementi e clicca i bottoni di rimozione
5. Puoi **fermare** l'operazione in qualsiasi momento

---

## ⚙️ Velocità

| Modalità | Delay tra batch | Consigliato |
|----------|----------------|-------------|
| 🐢 Sicuro | 2000ms | Per account con molti elementi |
| ⚡ Normale | 1200ms | Uso quotidiano |
| 🚀 Veloce | 600ms | Rischio rate-limit |

---

## ⚠️ Note importanti

- **Non lasciare il tab in background** durante l'operazione: Instagram potrebbe non caricare gli elementi
- Se Instagram aggiorna la sua UI, alcuni selettori potrebbero smettere di funzionare
- Usa la velocità **Sicuro** se hai migliaia di like/commenti
- L'estensione **non salva** credenziali né invia dati a server esterni

---

## 🔧 Come funziona

L'estensione inietta un content script che:
1. Clicca il bottone "Seleziona" su Instagram
2. Seleziona fino a 50 elementi per volta
3. Clicca "Non mi piace più" / "Elimina"
4. Ripete il ciclo finché la pagina è vuota

---

## 🐛 Problemi comuni

**L'estensione non trova i bottoni**
→ Instagram ha aggiornato la UI. Aspetta un aggiornamento dell'estensione o apri un issue.

**Si ferma dopo il primo batch**
→ Prova la velocità "Sicuro" per dare più tempo al caricamento della pagina.

**Errore "Cannot access tab"**
→ Ricarica la pagina Instagram e riprova.
