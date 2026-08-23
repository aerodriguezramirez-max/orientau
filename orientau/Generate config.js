// ============================================================
//  Este script corre AUTOMÁTICAMENTE en el servidor de Vercel
//  antes de publicar el sitio (es el "build"). Lee las Environment
//  Variables configuradas en Vercel → Settings → Environment
//  Variables, y con eso genera supabaseClient.js.
//
//  No edites supabaseClient.js a mano nunca más — cualquier cambio
//  se pierde en el próximo deploy, porque este script lo reescribe
//  siempre desde cero.
// ============================================================
const fs = require('fs');

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_ANON_KEY;

if (!url || !key) {
  console.error('❌ Faltan las variables de entorno SUPABASE_URL y/o SUPABASE_ANON_KEY.');
  console.error('   Ve a Vercel → Settings → Environment Variables y agrégalas.');
  process.exit(1);
}

const content = `// ⚠️ ARCHIVO GENERADO AUTOMÁTICAMENTE — no lo edites a mano.
// Los valores salen de las Environment Variables de Vercel
// (ver generate-config.js). Cualquier edición aquí se pierde
// en el próximo deploy.
const SUPABASE_URL = '${url}';
const SUPABASE_ANON_KEY = '${key}';

const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
`;

fs.writeFileSync('supabaseClient.js', content);
console.log('✅ supabaseClient.js generado correctamente desde las variables de entorno.');
