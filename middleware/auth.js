/* 
   Fluxy Home — Middleware de autenticação
   Verifica o token enviado no cabeçalho Authorization: Bearer <token>
   e identifica a família dona da sessão.
*/
const pool = require("../db");

module.exports = async function autenticar(req, res, next) {
  const cabecalho = req.headers["authorization"] || "";
  const token = cabecalho.startsWith("Bearer ") ? cabecalho.slice(7) : null;

  if (!token) return res.status(401).json({ erro: "Não autenticado." });

  try {
    const [rows] = await pool.query(
      "SELECT familia_id FROM sessoes WHERE token = ?",
      [token]
    );
    if (!rows.length) return res.status(401).json({ erro: "Sessão inválida." });
    req.familiaId = rows[0].familia_id;
    req.token = token;
    next();
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro de autenticação." });
  }
};