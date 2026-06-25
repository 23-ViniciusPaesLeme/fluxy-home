/* 
   Fluxy Home — Cliente da API
   ----------------------------
   Conversa com o back-end Node.js + MySQL via fetch().
   O token de login é a única coisa guardada no navegador.
   As funções de feedback funcionam sem login (página inicial pública).
*/
const Api = (() => {
  const BASE = "/api";
  const TOKEN_KEY = "fluxy_token";

  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
  const limparToken = () => localStorage.removeItem(TOKEN_KEY);

  async function req(metodo, url, corpo) {
    const opcoes = { method: metodo, headers: {} };
    const token = getToken();
    if (token) opcoes.headers["Authorization"] = "Bearer " + token;
    if (corpo !== undefined) {
      opcoes.headers["Content-Type"] = "application/json";
      opcoes.body = JSON.stringify(corpo);
    }

    const resposta = await fetch(BASE + url, opcoes);
    let dados = null;
    try {
      dados = await resposta.json();
    } catch (e) {
      /* resposta sem corpo */
    }

    if (!resposta.ok) {
      const erro = new Error((dados && dados.erro) || "Erro na requisição.");
      erro.status = resposta.status;
      throw erro;
    }
    return dados;
  }

  return {
    getToken,
    setToken,
    limparToken,

    // Autenticação
    registrar: (familia, email, senha) => req("POST", "/register", { familia, email, senha }),
    login: (email, senha) => req("POST", "/login", { email, senha }),
    demo: () => req("POST", "/demo"),
    eu: () => req("GET", "/me"),
    logout: () => req("POST", "/logout").catch(() => {}),

    // Lançamentos
    getLancamentos: () => req("GET", "/lancamentos"),
    addLancamento: (l) => req("POST", "/lancamentos", l),
    delLancamento: (id) => req("DELETE", "/lancamentos/" + id),

    // Orçamentos
    getOrcamentos: () => req("GET", "/orcamentos"),
    setOrcamento: (categoria, valor) => req("PUT", "/orcamentos", { categoria, valor }),

    // Feedback (público)
    getFeedback: () => req("GET", "/feedback"),
    addFeedback: (f) => req("POST", "/feedback", f),
  };
})();