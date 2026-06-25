<h1 align="center">💰 Fluxy Home</h1>

<p align="center">
  <strong>Solução web de organização financeira familiar</strong><br>
  Controle de receitas e despesas, planejamento e relatórios — de um jeito simples e acessível.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/Bootstrap-7952B3?style=for-the-badge&logo=bootstrap&logoColor=white" alt="Bootstrap">
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express">
  <img src="https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
</p>

---

## 🎓 Contexto acadêmico

<table>
  <tr><td><strong>Instituição</strong></td><td>Centro Universitário Internacional UNINTER — Escola Superior Politécnica (ESP)</td></tr>
  <tr><td><strong>Curso</strong></td><td>CST em Análise e Desenvolvimento de Sistemas</td></tr>
  <tr><td><strong>Disciplina</strong></td><td>Atividade Extensionista II: Tecnologia Aplicada à Inclusão Digital — Projeto</td></tr>
  <tr><td><strong>Comunidade atendida</strong></td><td>Nova Iguaçu – RJ</td></tr>
  <tr><td><strong>Autor</strong></td><td>Vinícius Gall Paes Leme — RU 4665342</td></tr>
</table>

---

## 📖 Sobre o projeto

O **Fluxy Home** é uma plataforma web desenvolvida como atividade de extensão universitária, com o objetivo de levar tecnologia de gestão financeira à comunidade de **Nova Iguaçu – RJ**. A solução ajuda famílias a controlar suas **receitas**, **despesas** e o **planejamento financeiro do lar**, favorecendo a organização das contas, o uso consciente da renda e a inclusão digital.

A interface foi pensada para ser **simples, responsiva e acessível**, permitindo o uso tanto no computador quanto no celular.

---

## 🎯 Objetivos

- Construir uma plataforma web para auxiliar famílias na gestão das finanças domésticas.
- Implementar o cadastro e o gerenciamento de receitas, despesas e metas de planejamento familiar.
- Levar conceitos de organização financeira e inclusão digital à comunidade de Nova Iguaçu – RJ.
- Oferecer um acompanhamento financeiro claro, com categorização de despesas e relatórios visuais.

---

## 🌍 Objetivos de Desenvolvimento Sustentável (ODS)

O projeto contribui com os seguintes ODS da Agenda 2030 da ONU:

| ODS | Descrição |
|:---:|:----------|
| **1** | Erradicação da pobreza |
| **8** | Trabalho decente e crescimento econômico |
| **10** | Redução das desigualdades |

---

## ✨ Funcionalidades

- 🏠 **Página inicial** — apresentação do sistema e seção pública de comentários (feedbacks) da comunidade.
- 👨‍👩‍👧 **Conta por família** — cada família cria seu acesso, com senha protegida por hash.
- 📊 **Painel** — saldo do mês, total de receitas e despesas e principais categorias de gasto.
- 🧾 **Lançamentos** — cadastro de receitas e despesas com categoria, descrição e data.
- 🎯 **Planejamento** — definição de metas de gasto por categoria, com acompanhamento do consumo.
- 📈 **Relatórios** — gráficos de despesas por categoria e da evolução dos últimos seis meses.

---

## 🛠️ Tecnologias

| Camada | Tecnologias |
|:-------|:------------|
| **Front-end** | HTML5, CSS3, JavaScript, Bootstrap 5, Chart.js |
| **Back-end** | Node.js, Express |
| **Banco de dados** | MySQL (mysql2) |
| **Autenticação** | Hash de senha (crypto/scrypt) e token de sessão |

---

## 📁 Estrutura do projeto

```
fluxy-home/
├── server.js              # Servidor Express (serve o front-end e a API)
├── db.js                  # Conexão com o banco de dados MySQL
├── database.sql           # Script de criação do banco e das tabelas
├── .env                   # Configuração do banco (não versionado)
├── middleware/
│   └── auth.js            # Verificação do token de login
├── routes/
│   ├── auth.js            # Cadastro, login, logout e conta de demonstração
│   ├── lancamentos.js     # Receitas e despesas
│   ├── orcamentos.js      # Metas do planejamento
│   └── feedback.js        # Comentários da comunidade (público)
└── public/
    ├── index.html         # Página inicial (apresentação + feedbacks)
    ├── app.html           # Sistema (login e funcionalidades)
    ├── css/style.css      # Estilos
    └── js/
        ├── storage.js     # Cliente da API (fetch)
        ├── home.js        # Lógica da página inicial
        └── app.js         # Lógica do sistema
```

---

## 🚀 Como executar localmente

### Pré-requisitos
- [Node.js](https://nodejs.org/) instalado
- [MySQL](https://dev.mysql.com/downloads/) instalado e em execução (ex.: MySQL Workbench)

### 1. Clonar o repositório
```bash
git clone https://github.com/23-ViniciusPaesLeme/fluxy-home.git
cd fluxy-home
```

### 2. Instalar as dependências
```bash
npm install
```

### 3. Criar o banco de dados
Abra o **MySQL Workbench**, vá em `File → Open SQL Script`, selecione o arquivo **`database.sql`** e execute (⚡).
O banco `fluxy_home` e suas tabelas serão criados automaticamente.

### 4. Configurar o acesso ao banco
Crie um arquivo **`.env`** na raiz do projeto com o seguinte conteúdo (ajuste a senha do seu MySQL):
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=sua_senha
DB_NAME=fluxy_home
PORT=3000
```

### 5. Iniciar o servidor
```bash
node server.js
```

Acesse **http://localhost:3000** no navegador.

> 💡 Dica: clique em **"Entrar com conta de demonstração"** para explorar o sistema já com dados de exemplo.

---

## 🎥 Demonstração

- **Vídeo da aplicação na comunidade:** _(adicionar o link do vídeo aqui)_
- **Repositório:** https://github.com/23-ViniciusPaesLeme/fluxy-home

---

## 👤 Autor

**Vinícius Gall Paes Leme**
RU 4665342 — CST em Análise e Desenvolvimento de Sistemas (UNINTER)

---

<p align="center">
  Projeto desenvolvido para fins acadêmicos e de extensão universitária. 🎓
</p>