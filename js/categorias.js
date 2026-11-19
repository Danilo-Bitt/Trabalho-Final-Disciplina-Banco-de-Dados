/**
 * categorias.js - CRUD de Categorias
 * Controla categorias.html: listagem, busca, criação, edição e exclusão com tratamento de FK
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tabelaCategorias = document.getElementById('tabela_categorias');
  const inputBusca = document.getElementById('input_busca_categoria');
  const btnAbrirModal = document.getElementById('btn_abrir_modal_categoria');
  const modalCategoria = document.getElementById('modal_categoria');
  const tituloModal = document.getElementById('titulo_modal_categoria');
  const btnFecharModal = document.getElementById('btn_fechar_modal_categoria');
  const btnCancelarModal = document.getElementById('btn_cancelar_categoria');
  const formCategoria = document.getElementById('form_categoria');

  const inputId = document.getElementById('idcategoria');
  const inputNome = document.getElementById('nome');
  const inputDescricao = document.getElementById('descricao');

  let listaCategorias = [];

  async function carregarCategorias() {
    try {
      listaCategorias = await api.get('/categorias');
      renderizarTabela();
    } catch (err) {
      console.error('Erro ao carregar categorias:', err);
    }
  }

  function renderizarTabela() {
    if (!tabelaCategorias) return;
    tabelaCategorias.innerHTML = '';

    const termo = inputBusca ? inputBusca.value.trim().toLowerCase() : '';
    const filtradas = listaCategorias.filter(c => 
      c.nome.toLowerCase().includes(termo) || 
      (c.descricao && c.descricao.toLowerCase().includes(termo))
    );

    if (filtradas.length === 0) {
      tabelaCategorias.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--cor_texto_suave);">Nenhuma categoria encontrada.</td></tr>`;
      return;
    }

    filtradas.forEach(c => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${c.idcategoria}</td>
        <td><strong>${c.nome}</strong></td>
        <td>${c.descricao || '-'}</td>
        <td class="acoes_tabela">
          <button type="button" class="btn_editar" data-id="${c.idcategoria}">Editar</button>
          <button type="button" class="btn_excluir" data-id="${c.idcategoria}">Excluir</button>
        </td>
      `;
      tabelaCategorias.appendChild(tr);
    });

    // Eventos de clique nas ações da tabela
    tabelaCategorias.querySelectorAll('.btn_editar').forEach(btn => {
      btn.addEventListener('click', () => abrirModalEdicao(btn.getAttribute('data-id')));
    });

    tabelaCategorias.querySelectorAll('.btn_excluir').forEach(btn => {
      btn.addEventListener('click', () => excluirCategoria(btn.getAttribute('data-id')));
    });
  }

  function abrirModalCriacao() {
    formCategoria.reset();
    inputId.value = '';
    tituloModal.textContent = 'Nova Categoria';
    modalCategoria.classList.remove('oculto');
    inputNome.focus();
  }

  function abrirModalEdicao(id) {
    const cat = listaCategorias.find(c => String(c.idcategoria) === String(id));
    if (!cat) return;

    inputId.value = cat.idcategoria;
    inputNome.value = cat.nome;
    inputDescricao.value = cat.descricao || '';
    tituloModal.textContent = 'Editar Categoria';
    modalCategoria.classList.remove('oculto');
    inputNome.focus();
  }

  function fecharModal() {
    modalCategoria.classList.add('oculto');
  }

  async function excluirCategoria(id) {
    if (!confirm('Tem certeza de que deseja excluir esta categoria?')) {
      return;
    }

    try {
      await api.delete(`/categorias/${id}`);
      alert('Categoria excluída com sucesso!');
      await carregarCategorias();
    } catch (err) {
      alert((err && err.erro) ? err.erro : 'Não foi possível excluir a categoria.');
    }
  }

  // Event Listeners
  if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirModalCriacao);
  if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', fecharModal);

  if (inputBusca) {
    inputBusca.addEventListener('input', renderizarTabela);
  }

  if (formCategoria) {
    formCategoria.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = inputId.value;
      const payload = {
        nome: inputNome.value.trim(),
        descricao: inputDescricao.value.trim()
      };

      try {
        if (id) {
          await api.put(`/categorias/${id}`, payload);
          alert('Categoria atualizada com sucesso!');
        } else {
          await api.post('/categorias', payload);
          alert('Categoria cadastrada com sucesso!');
        }
        fecharModal();
        await carregarCategorias();
      } catch (err) {
        alert((err && err.erro) ? err.erro : 'Erro ao salvar categoria.');
      }
    });
  }

  await carregarCategorias();
});
