/* 
   Fluxy Home — Rotas de orçamentos (metas do planejamento familiar)
*/
const express = require("express");
const pool = require("../db");
const autenticar = require("../middleware/auth");

const router = express.Router();
router.use(autenticar);

/* Retorna as metas como objeto { categoria: valor } */
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT categoria, valor FROM orcamentos WHERE familia_id = ?",
      [req.familiaId]
    );
    const obj = {};
    rows.forEach((r) => (obj[r.categoria] = Number(r.valor)));
    res.json(obj);
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao buscar o planejamento." });
  }
});

/* Define (ou remove, se valor 0) a meta de uma categoria */
router.put("/", async (req, res) => {
  const { categoria, valor } = req.body;
  if (!categoria) return res.status(400).json({ erro: "Categoria obrigatória." });
  const v = Number(valor) || 0;
  try {
    if (v <= 0) {
      await pool.query(
        "DELETE FROM orcamentos WHERE familia_id = ? AND categoria = ?",
        [req.familiaId, categoria]
      );
    } else {
      await pool.query(
        "INSERT INTO orcamentos (familia_id, categoria, valor) VALUES (?, ?, ?) " +
          "ON DUPLICATE KEY UPDATE valor = ?",
        [req.familiaId, categoria, v, v]
      );
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao salvar o planejamento." });
  }
});

module.exports = router;