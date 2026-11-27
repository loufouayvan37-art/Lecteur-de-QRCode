// Réglages du stockage en ligne (Supabase).
// Laissez SUPABASE_URL et SUPABASE_ANON_KEY vides pour garder l'historique uniquement
// dans le navigateur de l'appareil.
const CONFIG = {
  SUPABASE_URL: "",        // ex. "https://abcdxyz.supabase.co"
  SUPABASE_ANON_KEY: "",   // clé « anon » / « publishable » du projet
  POSTE: "Entrée principale" // nom affiché dans l'historique pour cet appareil
};
const CLOUD_ACTIF = !!(CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY);
