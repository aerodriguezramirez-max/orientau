-- ============================================================
--  OrientaU – Base de Datos MySQL (v2)
--  Importar en phpMyAdmin o ejecutar en terminal MySQL:
--  mysql -u root -p < orientau.sql
-- ============================================================

CREATE DATABASE IF NOT EXISTS orientau CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE orientau;

-- ── TABLA: usuarios ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS usuarios (
    id                 INT AUTO_INCREMENT PRIMARY KEY,
    nombre             VARCHAR(120)        NOT NULL,
    email              VARCHAR(180)        NOT NULL UNIQUE,
    password           VARCHAR(255)        NOT NULL,
    ciudad             VARCHAR(100)        DEFAULT '',
    google_id          VARCHAR(64)         DEFAULT NULL UNIQUE,
    intentos_fallidos  INT                 DEFAULT 0,
    bloqueado_hasta    DATETIME            DEFAULT NULL,
    creado_en          DATETIME            DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── TABLA: sesiones_test ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS sesiones_test (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT             NOT NULL,
    puntaje         INT             DEFAULT 0,
    perfil          VARCHAR(120)    DEFAULT '',
    areas_json      TEXT,
    unis_json       TEXT,
    carreras_json   TEXT,
    analisis_ia     TEXT,
    respuestas_json TEXT,
    creado_en       DATETIME        DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── TABLA: perfiles ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS perfiles (
    id              INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id      INT             NOT NULL UNIQUE,
    avatar_emoji    VARCHAR(10)     DEFAULT '🎓',
    avatar_color    VARCHAR(20)     DEFAULT '#1976d2',
    photo_url       MEDIUMTEXT      DEFAULT '',
    bio             VARCHAR(300)    DEFAULT '',
    telefono        VARCHAR(30)     DEFAULT '',
    colegio         VARCHAR(150)    DEFAULT '',
    grado           VARCHAR(50)     DEFAULT '',
    intereses       VARCHAR(300)    DEFAULT '',
    es_nuevo        TINYINT(1)      DEFAULT 1,
    primera_visita  DATETIME        DEFAULT CURRENT_TIMESTAMP,
    actualizado_en  DATETIME        DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ── MIGRACIÓN: login con Google ───────────────────────────────
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS google_id VARCHAR(64) DEFAULT NULL UNIQUE;

-- ── MIGRACIÓN: bloqueo por intentos fallidos de login ─────────
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS intentos_fallidos INT DEFAULT 0;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS bloqueado_hasta DATETIME DEFAULT NULL;

-- ── MIGRACIÓN: agregar/ampliar photo_url ─────────────────────
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT '';
ALTER TABLE perfiles MODIFY COLUMN photo_url MEDIUMTEXT DEFAULT '';
ALTER TABLE sesiones_test ADD COLUMN IF NOT EXISTS carreras_json TEXT;

-- ── USUARIO DEMO ─────────────────────────────────────────────
INSERT INTO usuarios (nombre, email, password, ciudad)
VALUES ('Demo Estudiante', 'demo@orientau.co',
        '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Bogotá')
ON DUPLICATE KEY UPDATE id=id;
