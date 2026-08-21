
// 👇 PASO 1: pega aquí tu Project URL (algo como https://abcdefgh.supabase.co)
const SUPABASE_URL = process.env.SUPABASE_URL;

// 👇 PASO 2: pega aquí tu anon key o Publishable key (la cadena larga)
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;


if (SUPABASE_URL.includes('PEGA_TU_') || SUPABASE_ANON_KEY.includes('PEGA_TU_')) {
  alert('⚠️ Falta configurar Supabase: abre supabaseClient.js y pega tu URL y tu key reales (líneas marcadas con 👇).');
}

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
