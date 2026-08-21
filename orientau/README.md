# 🎓 OrientaU – Test Vocacional con IA
### Instalación con XAMPP (PHP + MySQL)

---

## 📁 Estructura del Proyecto

```
orientau/
│
├── index.html          ← Aplicación principal (abrir en navegador)
├── orientau.sql        ← Script SQL para crear la base de datos
│
└── api/
    ├── config.php      ← Configuración de conexión MySQL
    ├── login.php       ← Endpoint: iniciar sesión
    ├── register.php    ← Endpoint: registrar usuario
    ├── save_session.php← Endpoint: guardar resultado del test
    └── get_sessions.php← Endpoint: obtener historial del usuario
```

---

## 🚀 Instalación Paso a Paso

### PASO 1 — Instalar XAMPP
Descarga e instala XAMPP desde: https://www.apachefriends.org/
- Versión recomendada: PHP 8.x

### PASO 2 — Copiar el proyecto
Copia toda la carpeta `orientau/` dentro de:
```
C:\xampp\htdocs\orientau\
```
Debe quedar así:
```
C:\xampp\htdocs\orientau\index.html
C:\xampp\htdocs\orientau\orientau.sql
C:\xampp\htdocs\orientau\api\config.php
C:\xampp\htdocs\orientau\api\login.php
...
```

### PASO 3 — Iniciar servicios en XAMPP
Abre el **Panel de Control de XAMPP** y haz clic en **Start** para:
- ✅ Apache
- ✅ MySQL

### PASO 4 — Crear la base de datos
1. Abre tu navegador y entra a: http://localhost/phpmyadmin
2. Haz clic en la pestaña **"SQL"**
3. Copia y pega todo el contenido del archivo `orientau.sql`
4. Haz clic en **"Continuar"** o **"Go"**
5. Verás que se creó la base de datos `orientau` con las tablas:
   - `usuarios`
   - `sesiones_test`

### PASO 5 — Verificar configuración (opcional)
Abre `api/config.php` y verifica:
```php
define('DB_HOST', 'localhost');  // No cambiar
define('DB_NAME', 'orientau');   // No cambiar
define('DB_USER', 'root');       // Usuario XAMPP (por defecto: root)
define('DB_PASS', '');           // Contraseña (por defecto vacía en XAMPP)
```
Si tienes contraseña en MySQL, escríbela en DB_PASS.

### PASO 6 — Abrir la aplicación
En tu navegador entra a:
```
http://localhost/orientau/index.html
```

---

## 👤 Cuenta Demo
La base de datos incluye una cuenta de prueba lista para usar:

| Campo      | Valor              |
|------------|--------------------|
| Correo     | demo@orientau.co   |
| Contraseña | demo123            |

---

## 🗄️ ¿Qué guarda la base de datos?

### Tabla `usuarios`
| Campo      | Descripción                    |
|------------|--------------------------------|
| id         | ID único del usuario           |
| nombre     | Nombre completo                |
| email      | Correo (único, no se repite)   |
| password   | Contraseña encriptada (bcrypt) |
| ciudad     | Ciudad del estudiante          |
| creado_en  | Fecha de registro              |

### Tabla `sesiones_test`
| Campo           | Descripción                          |
|-----------------|--------------------------------------|
| id              | ID único del resultado               |
| usuario_id      | Referencia al usuario                |
| puntaje         | Puntaje obtenido (0-100)             |
| perfil          | Perfil vocacional (texto)            |
| areas_json      | Puntajes por área (JSON)             |
| unis_json       | Universidades recomendadas (JSON)    |
| analisis_ia     | Análisis generado por IA             |
| respuestas_json | Respuestas del test (JSON)           |
| creado_en       | Fecha del test                       |

---

## ❓ Solución de Problemas

**"Error de conexión. ¿Está XAMPP corriendo?"**
→ Verifica que Apache y MySQL estén en verde en el panel XAMPP.

**"Error de conexión a la base de datos"**
→ Abre phpMyAdmin y verifica que exista la base de datos `orientau`.
→ Revisa usuario y contraseña en `api/config.php`.

**La página no carga**
→ Verifica que la carpeta esté en `C:\xampp\htdocs\orientau\`
→ La URL debe ser `http://localhost/orientau/index.html`

**El análisis de IA no aparece / aparece texto genérico**
→ El análisis de IA requiere conexión a internet para llamar a la API de Claude.
→ Si no hay internet, se mostrará un análisis predeterminado igualmente útil.

---

## 🔒 Seguridad Implementada
- ✅ Contraseñas encriptadas con **bcrypt** (PHP `password_hash`)
- ✅ Consultas con **PDO + prepared statements** (previene SQL injection)
- ✅ Validación de datos en servidor (PHP) y cliente (JS)
- ✅ Emails únicos: no se pueden registrar dos veces con el mismo correo
