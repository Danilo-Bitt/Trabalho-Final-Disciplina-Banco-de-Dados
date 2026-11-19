/**
 * fornecedores.js - CRUD de Fornecedores e Endereços
 * Controla fornecedores.html: formulário integrado (Fornecedor + Endereço), ViaCEP, edição e exclusão
 */

document.addEventListener('DOMContentLoaded', async () => {
  const tabelaFornecedores = document.getElementById('tabela_fornecedores');
  const inputBusca = document.getElementById('input_busca_fornecedor');
  const btnAbrirModal = document.getElementById('btn_abrir_modal_fornecedor');
  const modalFornecedor = document.getElementById('modal_fornecedor');
  const tituloModal = document.getElementById('titulo_modal_fornecedor');
  const btnFecharModal = document.getElementById('btn_fechar_modal_fornecedor');
  const btnCancelarModal = document.getElementById('btn_cancelar_fornecedor');
  const formFornecedor = document.getElementById('form_fornecedor');

  // Campos do formulário
  const inputIdFornecedor = document.getElementById('idfornecedor');
  const inputIdEndereco = document.getElementById('endereco_idendereco');
  const inputNome = document.getElementById('nome');
  const inputCnpj = document.getElementById('cnpj');
  const inputTelefone = document.getElementById('telefone');
  const inputNomeContato = document.getElementById('nome_contato');
  const inputEmail = document.getElementById('email');

  const inputCep = document.getElementById('cep');
  const inputBairro = document.getElementById('bairro');
  const inputLogradouro = document.getElementById('logradouro');
  const inputNumero = document.getElementById('numero');
  const inputComplemento = document.getElementById('complemento');
  const inputCidade = document.getElementById('cidade');
  const inputUf = document.getElementById('uf');
  const inputPais = document.getElementById('pais');

  let listaFornecedores = [];

  async function carregarFornecedores() {
    try {
      listaFornecedores = await api.get('/fornecedores');
      renderizarTabela();
    } catch (err) {
      console.error('Erro ao carregar fornecedores:', err);
    }
  }

  function renderizarTabela() {
    if (!tabelaFornecedores) return;
    tabelaFornecedores.innerHTML = '';

    const termo = inputBusca ? inputBusca.value.trim().toLowerCase() : '';
    const filtrados = listaFornecedores.filter(f => 
      f.nome.toLowerCase().includes(termo) || 
      (f.cnpj && f.cnpj.toLowerCase().includes(termo))
    );

    if (filtrados.length === 0) {
      tabelaFornecedores.innerHTML = `<tr><td colspan="7" style="text-align: center; color: var(--cor_texto_suave);">Nenhum fornecedor encontrado.</td></tr>`;
      return;
    }

    filtrados.forEach(f => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${f.idfornecedor}</td>
        <td><strong>${f.nome}</strong></td>
        <td>${f.cnpj}</td>
        <td>${f.telefone}</td>
        <td>${f.nome_contato || '-'}</td>
        <td>${f.cidade} / ${f.uf}</td>
        <td class="acoes_tabela">
          <button type="button" class="btn_editar" data-id="${f.idfornecedor}">Editar</button>
          <button type="button" class="btn_excluir" data-id="${f.idfornecedor}">Excluir</button>
        </td>
      `;
      tabelaFornecedores.appendChild(tr);
    });

    tabelaFornecedores.querySelectorAll('.btn_editar').forEach(btn => {
      btn.addEventListener('click', () => abrirModalEdicao(btn.getAttribute('data-id')));
    });

    tabelaFornecedores.querySelectorAll('.btn_excluir').forEach(btn => {
      btn.addEventListener('click', () => excluirFornecedor(btn.getAttribute('data-id')));
    });
  }

  function abrirModalCriacao() {
    formFornecedor.reset();
    inputIdFornecedor.value = '';
    inputIdEndereco.value = '';
    if (inputPais) inputPais.value = 'Brasil';
    tituloModal.textContent = 'Novo Fornecedor';
    modalFornecedor.classList.remove('oculto');
    inputNome.focus();
  }

  function abrirModalEdicao(id) {
    const f = listaFornecedores.find(item => String(item.idfornecedor) === String(id));
    if (!f) return;

    inputIdFornecedor.value = f.idfornecedor;
    inputIdEndereco.value = f.endereco_idendereco || '';
    inputNome.value = f.nome;
    inputCnpj.value = f.cnpj;
    inputTelefone.value = f.telefone;
    inputNomeContato.value = f.nome_contato || '';
    inputEmail.value = f.email || '';

    inputCep.value = f.cep;
    inputBairro.value = f.bairro;
    inputLogradouro.value = f.logradouro;
    inputNumero.value = f.numero;
    inputComplemento.value = f.complemento || '';
    inputCidade.value = f.cidade;
    inputUf.value = f.uf;
    inputPais.value = f.pais || 'Brasil';

    tituloModal.textContent = 'Editar Fornecedor';
    modalFornecedor.classList.remove('oculto');
    inputNome.focus();
  }

  function fecharModal() {
    modalFornecedor.classList.add('oculto');
  }

  async function excluirFornecedor(id) {
    if (!confirm('Deseja realmente excluir este fornecedor e seu endereço vinculado?')) {
      return;
    }

    try {
      await api.delete(`/fornecedores/${id}`);
      alert('Fornecedor excluído com sucesso!');
      await carregarFornecedores();
    } catch (err) {
      alert((err && err.erro) ? err.erro : 'Não foi possível excluir o fornecedor.');
    }
  }

  // Preenchimento automático de CEP via ViaCEP (obs 2 da página 9 do PDF)
  if (inputCep) {
    inputCep.addEventListener('blur', async () => {
      const cepLimpo = inputCep.value.replace(/\D/g, '');
      if (cepLimpo.length === 8) {
        try {
          const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
          const dadosCep = await res.json();
          if (!dadosCep.erro) {
            if (inputLogradouro) inputLogradouro.value = dadosCep.logradouro || '';
            if (inputBairro) inputBairro.value = dadosCep.bairro || '';
            if (inputCidade) inputCidade.value = dadosCep.localidade || '';
            if (inputUf) inputUf.value = dadosCep.uf || '';
            if (inputNumero) inputNumero.focus();
          }
        } catch (e) {
          console.warn('ViaCEP indisponível ou offline:', e);
        }
      }
    });
  }

  // Event Listeners
  if (btnAbrirModal) btnAbrirModal.addEventListener('click', abrirModalCriacao);
  if (btnFecharModal) btnFecharModal.addEventListener('click', fecharModal);
  if (btnCancelarModal) btnCancelarModal.addEventListener('click', fecharModal);

  if (inputBusca) {
    inputBusca.addEventListener('input', renderizarTabela);
  }

  if (formFornecedor) {
    formFornecedor.addEventListener('submit', async (e) => {
      e.preventDefault();

      const id = inputIdFornecedor.value;
      const payload = {
        nome: inputNome.value.trim(),
        cnpj: inputCnpj.value.trim(),
        telefone: inputTelefone.value.trim(),
        nome_contato: inputNomeContato.value.trim(),
        email: inputEmail.value.trim(),
        cep: inputCep.value.trim(),
        logradouro: inputLogradouro.value.trim(),
        numero: inputNumero.value.trim(),
        bairro: inputBairro.value.trim(),
        complemento: inputComplemento.value.trim(),
        cidade: inputCidade.value.trim(),
        uf: inputUf.value.trim().toUpperCase(),
        pais: inputPais.value.trim() || 'Brasil'
      };

      try {
        if (id) {
          await api.put(`/fornecedores/${id}`, payload);
          alert('Fornecedor atualizado com sucesso!');
        } else {
          await api.post('/fornecedores', payload);
          alert('Fornecedor cadastrado com sucesso!');
        }
        fecharModal();
        await carregarFornecedores();
      } catch (err) {
        alert((err && err.erro) ? err.erro : 'Erro ao salvar fornecedor.');
      }
    });
  }

  await carregarFornecedores();
});
