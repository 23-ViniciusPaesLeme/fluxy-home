/* 
   Fluxy Home — Criação automática das tabelas
   Roda na inicialização do servidor e cria as tabelas caso ainda não existam.
   Assim, na nuvem (onde o banco já vem criado) não é preciso rodar o
   database.sql manualmente.
*/
const pool = require("./db");

const tabelas = [
  `CREATE TABLE IF NOT EXISTS familias (
     id          INT AUTO_INCREMENT PRIMARY KEY,
     nome        VARCHAR(120) NOT NULL,
     email       VARCHAR(160) NOT NULL UNIQUE,
     senha_hash  VARCHAR(255) NOT NULL,
     criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   )`,
  `CREATE TABLE IF NOT EXISTS transacoes (
     id          INT AUTO_INCREMENT PRIMARY KEY,
     familia_id  INT NOT NULL,
     tipo        ENUM('receita','despesa') NOT NULL,
     categoria   VARCHAR(40) NOT NULL,
     valor       DECIMAL(10,2) NOT NULL,
     descricao   VARCHAR(255),
     \`data\`     DATE NOT NULL,
     criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
   )`,
  `CREATE TABLE IF NOT EXISTS orcamentos (
     familia_id  INT NOT NULL,
     categoria   VARCHAR(40) NOT NULL,
     valor       DECIMAL(10,2) NOT NULL,
     PRIMARY KEY (familia_id, categoria),
     FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
   )`,
  `CREATE TABLE IF NOT EXISTS feedback (
     id          INT AUTO_INCREMENT PRIMARY KEY,
     familia_id  INT,
     nome        VARCHAR(120),
     nota        TINYINT NOT NULL,
     comentario  TEXT NOT NULL,
     criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE SET NULL
   )`,
  `CREATE TABLE IF NOT EXISTS sessoes (
     token       CHAR(64) PRIMARY KEY,
     familia_id  INT NOT NULL,
     criado_em   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     FOREIGN KEY (familia_id) REFERENCES familias(id) ON DELETE CASCADE
   )`,
];

module.exports = async function initDB() {
  for (const sql of tabelas) {
    await pool.query(sql);
  }
  console.log("Banco pronto: tabelas verificadas/criadas.");
};