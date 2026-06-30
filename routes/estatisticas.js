/* 
   Fluxy Home — Rota de estatísticas (protegida por senha)
   Retorna os totais de uso do sistema, para a documentação do projeto.
   A senha é definida na variável de ambiente STATS_PASSWORD.
*/
const express = require("express");
const pool = require("../db");

const router = express.Router();

router.post("/", async (req, res) => {
  const senha = (req.body && req.body.senha) || "";
  const correta = process.env.STATS_PASSWORD;

  if (!correta) {
    return res.status(503).json({
      erro: "Estatísticas não configuradas (defina STATS_PASSWORD no servidor).",
    });
  }
  if (senha !== correta) {
    return res.status(401).json({ erro: "Senha incorreta." });
  }

  try {
    const [fam] = await pool.query("SELECT COUNT(*) AS total FROM familias");
    const [lan] = await pool.query("SELECT COUNT(*) AS total FROM transacoes");
    const [fb] = await pool.query(
      "SELECT COUNT(*) AS total, ROUND(AVG(nota), 1) AS media FROM feedback"
    );

    res.json({
      familias: fam[0].total,
      lancamentos: lan[0].total,
      feedbacks: fb[0].total,
      notaMedia: fb[0].media || 0,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ erro: "Erro ao buscar as estatísticas." });
  }
});

module.exports = router;