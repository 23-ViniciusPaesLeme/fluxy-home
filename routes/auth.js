/*
   Fluxy Home — Rotas de autenticação
*/
const express = require("express");
const crypto = require("crypto");
const pool = require("../db");
const autenticar = require("../middleware/auth");

const router = express.Router();

/* Helpers de senha (usando o módulo nativo crypto) */
function gerarHash(senha) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(senha, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
function conferirSenha(senha, armazenado) {
  const [salt, hash] = armazenado.split(":");
  const calc = crypto.scryptSync(senha, salt, 64).toString("hex");
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(calc, "hex");
  return a.length === b.length && crypto.timingSafeEqual(a, b);
}
async function criarSessao(familiaId) {
  const token = crypto.randomBytes(32).toString("hex");
  await pool.query("INSERT INTO sessoes (token, familia_id) VALUES (?, ?)", [
    token,
    familiaId,
  ]);
  return token;
}

/* Cadastro */
router.post("/register", async (req, res) => {
  const { familia, email, senha } = req.body;
  if (!familia || !familia.trim())
    return res.status(400).json({ erro: "Dê um nome para a sua família." });
  if (!email || !email.includes("@"))
    return res.status(400).json({ erro: "Digite um e-mail válido." });
  if (!senha || senha.length < 4)
    return res.status(400).json({ erro: "A senha precisa ter ao menos 4 caracteres." });

  const e = email.trim().toLowerCase();
  try {
    const [existe] = await pool.query("SELECT id FROM familias WHERE email = ?", [e]);
    if (existe.length)
      return res.status(409).json({ erro: "Já existe uma conta com esse e-mail." });

    const [r] = await pool.query(
      "INSERT INTO familias (nome, email, senha_hash) VALUES (?, ?, ?)",
      [familia.trim(), e, gerarHash(senha)]
    );
    const token = await criarSessao(r.insertId);
    res.json({ token, familia: { id: r.insertId, nome: familia.trim(), email: e } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao criar a conta." });
  }
});

/* Login */
router.post("/login", async (req, res) => {
  const { email, senha } = req.body;
  const e = (email || "").trim().toLowerCase();
  try {
    const [rows] = await pool.query("SELECT * FROM familias WHERE email = ?", [e]);
    if (!rows.length)
      return res.status(401).json({ erro: "Não encontramos uma conta com esse e-mail." });
    if (!conferirSenha(senha || "", rows[0].senha_hash))
      return res.status(401).json({ erro: "Senha incorreta. Tente de novo." });

    const token = await criarSessao(rows[0].id);
    res.json({
      token,
      familia: { id: rows[0].id, nome: rows[0].nome, email: rows[0].email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro ao entrar." });
  }
});

/* Logout */
router.post("/logout", autenticar, async (req, res) => {
  await pool.query("DELETE FROM sessoes WHERE token = ?", [req.token]);
  res.json({ ok: true });
});

/* Sessão atual (restaura o login ao abrir o app) */
router.get("/me", autenticar, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, nome, email FROM familias WHERE id = ?",
    [req.familiaId]
  );
  if (!rows.length) return res.status(404).json({ erro: "Família não encontrada." });
  res.json({ familia: rows[0] });
});

/* Conta de demonstração (cria/reaproveita e popula com exemplos) */
router.post("/demo", async (req, res) => {
  const email = "familia.demo@fluxy.app";
  try {
    let [rows] = await pool.query("SELECT * FROM familias WHERE email = ?", [email]);
    let familia;
    if (!rows.length) {
      const [r] = await pool.query(
        "INSERT INTO familias (nome, email, senha_hash) VALUES (?, ?, ?)",
        ["Família Demonstração", email, gerarHash("1234")]
      );
      familia = { id: r.insertId, nome: "Família Demonstração", email };
      await popularDemo(r.insertId);
    } else {
      familia = { id: rows[0].id, nome: rows[0].nome, email };
    }
    const token = await criarSessao(familia.id);
    res.json({ token, familia });
  } catch (err) {
    console.error(err);
    res.status(500).json({ erro: "Erro na conta de demonstração." });
  }
});

/* Dados de exemplo para a conta demo */
async function popularDemo(familiaId) {
  const ym = (delta) => {
    const d = new Date();
    d.setDate(1);
    d.setMonth(d.getMonth() + delta);
    return d.toISOString().slice(0, 7);
  };
  const m = ym(0), m1 = ym(-1), m2 = ym(-2);
  const dia = (yyyymm, d) => `${yyyymm}-${String(d).padStart(2, "0")}`;

  const trans = [
    ["receita", "salario", 2400, "Salário", dia(m, 5)],
    ["receita", "extra", 350, "Bico de fim de semana", dia(m, 12)],
    ["despesa", "moradia", 850, "Aluguel", dia(m, 6)],
    ["despesa", "alimentacao", 620, "Mercado do mês", dia(m, 8)],
    ["despesa", "contas", 180, "Luz e água", dia(m, 10)],
    ["despesa", "transporte", 220, "Passagens", dia(m, 11)],
    ["despesa", "saude", 90, "Farmácia", dia(m, 14)],
    ["despesa", "lazer", 75, "Cinema com as crianças", dia(m, 16)],
    ["receita", "salario", 2400, "Salário", dia(m1, 5)],
    ["despesa", "moradia", 850, "Aluguel", dia(m1, 6)],
    ["despesa", "alimentacao", 700, "Mercado", dia(m1, 9)],
    ["despesa", "contas", 210, "Contas", dia(m1, 10)],
    ["receita", "salario", 2400, "Salário", dia(m2, 5)],
    ["despesa", "moradia", 850, "Aluguel", dia(m2, 6)],
    ["despesa", "alimentacao", 580, "Mercado", dia(m2, 8)],
  ];
  for (const [tipo, cat, valor, desc, data] of trans) {
    await pool.query(
      "INSERT INTO transacoes (familia_id, tipo, categoria, valor, descricao, `data`) VALUES (?, ?, ?, ?, ?, ?)",
      [familiaId, tipo, cat, valor, desc, data]
    );
  }
  const orc = { moradia: 900, alimentacao: 650, transporte: 250, contas: 220, lazer: 120 };
  for (const [cat, valor] of Object.entries(orc)) {
    await pool.query(
      "INSERT INTO orcamentos (familia_id, categoria, valor) VALUES (?, ?, ?)",
      [familiaId, cat, valor]
    );
  }
}

module.exports = router;