/* 
   Fluxy Home — Servidor (Node.js + Express)
*/
const express = require("express");
const path = require("path");
require("dotenv").config();

const app = express();

// Lê o corpo das requisições em JSON
app.use(express.json());

// Serve o frontend (HTML, CSS, JS) da pasta public/
app.use(express.static(path.join(__dirname, "public")));

// Rotas da API
app.use("/api", require("./routes/auth"));
app.use("/api/lancamentos", require("./routes/lancamentos"));
app.use("/api/orcamentos", require("./routes/orcamentos"));
app.use("/api/feedback", require("./routes/feedback"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Fluxy Home rodando em http://localhost:${PORT}`);
});