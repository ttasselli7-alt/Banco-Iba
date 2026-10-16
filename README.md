# Banco IBA

App per barman con le ricette ufficiali IBA, flashcard, quiz ed esame finale.
Si apre solo con il codice di accesso: questo repository contiene l'app **cifrata** (`app.enc`, AES-256-GCM con chiave ricavata dal codice tramite PBKDF2-SHA256, 600.000 iterazioni). Ricette e codice sorgente non sono pubblicati.

Link: https://ttasselli7-alt.github.io/Banco-Iba/

## Installare sul telefono
- **iPhone (Safari):** apri il link, tocca Condividi e poi "Aggiungi alla schermata Home".
- **Android (Chrome):** apri il link, tocca ⋮ e poi "Installa app".

## Protezioni
- Content Security Policy rigida: nessuno script, stile, font o immagine da altri siti; niente form o frame verso l'esterno.
- Nessun servizio di terze parti: font e icone sono serviti da qui.
- La cache offline contiene solo i file di questo sito, e l'app resta cifrata anche lì.
- `robots.txt` e `noindex` per tenerla fuori dai motori di ricerca.
