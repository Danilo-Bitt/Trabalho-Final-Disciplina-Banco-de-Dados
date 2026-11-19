/**
 * produtos.js - CRUD de Produtos e Gestão N:M de Fornecedores Vinculados
 * Controla produtos.html: listagem, filtros, modal de produto e modal associativo produto_fornecedor
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tabelaProdutos = document.getElementById('tabela_produtos');
  const inputBusca = document.getElementById('input_busca_produto');
  const selectFiltroCategoria = document.getElementById('select_filtro_categoria');
  const btnAbrirModal = document.getElementById('btn_abrir_modal_produto');

  // Modal de Produto
  const modalProduto = document.getElementById('modal_produto');
  const tituloModalProduto = document.getElementById('titulo_modal_produto');
  const btnFecharModalProduto = document.getElementById('btn_fechar_modal_produto');
  const btnCancelarProduto = document.getElementById('btn_cancelar_produto');
  const formProduto = document.getElementById('form_produto');

  const inputIdProduto = document.getElementById('idproduto');
  const inputNome = document.getElementById('nome');
  const selectCategoria = document.getElementById('categoria_idcategoria');
  const selectUnidade = document.getElementById('unidade_medida');
  const inputQtdEstoque = document.getElementById('quantidade_estoque');
  const inputEstoqueMinimo = document.getElementById('estoque_minimo');
  const inputPrecoCusto = document.getElementById('preco_custo');
  const inputDataValidade = document.getElementById('data_validade');

  // Modal Associativo Produto x Fornecedor
  const modalPF = document.getElementById('modal_produto_fornecedor');
  const tituloModalPF = document.getElementById('titulo_modal_pf');
  const btnFecharModalPF = document.getElementById('btn_fechar_modal_pf');
  const formPF = document.getElementById('form_produto_fornecedor');
  const inputPFProdutoId = document.getElementById('pf_produto_idproduto');
  const selectPFFornecedor = document.getElementById('pf_fornecedor_idfornecedor');
  const inputPFPreco = document.getElementById('pf_preco_fornecedor');
  const inputPFSubSku = document.getElementById('pf_codigo_sku_fornecedor');
  const inputPFPrazo = document.getElementById('pf_prazo_entrega_dias');
  const tabelaPF = document.getElementById('tabela_produto_fornecedor');

  let listaProdutos = [];
  let listaCategorias = [];
  let listaFornecedores = [];

  // Carregar listas iniciais
  async function carregarDadosIniciais() {
    try {
      [listaCategorias, listaFornecedores] = await Promise.all([
        api.get('/categorias'),
        api.get('/fornecedores')
      ]);

      popularSelectsCategorias();
      popularSelectFornecedores();
      await carregarProdutos();
    } catch (err) {
      console.error('Erro na inicialização de produtos:', err);
    }
  }

  function popularSelectsCategorias() {
    if (selectFiltroCategoria) {
      selectFiltroCategoria.innerHTML = '<option value="">Todas as Categorias</option>';
      listaCategorias.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.idcategoria;
        opt.textContent = c.nome;
        selectFiltroCategoria.appendChild(opt);
      });
    }

    if (selectCategoria) {
      selectCategoria.innerHTML = '<option value="">Selecione...</option>';
      listaCategorias.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.idcategoria;
        opt.textContent = c.nome;
        selectCategoria.appendChild(opt);
      });
    }
  }

  function popularSelectFornecedores() {
    if (selectPFFornecedor) {
      selectPFFornecedor.innerHTML = '<option value="">Selecione o fornecedor...</option>';
      listaFornecedores.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f.idfornecedor;
        opt.textContent = `${f.nome} (${f.cnpj})`;
        selectPFFornecedor.appendChild(opt);
      });
    }
  }

  async function carregarProdutos() {
    try {
      listaProdutos = await api.get('/produtos');
      renderizarTabela();
    } catch (err) {
      console.error('Erro ao listar produtos:', err);
    }
  }

  function renderizarTabela() {
    if (!tabelaProdutos) return;
    tabelaProdutos.innerHTML = '';

    const termo = inputBusca ? inputBusca.value.trim().toLowerCase() : '';
    const catFiltro = selectFiltroCategoria ? selectFiltroCategoria.value : '';

    const filtrados = listaProdutos.filter(p => {
      const matchBusca = p.nome.toLowerCase().includes(termo);
      const matchCat = catFiltro === '' || String(p.categoria_idcategoria) === String(catFiltro);
      return matchBusca && matchCat;
    });

    if (filtrados.length === 0) {
      tabelaProdutos.innerHTML = `<tr><td colspan="8" style="text-align: center; color: var(--cor_texto_suave);">Nenhum produto cadastrado.</td></tr>`;
      return;
    }

    filtrados.forEach(p => {
      const tr = document.createElement('tr');
      const estoqueAtual = parseFloat(p.quantidade_estoque);
      const estoqueMin = parseFloat(p.estoque_minimo);
      const isBaixo = estoqueAtual <= estoqueMin;
      const badgeClass = isBaixo ? 'badge_baixo' : 'badge_ok';
      const badgeTexto = isBaixo ? 'Estoque Baixo' : 'Normal';

      let dataFormatada = '-';
      if (p.data_validade) {
        const partes = p.data_validade.split('-');
        dataFormatada = partes.length === 3 ? `${partes[2]}/${partes[1]}/${partes[0]}` : p.data_validade;
      }

      tr.innerHTML = `
        <td>${p.idproduto}</td>
        <td><strong>${p.nome}</strong></td>
        <td>${p.categoria_nome || '-'}</td>
        <td>
          <strong>${estoqueAtual.toFixed(2)} ${p.unidade_medida}</strong>
          <span class="badge_status ${badgeClass}" style="margin-left: 0.5rem;">${badgeTexto}</span>
        </td>
        <td>${estoqueMin.toFixed(2)} ${p.unidade_medida}</td>
        <td>R$ ${parseFloat(p.preco_custo).toFixed(2)}</td>
        <td>${dataFormatada}</td>
        <td class="acoes_tabela">
          <button type="button" class="btn_fornecedores" data-id="${p.idproduto}" title="Gerenciar Fornecedores">Fornecedores</button>
          <button type="button" class="btn_editar" data-id="${p.idproduto}" title="Editar Produto">Editar</button>
          <button type="button" class="btn_excluir" data-id="${p.idproduto}" title="Excluir Produto">Excluir</button>
        </td>
      `;
      tabelaProdutos.appendChild(tr);
    });

    tabelaProdutos.querySelectorAll('.btn_fornecedores').forEach(btn => {
      btn.addEventListener('click', () => abrirModalFornecedores(btn.getAttribute('data-id')));
    });

    tabelaProdutos.querySelectorAll('.btn_editar').forEach(btn => {
      btn.addEventListener('click', () => abrirModalEdicao(btn.getAttribute('data-id')));
    });

    tabelaProdutos.querySelectorAll('.btn_excluir').forEach(btn => {
      btn.addEventListener('click', () => excluirProduto(btn.getAttribute('data-id')));
    });
  }

  // Abertura e fechamento de modal de Produto
  function abrirModalCriacao() {
    formProduto.reset();
    inputIdProduto.value = '';
    tituloModalProduto.textContent = 'Novo Produto';
    modalProduto.classList.remove('oculto');
    inputNome.focus();
  }

  function abrirModalEdicao(id) {
    const p = listaProdutos.find(item => String(item.idproduto) === String(id));
    if (!p) return;

    inputIdProduto.value = p.idproduto;
    inputNome.value = p.nome;
    selectCategoria.value = p.categoria_idcategoria;
    selectUnidade.value = p.unidade_medida;
    inputQtdEstoque.value = p.quantidade_estoque;
    inputEstoqueMinimo.value = p.estoque_minimo;
    inputPrecoCusto.value = p.preco_custo;
    inputDataValidade.value = p.data_validade || '';

    tituloModalProduto.textContent = 'Editar Produto';
    modalProduto.classList.remove('oculto');
    inputNome.focus();
  }

  function fecharModalProduto() {
    modalProduto.classList.add('oculto');
  }

  async function excluirProduto(id) {
    if (!confirm('Tem certeza de que deseja excluir este produto?')) {
      return;
    }

    try {
      await api.delete(`/produtos/${id}`);
      alert('Produto excluído com sucesso!');
      await carregarProdutos();
    } catch (err) {
      alert((err && err.erro) ? err.erro : 'Não foi possível excluir o produto.');
    }
  }

  // --- Modal de Vínculo Produto x Fornecedor (obs 3 da página 9 do PDF) ---
  async function abrirModalFornecedores(idproduto) {
    const produto = listaProdutos.find(p => String(p.idproduto) === String(idproduto));
    if (!produto) return;

    inputPFProdutoId.value = produto.idproduto;
    tituloModalPF.textContent = `Fornecedores: ${produto.nome}`;
    formPF.reset();
    inputPFProdutoId.value = produto.idproduto;

    await carregarFornecedoresDoProduto(produto.idproduto);
    modalPF.classList.remove('oculto');
  }

  function fecharModalPF() {
    modalPF.classList.add('oculto');
  }

  async function carregarFornecedoresDoProduto(idproduto) {
    if (!tabelaPF) return;
    tabelaPF.innerHTML = '<tr><td colspan="5" style="text-align: center;">Carregando cotações...</td></tr>';

    try {
      const vinculos = await api.get(`/produto-fornecedor?produto_idproduto=${idproduto}`);
      tabelaPF.innerHTML = '';

      if (vinculos.length === 0) {
        tabelaPF.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--cor_texto_suave);">Nenhum fornecedor vinculado a este item.</td></tr>';
        return;
      }

      vinculos.forEach(v => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${v.fornecedor_nome}</strong> (${v.fornecedor_cnpj})</td>
          <td>R$ ${parseFloat(v.preco_fornecedor).toFixed(2)}</td>
          <td>${v.codigo_sku_fornecedor || '-'}</td>
          <td>${v.prazo_entrega_dias} dia(s)</td>
          <td>
            <button type="button" class="btn_excluir btn_desvincular_pf" 
              data-produto="${v.produto_idproduto}" 
              data-fornecedor="${v.fornecedor_idfornecedor}">
              Remover
            </button>
          </td>
        `;
        tabelaPF.appendChild(tr);
      });

      tabelaPF.querySelectorAll('.btn_desvincular_pf').forEach(btn => {
        btn.addEventListener('click', async () => {
          const prodId = btn.getAttribute('data-produto');
          const fornId = btn.getAttribute('data-fornecedor');
          if (confirm('Deseja desvincular este fornecedor do produto?')) {
            try {
              await api.delete(`/produto-fornecedor?produto_idproduto=${prodId}&fornecedor_idfornecedor=${fornId}`);
              await carregarFornecedoresDoProduto(prodId);
            } catch (e) {
              alert((e && e.erro) ? e.erro : 'Erro ao desvincular fornecedor.');
            }
          }
        });
      });
    } catch (err) {
      console.error('Erro ao listar fornecedores do produto:', err);
      tabelaPF.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--cor_perigo);">Erro ao carregar dados.</td></tr>';
    }
  }

  // Event Listeners
  if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirModalCriacao);
  if (btnFecharModalProduto) btnFecharModalProduto.addEventListener('click', fecharModalProduto);
  if (btnCancelarProduto) btnCancelarProduto.addEventListener('click', fecharModalProduto);

  if (btnFecharModalPF) btnFecharModalPF.addEventListener('click', fecharModalPF);

  if (inputBusca) inputBusca.addEventListener('input', renderizarTabela);
  if (selectFiltroCategoria) selectFiltroCategoria.addEventListener('change', renderizarTabela);

  // Submissão do Formulário de Produto (POST / PUT)
  if (formProduto) {
    formProduto.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = inputIdProduto.value;
      const payload = {
        nome: inputNome.value.trim(),
        categoria_idcategoria: selectCategoria.value,
        unidade_medida: selectUnidade.value,
        quantidade_estoque: parseFloat(inputQtdEstoque.value) || 0,
        estoque_minimo: parseFloat(inputEstoqueMinimo.value) || 0,
        preco_custo: parseFloat(inputPrecoCusto.value) || 0,
        data_validade: inputDataValidade.value || null
      };

      try {
        if (id) {
          await api.put(`/produtos/${id}`, payload);
          alert('Produto atualizado com sucesso!');
        } else {
          await api.post('/produtos', payload);
          alert('Produto cadastrado com sucesso!');
        }
        fecharModalProduto();
        await carregarProdutos();
      } catch (err) {
        alert((err && err.erro) ? err.erro : 'Erro ao salvar produto.');
      }
    });
  }

  // Submissão do Formulário de Vínculo Produto x Fornecedor
  if (formPF) {
    formPF.addEventListener('submit', async (e) => {
      e.preventDefault();

      const prodId = inputPFProdutoId.value;
      const payload = {
        produto_idproduto: prodId,
        fornecedor_idfornecedor: selectPFFornecedor.value,
        preco_fornecedor: parseFloat(inputPFPreco.value) || 0,
        codigo_sku_fornecedor: inputPFSubSku.value.trim(),
        prazo_entrega_dias: parseInt(inputPFPrazo.value, 10) || 0
      };

      try {
        await api.post('/produto-fornecedor', payload);
        alert('Fornecedor vinculado com sucesso!');
        formPF.reset();
        inputPFProdutoId.value = prodId;
        await carregarFornecedoresDoProduto(prodId);
      } catch (err) {
        alert((err && err.erro) ? err.erro : 'Erro ao vincular fornecedor.');
      }
    });
  }

  await carregarDadosIniciais();
});
