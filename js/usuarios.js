/**
 * usuarios.js - CRUD de Usuários e Controle de Perfis
 * Controla usuarios.html: cadastro, listagem, filtros por cargo, edição e exclusão
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tabelaUsuarios = document.getElementById('tabela_usuarios');
  const inputBusca = document.getElementById('input_busca_usuario');
  const selectFiltroCargo = document.getElementById('select_filtro_cargo');
  const btnAbrirModal = document.getElementById('btn_abrir_modal_usuario');
  const modalUsuario = document.getElementById('modal_usuario');
  const tituloModal = document.getElementById('titulo_modal_usuario');
  const btnFecharModal = document.getElementById('btn_fechar_modal_usuario');
  const btnCancelarModal = document.getElementById('btn_cancelar_usuario');
  const formUsuario = document.getElementById('form_usuario');

  const inputId = document.getElementById('idusuario');
  const inputNome = document.getElementById('nome_usuario');
  const selectCargo = document.getElementById('cargo');
  const inputLogin = document.getElementById('login');
  const inputSenha = document.getElementById('senha');
  const labelSenha = document.getElementById('label_senha');

  let listaUsuarios = [];

  async function carregarUsuarios() {
    try {
      listaUsuarios = await api.get('/usuarios');
      renderizarTabela();
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    }
  }

  function renderizarTabela() {
    if (!tabelaUsuarios) return;
    tabelaUsuarios.innerHTML = '';

    const termo = inputBusca ? inputBusca.value.trim().toLowerCase() : '';
    const cargoFiltro = selectFiltroCargo ? selectFiltroCargo.value : '';

    const filtrados = listaUsuarios.filter(u => {
      const matchBusca = u.nome_usuario.toLowerCase().includes(termo) || u.login.toLowerCase().includes(termo);
      const matchCargo = cargoFiltro === '' || u.cargo === cargoFiltro;
      return matchBusca && matchCargo;
    });

    if (filtrados.length === 0) {
      tabelaUsuarios.innerHTML = `<tr><td colspan="5" style="text-align: center; color: var(--cor_texto_suave);">Nenhum usuário encontrado.</td></tr>`;
      return;
    }

    filtrados.forEach(u => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${u.idusuario}</td>
        <td><strong>${u.nome_usuario}</strong></td>
        <td><span class="badge_status badge_ok">${u.cargo}</span></td>
        <td><code>${u.login}</code></td>
        <td class="acoes_tabela">
          <button type="button" class="btn_editar" data-id="${u.idusuario}">Editar</button>
          <button type="button" class="btn_excluir" data-id="${u.idusuario}">Excluir</button>
        </td>
      `;
      tabelaUsuarios.appendChild(tr);
    });

    tabelaUsuarios.querySelectorAll('.btn_editar').forEach(btn => {
      btn.addEventListener('click', () => abrirModalEdicao(btn.getAttribute('data-id')));
    });

    tabelaUsuarios.querySelectorAll('.btn_excluir').forEach(btn => {
      btn.addEventListener('click', () => excluirUsuario(btn.getAttribute('data-id')));
    });
  }

  function abrirModalCriacao() {
    formUsuario.reset();
    inputId.value = '';
    tituloModal.textContent = 'Novo Usuário';
    if (labelSenha) labelSenha.textContent = 'Senha de Acesso *';
    inputSenha.required = true;
    inputSenha.placeholder = 'Digite a senha do colaborador';
    modalUsuario.classList.remove('oculto');
    inputNome.focus();
  }

  function abrirModalEdicao(id) {
    const u = listaUsuarios.find(item => String(item.idusuario) === String(id));
    if (!u) return;

    inputId.value = u.idusuario;
    inputNome.value = u.nome_usuario;
    selectCargo.value = u.cargo;
    inputLogin.value = u.login;
    inputSenha.value = '';

    // Conforme página 6 do PDF: alterar label para senha opcional
    if (labelSenha) labelSenha.textContent = 'Nova Senha (deixe em branco para manter a atual)';
    inputSenha.required = false;
    inputSenha.placeholder = 'Deixe em branco para não alterar';

    tituloModal.textContent = 'Editar Usuário';
    modalUsuario.classList.remove('oculto');
    inputNome.focus();
  }

  function fecharModal() {
    modalUsuario.classList.add('oculto');
  }

  async function excluirUsuario(id) {
    const usuarioLogado = auth.getUsuarioLogado();
    if (usuarioLogado && String(usuarioLogado.idusuario) === String(id)) {
      alert('Você não pode excluir o seu próprio usuário logado!');
      return;
    }

    if (!confirm('Deseja realmente excluir este usuário?')) {
      return;
    }

    try {
      await api.delete(`/usuarios/${id}`);
      alert('Usuário excluído com sucesso!');
      await carregarUsuarios();
    } catch (err) {
      alert((err && err.erro) ? err.erro : 'Não foi possível excluir o usuário.');
    }
  }

  // Event Listeners
  if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirModalCriacao);
  if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', fecharModal);

  if (inputBusca) inputBusca.addEventListener('input', renderizarTabela);
  if (selectFiltroCargo) selectFiltroCargo.addEventListener('change', renderizarTabela);

  if (formUsuario) {
    formUsuario.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = inputId.value;
      const payload = {
        nome_usuario: inputNome.value.trim(),
        cargo: selectCargo.value,
        login: inputLogin.value.trim(),
        senha: inputSenha.value
      };

      try {
        if (id) {
          await api.put(`/usuarios/${id}`, payload);
          alert('Usuário atualizado com sucesso!');
        } else {
          await api.post('/usuarios', payload);
          alert('Usuário cadastrado com sucesso!');
        }
        fecharModal();
        await carregarUsuarios();
      } catch (err) {
        alert((err && err.erro) ? err.erro : 'Erro ao salvar usuário.');
      }
    });
  }

  await carregarUsuarios();
});
