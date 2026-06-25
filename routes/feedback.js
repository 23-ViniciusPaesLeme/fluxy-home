/* 
   Fluxy Home — Rotas de feedback da comunidade
   Estas rotas são PÚBLICAS: qualquer visitante da página inicial pode
   ver e enviar comentários sobre o sistema (sem precisar de login).
*/
const express = require("express");
const pool = require("../db");

const router = express.Router();

/* Lista todos os feedbacks */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, nome, nota, comentario, DATE_FORMAT(criado_em, '%Y-%m-%dT%H:%i:%s') AS data " +
        "FROM feedback ORDER BY criado_em DESC"
    );
    res.json(rows.map((r) => ({ ...r, nota: Number(r.nota) })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao buscar feedbacks." });
  }
});

/* Registra um novo feedback */
router.post("/", async (req, res) => {
  const { nome, nota, comentario } = req.body;
  if (!(nota >= 1 && nota <= 5))
    return res.status(400).json({ erro: "Escolha de 1 a 5 estrelas." });
  if (!comentario || !comentario.trim())
    return res.status(400).json({ erro: "Escreva um comentário." });
  try {
    await pool.query(
      "INSERT INTO feedback (familia_id, nome, nota, comentario) VALUES (?, ?, ?, ?)",
      [null, (nome && nome.trim()) || "Anônimo", nota, comentario.trim()]
    );
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao enviar o feedback." });
  }
});

module.exports = router;