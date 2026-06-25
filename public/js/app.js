/* Configuração de categorias */
const CAT_DESPESA = [
  { id: "moradia", nome: "Moradia", cor: "#E2613E" },
  { id: "alimentacao", nome: "Alimentação", cor: "#E58A3C" },
  { id: "transporte", nome: "Transporte", cor: "#C9543E" },
  { id: "saude", nome: "Saúde", cor: "#D9476A" },
  { id: "educacao", nome: "Educação", cor: "#6C6FE0" },
  { id: "contas", nome: "Contas (água, luz...)", cor: "#3E9BE2" },
  { id: "lazer", nome: "Lazer", cor: "#9B5DE5" },
  { id: "outros_d", nome: "Outros", cor: "#7A8A80" },
];
const CAT_RECEITA = [
  { id: "salario", nome: "Salário", cor: "#1FA971" },
  { id: "extra", nome: "Renda extra", cor: "#2FB380" },
  { id: "beneficio", nome: "Benefício", cor: "#4CC38A" },
  { id: "outros_r", nome: "Outros", cor: "#79C9A4" },
];
const catMap = {};
[...CAT_DESPESA, ...CAT_RECEITA].forEach((c) => (catMap[c.id] = c));

/* Utilitários */
const MESES = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const brl = (v) => (v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const hoje = () => new Date().toISOString().slice(0, 10);
const mesAtual = () => new Date().toISOString().slice(0, 7);
const rotuloMes = (ym) => {
  const [a, m] = ym.split("-");
  return `${MESES[Number(m) - 1]}/${a}`;
};
const passoMes = (ym, delta) => {
  const [a, m] = ym.split("-").map(Number);
  return new Date(a, m - 1 + delta, 1).toISOString().slice(0, 7);
};
const esc = (s) =>
  String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c])
  );

/* Estado */
const estado = {
  familia: null,
  mes: mesAtual(),
  view: "painel",
  modoAuth: "entrar",
  cache: { transacoes: [], orcamentos: {} },
};
let modalLancamento = null;
let tipoLancamento = "despesa";
let graficoPizza = null;
let graficoBarras = null;

/*
   INICIALIZAÇÃO
*/
document.addEventListener("DOMContentLoaded", async () => {
  modalLancamento = new bootstrap.Modal(document.getElementById("modalLancamento"));
  configurarAuth();
  configurarApp();

  if (Api.getToken()) {
    try {
      const { familia } = await Api.eu();
      estado.familia = familia;
      await abrirApp();
    } catch (e) {
      Api.limparToken();
    }
  }
});

/*
   AUTENTICAÇÃO
*/
function configurarAuth() {
  document.querySelectorAll(".fx-tab").forEach((tab) => {
    tab.addEventListener("click", () => trocarModoAuth(tab.dataset.modo));
  });
  document.getElementById("form-auth").addEventListener("submit", (e) => {
    e.preventDefault();
    estado.modoAuth === "entrar" ? entrar() : criarConta();
  });
  document.getElementById("btn-demo").addEventListener("click", entrarDemo);
}

function trocarModoAuth(modo) {
  estado.modoAuth = modo;
  document.querySelectorAll(".fx-tab").forEach((t) =>
    t.classList.toggle("is-on", t.dataset.modo === modo)
  );
  document.getElementById("campo-familia").hidden = modo !== "criar";
  document.getElementById("btn-auth").textContent = modo === "entrar" ? "Entrar" : "Criar conta";
  mostrarErroAuth("");
}

function mostrarErroAuth(msg) {
  const el = document.getElementById("auth-erro");
  el.textContent = msg;
  el.hidden = !msg;
}

async function entrar() {
  const email = document.getElementById("in-email").value;
  const senha = document.getElementById("in-senha").value;
  try {
    const { token, familia } = await Api.login(email, senha);
    Api.setToken(token);
    estado.familia = familia;
    await abrirApp();
  } catch (e) {
    mostrarErroAuth(e.message);
  }
}

async function criarConta() {
  const familia = document.getElementById("in-familia").value;
  const email = document.getElementById("in-email").value;
  const senha = document.getElementById("in-senha").value;
  try {
    const r = await Api.registrar(familia, email, senha);
    Api.setToken(r.token);
    estado.familia = r.familia;
    await abrirApp();
  } catch (e) {
    mostrarErroAuth(e.message);
  }
}

async function entrarDemo() {
  try {
    const { token, familia } = await Api.demo();
    Api.setToken(token);
    estado.familia = familia;
    await abrirApp();
  } catch (e) {
    mostrarErroAuth(e.message);
  }
}

async function sair() {
  await Api.logout();
  Api.limparToken();
  estado.familia = null;
  document.getElementById("tela-app").classList.add("d-none");
  document.getElementById("tela-auth").style.display = "";
  document.getElementById("form-auth").reset();
  mostrarErroAuth("");
}

/*
   APP — esqueleto, cabeçalho e navegação
*/
function configurarApp() {
  document.getElementById("btn-sair").addEventListener("click", sair);
  document.getElementById("mes-anterior").addEventListener("click", () => mudarMes(-1));
  document.getElementById("mes-proximo").addEventListener("click", () => mudarMes(1));

  document.querySelectorAll(".fx-nav-item").forEach((b) => {
    b.addEventListener("click", () => irPara(b.dataset.view));
  });

  document.querySelectorAll(".fx-toggle button").forEach((b) => {
    b.addEventListener("click", () => definirTipoLancamento(b.dataset.tipo));
  });
  document.getElementById("btn-salvar-lancamento").addEventListener("click", salvarLancamento);
}

async function abrirApp() {
  document.getElementById("tela-auth").style.display = "none";
  document.getElementById("tela-app").classList.remove("d-none");
  document.getElementById("familia-nome").textContent = estado.familia.nome;
  estado.view = "painel";
  atualizarNav();
  document.getElementById("mes-rotulo").textContent = rotuloMes(estado.mes);
  document.getElementById("conteudo").innerHTML = `<p class="fx-vazio">Carregando…</p>`;
  await recarregar();
  renderConteudo();
}

async function recarregar() {
  try {
    const [transacoes, orcamentos] = await Promise.all([
      Api.getLancamentos(),
      Api.getOrcamentos(),
    ]);
    estado.cache = { transacoes, orcamentos };
  } catch (e) {
    if (e.status === 401) return sair();
    console.error(e);
  }
}

async function aposMutacao() {
  await recarregar();
  renderConteudo();
}

function atualizarMes() {
  document.getElementById("mes-rotulo").textContent = rotuloMes(estado.mes);
  renderConteudo();
}
function mudarMes(delta) {
  estado.mes = passoMes(estado.mes, delta);
  atualizarMes();
}
function irPara(view) {
  estado.view = view;
  atualizarNav();
  renderConteudo();
}
function atualizarNav() {
  document.querySelectorAll(".fx-nav-item").forEach((b) =>
    b.classList.toggle("is-on", b.dataset.view === estado.view)
  );
}

/* acesso aos dados (cache) */
function dados() {
  return estado.cache;
}
function resumoMes(transacoes, mes) {
  const doMes = transacoes.filter((t) => t.data.startsWith(mes));
  const receitas = doMes.filter((t) => t.tipo === "receita").reduce((s, t) => s + t.valor, 0);
  const despesas = doMes.filter((t) => t.tipo === "despesa").reduce((s, t) => s + t.valor, 0);
  return { doMes, receitas, despesas, saldo: receitas - despesas };
}

/*
   ROTEAMENTO DE VIEWS
*/
function renderConteudo() {
  if (graficoPizza) { graficoPizza.destroy(); graficoPizza = null; }
  if (graficoBarras) { graficoBarras.destroy(); graficoBarras = null; }

  const v = estado.view;
  if (v === "painel") renderPainel();
  else if (v === "lancamentos") renderLancamentos();
  else if (v === "planejamento") renderPlanejamento();
  else if (v === "relatorios") renderRelatorios();
}

/* PAINEL */
function renderPainel() {
  const { doMes, receitas, despesas, saldo } = resumoMes(dados().transacoes, estado.mes);
  const total = receitas + despesas;
  const pctReceita = total ? (receitas / total) * 100 : 50;

  const porCat = {};
  doMes.filter((t) => t.tipo === "despesa").forEach((t) => {
    porCat[t.categoria] = (porCat[t.categoria] || 0) + t.valor;
  });
  const cats = Object.entries(porCat)
    .map(([id, valor]) => ({ id, valor, ...catMap[id] }))
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 5);

  const recentes = [...doMes].sort((a, b) => b.data.localeCompare(a.data)).slice(0, 5);

  document.getElementById("conteudo").innerHTML = `
    <section class="fx-hero fx-anim">
      <span class="fx-hero-rotulo">Saldo de ${rotuloMes(estado.mes)}</span>
      <div class="fx-hero-saldo ${saldo < 0 ? "is-neg" : ""}">${brl(saldo)}</div>
      <div class="fx-fluxo">
        <div class="fx-fluxo-receita" style="width:${pctReceita}%"></div>
        <div class="fx-fluxo-despesa" style="width:${100 - pctReceita}%"></div>
      </div>
      <div class="fx-hero-legenda">
        <span><i class="fx-dot fx-dot--receita"></i> Entrou ${brl(receitas)}</span>
        <span><i class="fx-dot fx-dot--despesa"></i> Saiu ${brl(despesas)}</span>
      </div>
    </section>

    <div class="row g-3">
      <div class="col-6">
        <div class="fx-card fx-anim">
          <span class="fx-card-ico fx-card-ico--receita"><i class="bi bi-arrow-up"></i></span>
          <div><span class="fx-card-rotulo">Receitas</span><span class="fx-card-valor">${brl(receitas)}</span></div>
        </div>
      </div>
      <div class="col-6">
        <div class="fx-card fx-anim">
          <span class="fx-card-ico fx-card-ico--despesa"><i class="bi bi-arrow-down"></i></span>
          <div><span class="fx-card-rotulo">Despesas</span><span class="fx-card-valor">${brl(despesas)}</span></div>
        </div>
      </div>
    </div>

    <section class="fx-bloco fx-anim">
      <div class="fx-bloco-topo">
        <h2>Onde o dinheiro foi</h2>
        <button class="fx-link" data-ir="relatorios">Ver relatórios</button>
      </div>
      ${cats.length === 0
        ? `<p class="fx-vazio">Sem despesas neste mês ainda. Que tal registrar a primeira?</p>`
        : `<ul class="fx-cats">${cats.map((c) => {
            const pct = despesas ? (c.valor / despesas) * 100 : 0;
            return `<li>
              <div class="fx-cat-linha"><span><i class="fx-dot" style="background:${c.cor}"></i> ${esc(c.nome)}</span><b>${brl(c.valor)}</b></div>
              <div class="fx-barra"><div style="width:${pct}%;background:${c.cor}"></div></div>
            </li>`;
          }).join("")}</ul>`}
    </section>

    <section class="fx-bloco fx-anim">
      <div class="fx-bloco-topo">
        <h2>Últimos lançamentos</h2>
        <button class="fx-link" data-ir="lancamentos">Ver todos</button>
      </div>
      ${recentes.length === 0
        ? `<p class="fx-vazio">Nenhum lançamento neste mês.</p>`
        : listaLancamentosHTML(recentes, false)}
    </section>
  `;

  document.querySelectorAll("[data-ir]").forEach((b) =>
    b.addEventListener("click", () => irPara(b.dataset.ir))
  );
}

/* LANÇAMENTOS */
function listaLancamentosHTML(itens, comExcluir) {
  return `<ul class="fx-lista">${itens.map((t) => {
    const cat = catMap[t.categoria] || { nome: "—", cor: "#999" };
    return `<li class="fx-item">
      <span class="fx-item-dot" style="background:${cat.cor}"></span>
      <div class="fx-item-info">
        <span class="fx-item-desc">${esc(t.descricao || cat.nome)}</span>
        <span class="fx-item-meta">${esc(cat.nome)} · ${t.data.split("-").reverse().join("/")}</span>
      </div>
      <span class="fx-item-valor ${t.tipo}">${t.tipo === "despesa" ? "−" : "+"}${brl(t.valor)}</span>
      ${comExcluir ? `<button class="fx-item-del" data-del="${t.id}" aria-label="Excluir"><i class="bi bi-trash"></i></button>` : ""}
    </li>`;
  }).join("")}</ul>`;
}

function renderLancamentos() {
  const doMes = dados().transacoes
    .filter((t) => t.data.startsWith(estado.mes))
    .sort((a, b) => b.data.localeCompare(a.data));

  document.getElementById("conteudo").innerHTML = `
    <div class="fx-view-topo">
      <h1>Lançamentos de ${rotuloMes(estado.mes)}</h1>
      <button class="btn fx-btn-primary fx-btn-sm" id="abrir-modal"><i class="bi bi-plus-lg"></i> Novo</button>
    </div>
    ${doMes.length === 0
      ? `<div class="fx-bloco fx-vazio-grande">
           <i class="bi bi-receipt"></i>
           <p>Ainda não há lançamentos neste mês.</p>
           <button class="btn fx-btn-primary fx-btn-sm" id="abrir-modal-2"><i class="bi bi-plus-lg"></i> Registrar o primeiro</button>
         </div>`
      : `<div class="fx-bloco">${listaLancamentosHTML(doMes, true)}</div>`}
  `;

  const abrir = () => abrirModalLancamento();
  document.getElementById("abrir-modal")?.addEventListener("click", abrir);
  document.getElementById("abrir-modal-2")?.addEventListener("click", abrir);
  document.querySelectorAll("[data-del]").forEach((b) =>
    b.addEventListener("click", () => excluirLancamento(b.dataset.del))
  );
}

async function excluirLancamento(id) {
  try {
    await Api.delLancamento(id);
    await aposMutacao();
  } catch (e) {
    alert(e.message);
  }
}

/* Modal de novo lançamento */
function abrirModalLancamento() {
  definirTipoLancamento("despesa");
  document.getElementById("lc-valor").value = "";
  document.getElementById("lc-descricao").value = "";
  document.getElementById("lc-data").value = estado.mes === mesAtual() ? hoje() : `${estado.mes}-15`;
  document.getElementById("lc-erro").hidden = true;
  modalLancamento.show();
}

function definirTipoLancamento(tipo) {
  tipoLancamento = tipo;
  document.querySelectorAll(".fx-toggle button").forEach((b) => {
    const ativo = b.dataset.tipo === tipo;
    b.classList.toggle("is-on", ativo);
    b.classList.toggle("is-despesa", ativo && tipo === "despesa");
    b.classList.toggle("is-receita", ativo && tipo === "receita");
  });
  const cats = tipo === "despesa" ? CAT_DESPESA : CAT_RECEITA;
  document.getElementById("lc-categoria").innerHTML = cats
    .map((c) => `<option value="${c.id}">${esc(c.nome)}</option>`)
    .join("");
}

async function salvarLancamento() {
  const valor = parseFloat(document.getElementById("lc-valor").value.replace(",", "."));
  const erroEl = document.getElementById("lc-erro");
  if (!valor || valor <= 0) {
    erroEl.textContent = "Informe um valor maior que zero.";
    erroEl.hidden = false;
    return;
  }
  try {
    await Api.addLancamento({
      tipo: tipoLancamento,
      categoria: document.getElementById("lc-categoria").value,
      valor,
      descricao: document.getElementById("lc-descricao").value.trim(),
      data: document.getElementById("lc-data").value || hoje(),
    });
    modalLancamento.hide();
    await aposMutacao();
  } catch (e) {
    erroEl.textContent = e.message;
    erroEl.hidden = false;
  }
}

/* PLANEJAMENTO */
function renderPlanejamento() {
  const d = dados();
  const { doMes } = resumoMes(d.transacoes, estado.mes);
  const gasto = {};
  doMes.filter((t) => t.tipo === "despesa").forEach((t) => {
    gasto[t.categoria] = (gasto[t.categoria] || 0) + t.valor;
  });
  const totalPlan = Object.values(d.orcamentos || {}).reduce((s, v) => s + (v || 0), 0);
  const totalGasto = Object.values(gasto).reduce((s, v) => s + v, 0);

  document.getElementById("conteudo").innerHTML = `
    <div class="fx-view-topo"><h1>Planejamento familiar</h1></div>
    <p class="fx-intro">Defina quanto a família quer gastar em cada categoria por mês. O Fluxy acompanha o quanto já foi usado.</p>

    <div class="fx-card fx-card--largo">
      <div><span class="fx-card-rotulo">Planejado para o mês</span><span class="fx-card-valor">${brl(totalPlan)}</span></div>
      <div class="fx-card-sep"></div>
      <div><span class="fx-card-rotulo">Já usado</span><span class="fx-card-valor">${brl(totalGasto)}</span></div>
    </div>

    <div class="fx-bloco">
      <ul class="fx-orcamentos">
        ${CAT_DESPESA.map((c) => {
          const plano = (d.orcamentos && d.orcamentos[c.id]) || 0;
          const g = gasto[c.id] || 0;
          const pct = plano ? Math.min((g / plano) * 100, 100) : 0;
          const estouro = plano && g > plano;
          let meta;
          if (!plano) meta = `${brl(g)} gastos · sem meta definida`;
          else if (estouro) meta = `Passou ${brl(g - plano)} do planejado`;
          else meta = `${brl(g)} de ${brl(plano)} · sobra ${brl(plano - g)}`;
          return `<li class="fx-orc">
            <div class="fx-orc-topo">
              <span><i class="fx-dot" style="background:${c.cor}"></i> ${esc(c.nome)}</span>
              <div class="fx-orc-input"><span>R$</span><input inputmode="decimal" data-orc="${c.id}" value="${plano || ""}" placeholder="0" /></div>
            </div>
            <div class="fx-barra"><div style="width:${pct}%;background:${estouro ? "#E2613E" : c.cor}"></div></div>
            <div class="fx-orc-meta ${estouro ? "is-estouro" : ""}">${meta}</div>
          </li>`;
        }).join("")}
      </ul>
    </div>
  `;

  document.querySelectorAll("[data-orc]").forEach((inp) => {
    inp.addEventListener("change", async () => {
      const valor = parseFloat(inp.value.replace(",", ".")) || 0;
      try {
        await Api.setOrcamento(inp.dataset.orc, valor);
        estado.cache.orcamentos = { ...estado.cache.orcamentos };
        if (valor > 0) estado.cache.orcamentos[inp.dataset.orc] = valor;
        else delete estado.cache.orcamentos[inp.dataset.orc];
        renderPlanejamento();
      } catch (e) {
        alert(e.message);
      }
    });
  });
}

/* ----------------------------- RELATÓRIOS ------------------------------ */
function renderRelatorios() {
  const { doMes, despesas } = resumoMes(dados().transacoes, estado.mes);
  const porCat = {};
  doMes.filter((t) => t.tipo === "despesa").forEach((t) => {
    porCat[t.categoria] = (porCat[t.categoria] || 0) + t.valor;
  });
  const pizza = Object.entries(porCat).map(([id, valor]) => ({
    nome: catMap[id]?.nome || id, valor, cor: catMap[id]?.cor || "#999",
  }));

  document.getElementById("conteudo").innerHTML = `
    <div class="fx-view-topo"><h1>Relatórios</h1></div>

    <div class="fx-bloco">
      <h2 class="fx-graf-titulo">Despesas por categoria · ${rotuloMes(estado.mes)}</h2>
      ${pizza.length === 0
        ? `<p class="fx-vazio">Sem despesas para mostrar neste mês.</p>`
        : `<div class="fx-graf">
             <div class="fx-graf-canvas"><canvas id="grafPizza"></canvas></div>
             <ul class="fx-graf-legenda">${pizza.map((e) => `
               <li><i class="fx-dot" style="background:${e.cor}"></i> ${esc(e.nome)} <b>${despesas ? Math.round((e.valor / despesas) * 100) : 0}%</b></li>`).join("")}
             </ul>
           </div>`}
    </div>

    <div class="fx-bloco">
      <h2 class="fx-graf-titulo">Receitas e despesas · últimos 6 meses</h2>
      <div class="fx-graf-barras"><canvas id="grafBarras"></canvas></div>
    </div>
  `;

  if (pizza.length) {
    graficoPizza = new Chart(document.getElementById("grafPizza"), {
      type: "doughnut",
      data: {
        labels: pizza.map((e) => e.nome),
        datasets: [{ data: pizza.map((e) => e.valor), backgroundColor: pizza.map((e) => e.cor), borderWidth: 2, borderColor: "#fff" }],
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: "62%",
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => " " + brl(c.parsed) } },
        },
      },
    });
  }

  const labels = [], rec = [], desp = [];
  for (let i = 5; i >= 0; i--) {
    const ym = passoMes(estado.mes, -i);
    const r = resumoMes(dados().transacoes, ym);
    labels.push(rotuloMes(ym).split("/")[0]);
    rec.push(r.receitas);
    desp.push(r.despesas);
  }
  graficoBarras = new Chart(document.getElementById("grafBarras"), {
    type: "bar",
    data: {
      labels,
      datasets: [
        { label: "Receitas", data: rec, backgroundColor: "#1FA971", borderRadius: 5 },
        { label: "Despesas", data: desp, backgroundColor: "#E2613E", borderRadius: 5 },
      ],
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { position: "bottom", labels: { usePointStyle: true, boxWidth: 8 } },
        tooltip: { callbacks: { label: (c) => c.dataset.label + ": " + brl(c.parsed.y) } },
      },
      scales: {
        x: { grid: { display: false } },
        y: { ticks: { callback: (v) => "R$" + (v >= 1000 ? v / 1000 + "k" : v) } },
      },
    },
  });
}