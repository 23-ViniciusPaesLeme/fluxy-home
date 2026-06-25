-- Fluxy Home — Estrutura do banco de dados (MySQL)
-- Execute este script uma vez para criar o banco e as tabelas.
-- No terminal:  mysql -u root -p < database.sql

CREATE DATABASE IF NOT EXISTS fluxy_home
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fluxy_home;

-- Famílias (contas de acesso)
CREATE TABLE IF NOT EXISTS familias (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  nome        VARCHAR(120) NOT NULL,
  email       VARCHAR(160) NOT NULL UNIQUE,
  senha_hash  VARCHAR(255) NOT NULL,
  criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Lançamentos (receitas e despesas)
CREATE TABLE IF NOT EXISTS transacoes (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  familia_id  INT NOT NULL,
  tipo        ENUM('receita','despesa') NOT NULL,
  categoria   VARCHAR(40) NOT NULL,
  valor       DECIMAL(10,2) NOT NULL,
  descricao   VARCHAR(255),
  `data`      DATE NOT NULL,
  criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
);

-- Orçamentos (metas de gasto por categoria)
CREATE TABLE IF NOT EXISTS orcamentos (
  familia_id  INT NOT NULL,
  categoria   VARCHAR(40) NOT NULL,
  valor       DECIMAL(10,2) NOT NULL,
  PRIMARY KEY (familia_id, categoria),
  FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
);

-- Feedback da comunidade
CREATE TABLE IF NOT EXISTS feedback (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  familia_id  INT,
  nome        VARCHAR(120),
  nota        TINYINT NOT NULL,
  comentario  TEXT NOT NULL,
  criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE SET NULL
);

-- Sessões (tokens de login)
CREATE TABLE IF NOT EXISTS sessoes (
  token       CHAR(64) PRIMARY KEY,
  familia_id  INT NOT NULL,
  criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
);