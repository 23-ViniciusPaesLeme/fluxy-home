/* 
   Fluxy Home — Conexão com o banco de dados MySQL
*/
const mysql = require("mysql2/promise");
require("dotenv").config();
 
const config = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "fluxy_home",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};
 
// Alguns serviços de nuvem (ex.: Aiven) exigem conexão segura (SSL).
if (process.env.DB_SSL === "true") {
  config.ssl = { rejectUnauthorized: false };
}
 
const pool = mysql.createPool(config);
 
module.exports = pool;