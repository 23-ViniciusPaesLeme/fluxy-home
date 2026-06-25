/* 
   Fluxy Home — Página inicial (feedbacks)
*/
let notaSelecionada = 0;

document.addEventListener("DOMContentLoaded", () => {
  // Estrelas
  document.querySelectorAll("#estrelas .fx-estrela").forEach((b) => {
    b.addEventListener("click", () => {
      notaSelecionada = Number(b.dataset.nota);
      pintarEstrelas(notaSelecionada);
      document.getElementById("fb-erro").hidden = true;
    });
  });
  document.getElementById("btn-enviar-fb").addEventListener("click", enviarFeedback);

  carregarFeedbacks();
});

function pintarEstrelas(n) {
  document.querySelectorAll("#estrelas .fx-estrela").forEach((b) => {
    const i = b.querySelector("i");
    const ativo = Number(b.dataset.nota) <= n;
    i.className = ativo ? "bi bi-star-fill" : "bi bi-star";
    b.classList.toggle("ativa", ativo);
  });
}

function estrelasMiniHTML(nota) {
  return [1, 2, 3, 4, 5]
    .map((n) => `<i class="bi ${nota >= n - 0.5 ? "bi-star-fill" : "bi-star"} fx-mini-star"></i>`)
    .join("");
}

const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

async function carregarFeedbacks() {
  const alvo = document.getElementById("lista-feedback");
  let lista = [];
  try {
    lista = await Api.getFeedback();
  } catch (e) {
    alvo.innerHTML = `<p class="fx-vazio">Não foi possível carregar os comentários.</p>`;
    return;
  }

  if (!lista.length) {
    alvo.innerHTML = `<div class="lp-fb-vazio"><i class="bi bi-chat-square-text"></i><p>Ainda não há comentários. Seja o primeiro a avaliar!</p></div>`;
    return;
  }

  const media = lista.reduce((s, f) => s + f.nota, 0) / lista.length;
  alvo.innerHTML = `
    <div class="fx-fb-resumo">
      <div><span class="fx-fb-media">${media.toFixed(1)}</span><span class="fx-fb-media-max">/5</span></div>
      <div class="fx-fb-estrelas-mini">${estrelasMiniHTML(media)}<span class="fx-fb-total">${lista.length} ${lista.length === 1 ? "comentário" : "comentários"}</span></div>
    </div>
    <ul class="fx-fb-lista">${lista.map((f) => `
      <li class="fx-fb-item">
        <div class="fx-fb-item-topo">
          <div class="fx-fb-estrelas-mini">${estrelasMiniHTML(f.nota)}</div>
          <span class="fx-fb-data">${new Date(f.data).toLocaleDateString("pt-BR")}</span>
        </div>
        <p class="fx-fb-comentario">"${esc(f.comentario)}"</p>
        <span class="fx-fb-nome">— ${esc(f.nome)}</span>
      </li>`).join("")}</ul>`;
}

async function enviarFeedback() {
  const comentario = document.getElementById("fb-comentario").value.trim();
  const erroEl = document.getElementById("fb-erro");
  if (!notaSelecionada) {
    erroEl.textContent = "Escolha de 1 a 5 estrelas.";
    erroEl.hidden = false;
    return;
  }
  if (!comentario) {
    erroEl.textContent = "Escreva um comentário sobre o app.";
    erroEl.hidden = false;
    return;
  }
  try {
    await Api.addFeedback({
      nome: document.getElementById("fb-nome").value.trim(),
      nota: notaSelecionada,
      comentario,
    });
    document.getElementById("bloco-form-fb").innerHTML = `
      <div class="fx-fb-ok">
        <span class="fx-fb-ok-ico"><i class="bi bi-check-lg"></i></span>
        <strong>Obrigado pelo seu comentário!</strong>
        <span>Sua avaliação foi registrada.</span>
      </div>`;
    carregarFeedbacks();
  } catch (e) {
    erroEl.textContent = e.message;
    erroEl.hidden = false;
  }
}
