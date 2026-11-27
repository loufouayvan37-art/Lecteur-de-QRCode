// Stockage de l'historique dans le navigateur (localStorage).
// Partagé entre index.html et historique.html tant qu'ils sont sur le même site.
const CLE_HISTORIQUE = "qr-historique";
const MAX_ENTREES = 500;

const Historique = {
  lire() {
    try {
      const liste = JSON.parse(localStorage.getItem(CLE_HISTORIQUE));
      return Array.isArray(liste) ? liste : [];
    } catch (e) {
      return [];
    }
  },
  ecrire(liste) {
    try {
      localStorage.setItem(CLE_HISTORIQUE, JSON.stringify(liste));
      return true;
    } catch (e) {
      return false;
    }
  },
  ajouter(texte) {
    const liste = this.lire();
    const entree = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      texte: texte,
      date: new Date().toISOString()
    };
    liste.unshift(entree);
    this.ecrire(liste.slice(0, MAX_ENTREES));
    if (CLOUD_ACTIF) {
      const file = lireFile();
      file.push({ contenu: texte, poste: CONFIG.POSTE, lu_le: entree.date });
      ecrireFile(file.slice(-2000));
      synchroniser();
    }
    return entree;
  },
  enAttente() {
    return lireFile().length;
  },
  supprimer(id) {
    this.ecrire(this.lire().filter(function (e) { return e.id !== id; }));
  },
  vider() {
    this.ecrire([]);
  }
};

function estUrl(texte) {
  try {
    const u = new URL(texte);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch (e) {
    return false;
  }
}

function formaterDate(iso) {
  return new Date(iso).toLocaleString("fr-FR", { dateStyle: "long", timeStyle: "medium" });
}

function afficherToast(message) {
  let t = document.querySelector(".toast");
  if (!t) {
    t = document.createElement("div");
    t.className = "toast";
    t.setAttribute("role", "status");
    document.body.appendChild(t);
  }
  t.textContent = message;
  t.classList.add("visible");
  clearTimeout(afficherToast.minuteur);
  afficherToast.minuteur = setTimeout(function () { t.classList.remove("visible"); }, 1800);
}

async function copierTexte(texte) {
  try {
    await navigator.clipboard.writeText(texte);
    afficherToast("Copié");
  } catch (e) {
    afficherToast("Copie impossible");
  }
}

// ---- Envoi vers le stockage en ligne ----
const CLE_ATTENTE = "qr-file-attente";

function lireFile() {
  try {
    const f = JSON.parse(localStorage.getItem(CLE_ATTENTE));
    return Array.isArray(f) ? f : [];
  } catch (e) { return []; }
}
function ecrireFile(f) {
  try { localStorage.setItem(CLE_ATTENTE, JSON.stringify(f)); } catch (e) {}
}

let synchroEnCours = false;
async function synchroniser() {
  if (!CLOUD_ACTIF || synchroEnCours) return;
  const file = lireFile();
  if (!file.length) return;
  synchroEnCours = true;
  try {
    const rep = await fetch(CONFIG.SUPABASE_URL + "/rest/v1/scans", {
      method: "POST",
      headers: {
        "apikey": CONFIG.SUPABASE_ANON_KEY,
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
      },
      body: JSON.stringify(file)
    });
    if (rep.ok) ecrireFile(lireFile().slice(file.length)); // on retire ce qui vient d'être envoyé
  } catch (e) {
    // pas de connexion : les lectures restent en file d'attente et seront renvoyées
  } finally {
    synchroEnCours = false;
  }
}

if (CLOUD_ACTIF) {
  setInterval(synchroniser, 30000);
  window.addEventListener("online", synchroniser);
  synchroniser();
}
