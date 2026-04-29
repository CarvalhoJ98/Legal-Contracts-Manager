// Importa as ferramentas
const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // Mudamos de mysql2 para sqlite3
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// --- CONFIGURAÇÃO DO SQLITE ---
// O SQLite não precisa de senha nem servidor. Ele cria um arquivo na sua pasta.
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Erro ao abrir o banco SQLite:', err.message);
  } else {
    console.log('Conectado ao banco de dados SQLite com sucesso!');
    
    // Cria a tabela automaticamente se ela não existir
    db.run(`CREATE TABLE IF NOT EXISTS contracts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      client_name TEXT NOT NULL,
      contract_type TEXT NOT NULL,
      value REAL NOT NULL,
      status TEXT NOT NULL
    )`);
  }
});

// --- ROTAS DO CRUD ---

// 1. CREATE: Adicionar contrato
app.post('/contracts', (req, res) => {
  console.log('Recebendo requisição para cadastrar contrato:', req.body);
  const { client_name, contract_type, value, status } = req.body;
  
  const sql = 'INSERT INTO contracts (client_name, contract_type, value, status) VALUES (?, ?, ?, ?)';
  
  db.run(sql, [client_name, contract_type, value, status], function(err) {
    if (err) {
      console.error('Erro ao salvar no SQLite:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: this.lastID, message: 'Contrato criado com sucesso!' });
  });
});

// 2. READ: Listar contratos
app.get('/contracts', (req, res) => {
  console.log('Buscando lista de contratos...');
  const sql = 'SELECT * FROM contracts';
  
  db.all(sql, [], (err, rows) => {
    if (err) {
      console.error('Erro ao buscar no SQLite:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json(rows);
  });
});

// 3. UPDATE: Editar contrato
app.put('/contracts/:id', (req, res) => {
  const { id } = req.params;
  const { client_name, contract_type, value, status } = req.body;
  
  const sql = 'UPDATE contracts SET client_name = ?, contract_type = ?, value = ?, status = ? WHERE id = ?';
  
  db.run(sql, [client_name, contract_type, value, status, id], function(err) {
    if (err) {
      console.error('Erro ao atualizar no SQLite:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Contrato atualizado com sucesso!' });
  });
});

// 4. DELETE: Excluir contrato
app.delete('/contracts/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM contracts WHERE id = ?';
  
  db.run(sql, id, function(err) {
    if (err) {
      console.error('Erro ao excluir no SQLite:', err.message);
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ message: 'Contrato excluído com sucesso!' });
  });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
