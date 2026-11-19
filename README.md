# Pilhadão Açaí - Sistema de Controle e Gestão de Estoque

Backend completo em **Node.js** com framework **Express**, persistência em **MySQL**, seguindo rigorosamente a arquitetura **MVC (Model-View-Controller)** e todas as especificações dos Requisitos Funcionais (RF01 - RF12) e Não-Funcionais (RNF01 - RNF08) da disciplina de Banco de Dados.

---

## 🏗️ Arquitetura do Projeto (Padrão MVC)

```
Trabalho-Final-Disciplina-Banco-de-Dados/
├── css/
│   └── style.css                 # Estilização visual da aplicação
├── imagens/                      # Recursos visuais (logo, etc.)
├── js/                           # Camada de integração cliente (Frontend JS)
│   ├── api.js                    # Configuração central de requisições fetch HTTP
│   ├── auth.js                   # Controle de autenticação e proteção de rotas
│   ├── dashboard.js              # Lógica da tela principal (KPIs e movimentações)
│   ├── produtos.js               # CRUD de produtos e modal N:M de fornecedores
│   ├── categorias.js             # CRUD de categorias
│   ├── fornecedores.js           # CRUD unificado de fornecedores + endereços + ViaCEP
│   └── usuarios.js               # CRUD de usuários e gerenciamento de perfis
├── src/                          # Backend em Node.js (MVC)
│   ├── config/
│   │   └── database.js           # Conexão Pool do MySQL (mysql2/promise)
│   ├── controllers/              # Controladores das requisições e respostas HTTP
│   │   ├── AuthController.js
│   │   ├── DashboardController.js
│   │   ├── CategoriaController.js
│   │   ├── ProdutoController.js
│   │   ├── FornecedorController.js
│   │   ├── UsuarioController.js
│   │   ├── MovimentacaoController.js
│   │   └── ProdutoFornecedorController.js
│   ├── models/                   # Regras de persistência e consultas SQL
│   │   ├── CategoriaModel.js
│   │   ├── ProdutoModel.js
│   │   ├── FornecedorModel.js    # Transação unificada de fornecedor e endereço
│   │   ├── UsuarioModel.js       # Hashing seguro com bcrypt (RNF06)
│   │   ├── MovimentacaoModel.js  # Transação atômica movimentacao + update estoque
│   │   ├── ProdutoFornecedorModel.js
│   │   └── DashboardModel.js
│   ├── middlewares/
│   │   └── errorHandler.js       # Tratamento de erro 1451 (FK referenciada - RNF07)
│   ├── routes/                   # Definição e mapeamento dos endpoints REST
│   │   ├── authRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── categoriaRoutes.js
│   │   ├── produtoRoutes.js
│   │   ├── fornecedorRoutes.js
│   │   ├── usuarioRoutes.js
│   │   ├── movimentacaoRoutes.js
│   │   ├── produtoFornecedorRoutes.js
│   │   └── index.js
│   ├── database/
│   │   └── seed.js               # Inicialização automática do schema e dados de teste
│   └── server.js                 # Inicialização do Express, CORS e arquivos estáticos
├── scriptDDL.sql                 # Script SQL DDL padronizado
├── .env.example                  # Exemplo de configuração de variáveis de ambiente
├── package.json
└── README.md
```

---

## 📋 Regras de Negócio Implementadas

1. **Autenticação com Criptografia Segura (RNF06 & RF08):**
   - Senhas criptografadas usando algoritmo `bcrypt` com salt rounds.
   - Validação de credenciais no endpoint `POST /login` retornando HTTP 401 amigável em caso de erro.
2. **Transação de Movimentação de Estoque (Página 10):**
   - No endpoint `POST /movimentacoes`, executa em uma mesma transação MySQL:
     1. Inserção na tabela `movimentacao` com rastreabilidade do usuário logado (RF09).
     2. `UPDATE produto SET quantidade_estoque = quantidade_estoque + ?` (para `ENTRADA`) ou `- ?` (para `SAIDA`).
     3. Validação de saldo para impedir saídas maiores do que a quantidade disponível em estoque.
3. **Formulário Integrado Fornecedor + Endereço (Obs da Página 9):**
   - No `POST /fornecedores`, cadastra primeiramente o endereço na tabela `endereco`, obtém o `idendereco` gerado e salva junto na tabela `fornecedor` dentro de uma transação atômica.
   - Consulta integrada com ViaCEP no campo `#cep`.
4. **Tratamento de Integridade Referencial (RNF07):**
   - Middleware captura o erro `ER_ROW_IS_REFERENCED_2` (código 1451 do MySQL) ao tentar excluir categorias, fornecedores ou produtos com dependências, devolvendo status 400 com a mensagem:
     *"Não é possível excluir este registro pois existem itens vinculados a ele"*.
5. **Vínculo N:M Produto × Fornecedor (Obs 3 da Página 9):**
   - Botão **Fornecedores** na tabela de produtos abre o modal de cotações para vincular múltiplos fornecedores com preço praticado, SKU e prazo de entrega em dias.
6. **CORS e Servidor de Arquivos Estáticos:**
   - Suporta rodar com Live Server (porta 5500) ou diretamente pela porta do Express (3000).

---

## 🚀 Como Executar o Projeto

### 1. Pré-requisitos
- Node.js instalado (v18+)
- Servidor MySQL em execução (ex: MySQL Workbench, XAMPP, WampServer ou Docker)

### 2. Configuração do Banco de Dados
Abra o seu cliente MySQL (ex: Workbench) e execute o script [scriptDDL.sql](file:///c:/Users/WINDOWS/Trabalho-Final-Disciplina-Banco-de-Dados/scriptDDL.sql).

Você também pode rodar o comando automatizado que cria o schema e insere dados padrão:
```bash
npm run seed
```

### 3. Configuração do Arquivo `.env`
Crie ou ajuste o arquivo `.env` na raiz do projeto com as credenciais do seu MySQL:
```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=db_trabalho
```

### 4. Instalar Dependências
```bash
npm install
```

### 5. Iniciar o Servidor
```bash
npm start
```
Ou em modo de desenvolvimento (hot-reload):
```bash
npm run dev
```

Acesse no navegador:
👉 **http://localhost:3000**

---

## 👤 Credenciais Disponíveis para Login
Após rodar o script ou `npm run seed`:
- **Gerente:** `carlos.gerente` / Senha: `acai123`
- **Atendente:** `ana.atend` / Senha: `acai123`
- **Estoquista:** `marcos.estoque` / Senha: `acai123`
- **Gerente (Admin):** `danilo.gerente` / Senha: `123456`
