/**
 * dashboard.js - Painel Principal e Movimentações
 * Controla index.html: KPIs, histórico de movimentações e registro de entrada/saída
 */

document.addEventListener('DOMContentLoaded', async () => {
  const usuario = auth.getUsuarioLogado();
  if (usuario) {
    const saudacao = document.getElementById('saudacao_usuario');
    if (saudacao) {
      saudacao.textContent = `Olá, ${usuario.nome_usuario} (${usuario.cargo})`;
    }
  }

  const kpiTotal = document.getElementById('kpi_total_produtos');
  const kpiBaixo = document.getElementById('kpi_estoque_baixo');
  const kpiVencimento = document.getElementById('kpi_vencimento');
  const tabelaMov = document.getElementById('tabela_movimentacoes');

  const modalMov = document.getElementById('modal_movimentacao');
  const btnAbrirModal = document.getElementById('btn_nova_movimentacao');
  const btnFecharModal = document.getElementById('btn_fechar_modal_movimentacao');
  const btnCancelarModal = document.getElementById('btn_cancelar_movimentacao');
  const formMov = document.getElementById('form_movimentacao');
  const selectProduto = document.getElementById('produto_idproduto');

  // Carregar dados do Dashboard (KPIs + Tabela de Movimentações)
  async function carregarDashboard() {
    try {
      const dados = await api.get('/dashboard');
      if (kpiTotal) kpiTotal.textContent = dados.kpis.total_produtos;
      if (kpiBaixo) kpiBaixo.textContent = dados.kpis.estoque_baixo;
      if (kpiVencimento) kpiVencimento.textContent = dados.kpis.vencimento;

      renderizarMovimentacoes(dados.movimentacoes || []);
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    }
  }

  function renderizarMovimentacoes(lista) {
    if (!tabelaMov) return;
    tabelaMov.innerHTML = '';

    if (lista.length === 0) {
      tabelaMov.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--cor_texto_suave);">Nenhuma movimentação registrada até o momento.</td></tr>`;
      return;
    }

    lista.forEach(item => {
      const tr = document.createElement('tr');
      const isEntrada = item.tipo === 'ENTRADA';
      const badgeClass = isEntrada ? 'badge_ok' : 'badge_baixo';
      const sinal = isEntrada ? '+' : '-';

      tr.innerHTML = `
        <td>${item.data_hora_formatada || item.data_hora}</td>
        <td><strong>${item.produto_nome}</strong></td>
        <td><span class="badge_status ${badgeClass}">${item.tipo}</span></td>
        <td><strong>${sinal} ${parseFloat(item.quantidade).toFixed(2)} ${item.unidade_medida || ''}</strong></td>
        <td>${item.usuario_nome}</td>
        <td>${item.descricao}</td>
      `;
      tabelaMov.appendChild(tr);
    });
  }

  // Carregar opções do select de produtos no modal
  async function carregarSelectProdutos() {
    if (!selectProduto) return;
    try {
      const produtos = await api.get('/produtos');
      selectProduto.innerHTML = '<option value="">Selecione o produto...</option>';
      produtos.forEach(p => {
        const opt = document.createElement('option');
        opt.value = p.idproduto;
        opt.textContent = `${p.nome} (Atual: ${parseFloat(p.quantidade_estoque).toFixed(2)} ${p.unidade_medida})`;
        selectProduto.appendChild(opt);
      });
    } catch (err) {
      console.error('Erro ao listar produtos:', err);
    }
  }

  // Controles do Modal
  function abrirModal() {
    if (modalMov) {
      formMov.reset();
      carregarSelectProdutos();
      modalMov.classList.remove('oculto');
    }
  }

  function fecharModal() {
    if (modalMov) {
      modalMov.classList.add('oculto');
    }
  }

  if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirModal);
  if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', fecharModal);

  // Submissão do Formulário de Movimentação
  if (formMov) {
    formMov.addEventListener('submit', async (e) => {
      e.preventDefault();
      const usuarioLogado = auth.getUsuarioLogado();

      const payload = {
        produto_idproduto: document.getElementById('produto_idproduto').value,
        usuario_idusuario: usuarioLogado ? usuarioLogado.idusuario : null,
        tipo: document.getElementById('tipo').value,
        quantidade: document.getElementById('quantidade').value,
        descricao: document.getElementById('descricao').value.trim()
      };

      if (!payload.usuario_idusuario) {
        alert('Sessão expirada. Faça login novamente.');
        auth.limparSessao();
        return;
      }

      try {
        await api.post('/movimentacoes', payload);
        alert('Movimentação registrada com sucesso!');
        fecharModal();
        await carregarDashboard();
      } catch (err) {
        alert((err && err.erro) ? err.erro : 'Erro ao registrar movimentação.');
      }
    });
  }

  // Inicialização
  await carregarDashboard();
});
