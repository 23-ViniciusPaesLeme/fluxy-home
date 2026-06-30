/* ==========================================================================
   Fluxy Home — Página de estatísticas (acesso por senha)
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-acessar").addEventListener("click", acessar);
  document.getElementById("in-senha").addEventListener("keydown", (e) => {
    if (e.key === "Enter") acessar();
  });
});

async function acessar() {
  const senha = document.getElementById("in-senha").value;
  const erroEl = document.getElementById("st-erro");
  erroEl.hidden = true;

  try {
    const r = await fetch("/api/estatisticas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ senha }),
    });
    const dados = await r.json();

    if (!r.ok) {
      erroEl.textContent = dados.erro || "Não foi possível acessar.";
      erroEl.hidden = false;
      return;
    }

    // mostra o painel com os números
    document.getElementById("login-box").hidden = true;
    document.getElementById("stats-box").hidden = false;
    document.getElementById("st-familias").textContent = dados.familias;
    document.getElementById("st-lancamentos").textContent = dados.lancamentos;
    document.getElementById("st-feedbacks").textContent = dados.feedbacks;
    document.getElementById("st-nota").textContent =
      dados.feedbacks > 0 ? dados.notaMedia + " / 5" : "—";
    document.getElementById("st-data").textContent =
      "Atualizado em " + new Date().toLocaleString("pt-BR");
  } catch (e) {
    erroEl.textContent = "Erro de conexão com o servidor.";
    erroEl.hidden = false;
  }
}