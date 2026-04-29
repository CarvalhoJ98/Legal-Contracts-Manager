import { useState, useEffect } from 'react';
import './App.css';

function App() {
  // --- 1. ESTADOS (STATE) ---
  // O "estado" no React é como a memória do componente. Se o estado muda, a tela atualiza.
  
  // Lista de contratos (começa como uma lista vazia [])
  const [contracts, setContracts] = useState([]);
  
  // Dados do formulário (começa com campos vazios)
  const [formData, setFormData] = useState({
    client_name: '',
    contract_type: '',
    value: '',
    status: 'ativo'
  });
  
  // Para saber se estamos criando um novo ou editando um existente (começa como null)
  const [editingId, setEditingId] = useState(null);

  // --- 2. COMUNICAÇÃO COM O BACKEND (API) ---
  // O endereço onde nosso servidor Node.js está rodando
  const API_URL = 'http://localhost:3000/contracts';

  // Função para buscar todos os contratos no banco de dados (READ)
  const fetchContracts = async () => {
    try {
      const response = await fetch(API_URL); // Faz um GET para a API
      const data = await response.json(); // Converte a resposta para JSON
      setContracts(data); // Salva os dados na nossa "memória" (estado contracts)
    } catch (error) {
      console.error('Erro ao buscar contratos:', error);
    }
  };

  // useEffect faz com que a função fetchContracts rode uma vez assim que a tela carregar
  useEffect(() => {
    fetchContracts();
  }, []);

  // --- 3. FUNÇÕES DOS BOTÕES E FORMULÁRIO ---

  // Função chamada toda vez que o usuário digita algo num campo do formulário
  const handleInputChange = (e) => {
    // Pega o nome do campo (ex: 'client_name') e o valor que o usuário digitou
    const { name, value } = e.target;
    // Atualiza apenas o campo que foi alterado, mantendo os outros como estavam (...formData)
    setFormData({ ...formData, [name]: value });
  };

  // Função chamada quando o usuário clica em "Salvar" no formulário
  const handleSubmit = async (e) => {
    e.preventDefault(); // Evita que a página recarregue ao enviar o formulário

    try {
      if (editingId) {
        // Se temos um editingId, significa que estamos EDITANDO (UPDATE - PUT)
        console.log('Enviando PUT para:', `${API_URL}/${editingId}`);
        await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData) // Envia os dados do formulário
        });
      } else {
        // Se NÃO temos editingId, significa que estamos CRIANDO (CREATE - POST)
        console.log('Enviando POST para:', API_URL);
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      // Depois de salvar, limpamos o formulário
      setFormData({ client_name: '', contract_type: '', value: '', status: 'ativo' });
      setEditingId(null);
      // E buscamos a lista atualizada do banco de dados
      fetchContracts();
      alert(editingId ? 'Contrato atualizado!' : 'Contrato cadastrado com sucesso!');
      
    } catch (error) {
      console.error('Erro ao salvar:', error);
      alert(`Erro técnico: ${error.message}. Verifique se o terminal do BACKEND está aberto e sem erros.`);
    }
  };

  // Função chamada quando clica no botão "Editar" de um contrato na tabela
  const handleEdit = (contract) => {
    // Preenche o formulário com os dados do contrato que clicamos
    setFormData({
      client_name: contract.client_name,
      contract_type: contract.contract_type,
      value: contract.value,
      status: contract.status
    });
    // Define o ID que estamos editando
    setEditingId(contract.id);
  };

  // Função chamada quando clica no botão "Excluir"
  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este contrato?')) {
      try {
        // Faz um DELETE para a API passando o ID
        await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
        // Atualiza a lista após excluir
        fetchContracts();
      } catch (error) {
        console.error('Erro ao excluir:', error);
      }
    }
  };

  // Função para cancelar a edição e limpar o form
  const handleCancel = () => {
    setFormData({ client_name: '', contract_type: '', value: '', status: 'ativo' });
    setEditingId(null);
  };

  // --- 4. O QUE VAI APARECER NA TELA (HTML/JSX) ---
  return (
    <div className="app-container">
      <h1>💼 Legal Contracts Manager</h1>

      <section>
        <h2>{editingId ? 'Editar Contrato' : 'Novo Contrato'}</h2>
        
        {/* Formulário */}
        <form className="contract-form" onSubmit={handleSubmit}>
          
          <div className="form-group">
            <label>Nome do Cliente</label>
            <input
              type="text"
              name="client_name"
              value={formData.client_name}
              onChange={handleInputChange}
              required
              placeholder="Ex: Empresa XYZ Ltda"
            />
          </div>

          <div className="form-group">
            <label>Tipo de Contrato</label>
            <input
              type="text"
              name="contract_type"
              value={formData.contract_type}
              onChange={handleInputChange}
              required
              placeholder="Ex: Prestação de Serviços"
            />
          </div>

          <div className="form-group">
            <label>Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              name="value"
              value={formData.value}
              onChange={handleInputChange}
              required
              placeholder="Ex: 5000.00"
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleInputChange}>
              <option value="ativo">Ativo</option>
              <option value="encerrado">Encerrado</option>
            </select>
          </div>

          <div className="form-group full-width">
            <button type="submit" className="btn btn-primary">
              {editingId ? 'Salvar Alterações' : 'Cadastrar Contrato'}
            </button>
            {/* Mostra o botão cancelar apenas se estiver editando */}
            {editingId && (
              <button type="button" className="btn" onClick={handleCancel} style={{marginTop: '10px'}}>
                Cancelar Edição
              </button>
            )}
          </div>
        </form>
      </section>

      <section>
        <h2>Contratos Cadastrados</h2>
        
        {/* Tabela de Contratos */}
        <div className="table-container">
          {contracts.length === 0 ? (
            <p className="empty-state">Nenhum contrato cadastrado ainda.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {/* O .map percorre a lista de contratos e cria uma "linha" (tr) para cada um */}
                {contracts.map((contract) => (
                  <tr key={contract.id}>
                    <td>#{contract.id}</td>
                    <td>{contract.client_name}</td>
                    <td>{contract.contract_type}</td>
                    <td>R$ {Number(contract.value).toFixed(2)}</td>
                    <td>
                      <span className={`status-badge status-${contract.status.toLowerCase()}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-action btn-edit" onClick={() => handleEdit(contract)}>
                        Editar
                      </button>
                      <button className="btn btn-action btn-delete" onClick={() => handleDelete(contract.id)}>
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

export default App;
