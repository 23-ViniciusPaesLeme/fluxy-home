/*
   Fluxy Home — Rotas de lançamentos (receitas e despesas)
*/
const express = require("express");
const pool = require("../db");
const autenticar = require("../middleware/auth");

const router = express.Router();
router.use(autenticar); // todas as rotas exigem login

/* Lista todos os lançamentos da família */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, tipo, categoria, valor, descricao, DATE_FORMAT(`data`, '%Y-%m-%d') AS data " +
        "FROM transacoes WHERE familia_id = ? ORDER BY `data` DESC, id DESC",
      [req.familiaId]
    );
    res.json(rows.map((r) => ({ ...r, valor: Number(r.valor) })));
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao buscar lançamentos." });
  }
});

/* Cria um novo lançamento */
router.post("/", async (req, res) => {
  const { tipo, categoria, valor, descricao, data } = req.body;
  if (!["receita", "despesa"].includes(tipo))
    return res.status(400).json({ erro: "Tipo inválido." });
  if (!categoria || !(Number(valor) > 0) || !data)
    return res.status(400).json({ erro: "Preencha valor, categoria e data." });

  try {
    const [r] = await pool.query(
      "INSERT INTO transacoes (familia_id, tipo, categoria, valor, descricao, `data`) VALUES (?, ?, ?, ?, ?, ?)",
      [req.familiaId, tipo, categoria, Number(valor), (descricao || "").trim() || null, data]
    );
    res.json({ id: r.insertId });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao salvar o lançamento." });
  }
});

/* Exclui um lançamento da própria família */
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM transacoes WHERE id = ? AND familia_id = ?", [
      req.params.id,
      req.familiaId,
    ]);
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao excluir." });
  }
});

module.exports = router;