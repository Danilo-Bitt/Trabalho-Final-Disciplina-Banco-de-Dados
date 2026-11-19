/**
 * auth.js - Controle de Sessão e Login
 * Gerencia autenticação, localStorage, proteção de rotas e logout
 */

const auth = {
  CHAVE_STORAGE: 'pilhadao_usuario_logado',

  getUsuarioLogado() {
    try {
      const data = localStorage.getItem(this.CHAVE_STORAGE);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  },

  salvarSessao(usuario) {
    localStorage.setItem(this.CHAVE_STORAGE, JSON.stringify(usuario));
  },

  limparSessao() {
    localStorage.removeItem(this.CHAVE_STORAGE);
    window.location.href = 'login.html';
  },

  verificarAcesso() {
    const usuario = this.getUsuarioLogado();
    const paginaAtual = window.location.pathname.split('/').pop() || 'index.html';

    if (paginaAtual === 'login.html') {
      if (usuario) {
        window.location.href = 'index.html';
      }
    } else {
      if (!usuario) {
        window.location.href = 'login.html';
      }
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  auth.verificarAcesso();

  // Controle de Logout compartilhado em todas as telas
  const btnLogout = document.getElementById('btn_logout');
  if (btnLogout) {
    btnLogout.addEventListener('click', (e) => {
      e.preventDefault();
      auth.limparSessao();
    });
  }

  // Controle do Formulário de Login (login.html)
  const formLogin = document.getElementById('form_login');
  if (formLogin) {
    const inputLogin = document.getElementById('login');
    const inputSenha = document.getElementById('senha');
    const msgErro = document.getElementById('mensagem_erro_login');

    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (msgErro) msgErro.classList.add('oculto');

      const login = inputLogin.value.trim();
      const senha = inputSenha.value;

      try {
        const dados = await api.post('/login', { login, senha });
        auth.salvarSessao(dados);
        window.location.href = 'index.html';
      } catch (err) {
        if (msgErro) {
          msgErro.textContent = (err && err.erro) ? err.erro : 'Usuário ou senha inválidos.';
          msgErro.classList.remove('oculto');
        } else {
          alert('Usuário ou senha inválidos.');
        }
      }
    });
  }
});
