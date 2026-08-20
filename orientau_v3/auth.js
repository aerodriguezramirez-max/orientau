// ============================================================
//  OrientaU – Autenticación
//  Archivo: auth.js
// ============================================================

const API = 'api';

// ── Login con Google ─────────────────────────────────────────
// ⚠️ Debe ser EXACTAMENTE el mismo Client ID que en api/google_login.php
const GOOGLE_CLIENT_ID = '861168643782-0f09ip4ofkt18ln8qqqahc6t2rbq66ej.apps.googleusercontent.com';

function initGoogleSignIn() {
  if (typeof google === 'undefined' || !google.accounts || !google.accounts.id) {
    setTimeout(initGoogleSignIn, 150); // la librería de Google carga async, reintenta
    return;
  }
  if (GOOGLE_CLIENT_ID.startsWith('TU_GOOGLE_CLIENT_ID')) {
    return; // sin configurar todavía — no se muestra el botón, no rompe nada
  }
  google.accounts.id.initialize({
    client_id: GOOGLE_CLIENT_ID,
    callback: handleGoogleCredential
  });
  const btn = document.getElementById('googleSignInBtn');
  if (btn) {
    google.accounts.id.renderButton(btn, {
      theme: 'filled_black', size: 'large', width: 300, text: 'continue_with', locale: 'es'
    });
  }
}
// Desactivado por ahora junto con el botón de Google en login.html
// document.addEventListener('DOMContentLoaded', initGoogleSignIn);

async function handleGoogleCredential(response) {
  try {
    const res = await apiPost('google_login.php', { credential: response.credential });
    if (!res.ok) { showAlert(res.msg, 'error'); return; }
    sessionStorage.setItem('orientau_user', JSON.stringify(res.user));
    window.location.href = 'index.html';
  } catch (e) {
    showAlert('Error de conexión con Google. ¿Está XAMPP corriendo?', 'error');
  }
}

// ── Partículas ───────────────────────────────────────────────
(()=>{
  const c = document.getElementById('particles');
  for(let i = 0; i < 22; i++){
    const d = document.createElement('div');
    d.className = 'particle';
    const sz = Math.random() * 6 + 3;
    d.style.cssText = `width:${sz}px;height:${sz}px;left:${Math.random()*100}%;animation-duration:${Math.random()*18+12}s;animation-delay:${Math.random()*15}s`;
    c.appendChild(d);
  }
})();

// ── Tabs ─────────────────────────────────────────────────────
function switchTab(tab){
  document.querySelectorAll('.tab-btn').forEach((b,i) => b.classList.toggle('active', i === (tab==='login' ? 0 : 1)));
  document.getElementById('formLogin').style.display    = tab === 'login'    ? 'block' : 'none';
  document.getElementById('formRegister').style.display = tab === 'register' ? 'block' : 'none';
  document.getElementById('authAlert').className = 'alert';
}

// ── Alertas ──────────────────────────────────────────────────
function showAlert(msg, type){
  const a = document.getElementById('authAlert');
  a.textContent = msg;
  a.className = `alert ${type} show`;
}

// ── API ───────────────────────────────────────────────────────
async function apiPost(endpoint, data){
  const r = await fetch(`${API}/${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return r.json();
}

// ── Login ─────────────────────────────────────────────────────
async function doLogin(){
  const email = document.getElementById('loginEmail').value.trim();
  const pass  = document.getElementById('loginPass').value;
  if(!email || !pass){ showAlert('Por favor completa todos los campos.', 'error'); return; }

  const btn = document.getElementById('btnLogin');
  btn.disabled = true; btn.textContent = 'Verificando...';

  try {
    const { data, error } = await sb.auth.signInWithPassword({ email, password: pass });
    if(error){
      showAlert(error.message === 'Invalid login credentials' ? 'Correo o contraseña incorrectos.' : error.message, 'error');
    } else {
      await guardarUsuarioEnSesion(data.user);
      window.location.href = 'index.html';
    }
  } catch(e){ showAlert('Error de conexión. Revisa tu internet.', 'error'); }

  btn.disabled = false; btn.textContent = 'Ingresar';
}

// Trae nombre/ciudad de la tabla "perfiles" y arma el MISMO objeto que ya
// usaba el resto de la app (app.js sigue leyendo esto tal cual de sessionStorage)
async function guardarUsuarioEnSesion(user){
  const { data: perfil } = await sb.from('perfiles').select('nombre, ciudad').eq('id', user.id).single();
  const usuario = {
    id:     user.id,
    nombre: (perfil && perfil.nombre) || user.email.split('@')[0],
    email:  user.email,
    ciudad: (perfil && perfil.ciudad) || '',
    demo:   false
  };
  sessionStorage.setItem('orientau_user', JSON.stringify(usuario));
}

// ── Demo login ────────────────────────────────────────────────
function demoLogin(){
  const demoUser = {
    id:     0,
    nombre: 'Demo Estudiante',
    email:  'demo@orientau.co',
    ciudad: 'Colombia',
    demo:   true
  };
  sessionStorage.setItem('orientau_user', JSON.stringify(demoUser));
  window.location.href = 'index.html';
}

// ── Registro ──────────────────────────────────────────────────
async function doRegister(){
  const nombre = document.getElementById('regName').value.trim();
  const email  = document.getElementById('regEmail').value.trim();
  const ciudad = document.getElementById('regCity').value;
  const pass   = document.getElementById('regPass').value;

  if(!nombre || !email || !ciudad || !pass){ showAlert('Por favor completa todos los campos.', 'error'); return; }
  if(pass.length < 6){ showAlert('La contraseña debe tener mínimo 6 caracteres.', 'error'); return; }
  if(!document.getElementById('regAcceptTerms').checked){
    showAlert('Debes aceptar los Términos y la Política de Tratamiento de Datos para continuar.', 'error');
    return;
  }

  const btn = document.getElementById('btnRegister');
  btn.disabled = true; btn.textContent = 'Creando cuenta...';

  try {
    const { data, error } = await sb.auth.signUp({
      email, password: pass,
      options: { data: { nombre } }   // el trigger en Supabase usa esto para crear el perfil solo
    });
    if(error){
      showAlert(error.message === 'User already registered' ? 'Ese correo ya está registrado.' : error.message, 'error');
    } else {
      if(data.user){
        await sb.from('perfiles').update({ ciudad }).eq('id', data.user.id);
      }
      showAlert('¡Cuenta creada! Revisa tu correo para confirmarla, luego inicia sesión.', 'success');
      setTimeout(() => { switchTab('login'); document.getElementById('authAlert').className = 'alert'; }, 1800);
    }
  } catch(e){ showAlert('Error de conexión. Revisa tu internet.', 'error'); }

  btn.disabled = false; btn.textContent = 'Crear Cuenta';
}

// ── Recuperar Contraseña ──────────────────────────────────────
function openForgotModal(){
  const overlay = document.getElementById('forgotOverlay');
  overlay.style.display = 'flex';
  const loginEmail = document.getElementById('loginEmail').value.trim();
  if(loginEmail) document.getElementById('forgotEmail').value = loginEmail;
  document.getElementById('forgotStep1').style.display = 'block';
  document.getElementById('forgotStep2').style.display = 'none';
  document.getElementById('forgotAlert').className = 'alert';
}

function closeForgotModal(){
  document.getElementById('forgotOverlay').style.display = 'none';
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('forgotOverlay').addEventListener('click', function(e){
    if(e.target === this) closeForgotModal();
  });
});

async function doForgot(){
  const email   = document.getElementById('forgotEmail').value.trim();
  const alertEl = document.getElementById('forgotAlert');

  if(!email){
    alertEl.textContent = 'Por favor ingresa tu correo.';
    alertEl.className = 'alert error show';
    return;
  }
  if(!email.includes('@')){
    alertEl.textContent = 'Ingresa un correo válido.';
    alertEl.className = 'alert error show';
    return;
  }

  const btn = document.getElementById('btnForgot');
  btn.disabled = true;
  btn.textContent = 'Enviando...';
  alertEl.className = 'alert';

  try {
    const redirectTo = window.location.href.replace('login.html', 'reset_password.html');
    const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo });

    if(error){
      alertEl.textContent = error.message;
      alertEl.className = 'alert error show';
    } else {
      document.getElementById('forgotStep1').style.display = 'none';
      document.getElementById('forgotStep2').style.display = 'block';
    }
  } catch(e){
    alertEl.textContent = 'Error de conexión. Revisa tu internet.';
    alertEl.className = 'alert error show';
  }

  btn.disabled = false;
  btn.textContent = 'Enviar enlace de recuperación';
}
