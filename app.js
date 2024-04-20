const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Pool } = require('pg');

// Для провреки, введите сюда свои данные
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'db',
  password: '123',
  port: 5432,
});

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(express.json());

app.get('/users/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/users', async (req, res) => {
  try {
    const { username } = req.body;
    const result = await pool.query('INSERT INTO users (username) VALUES ($1) RETURNING *', [username]);
    const newUser = result.rows[0];
    res.status(201).json(newUser);
  } catch (error) {
    console.error('Error adding user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/messages', async (req, res) => {
  try {
    const { content, username } = req.body;
    const result = await pool.query('INSERT INTO messages (content, username) VALUES ($1, $2) RETURNING *', [content, username]);
    const newMessage = result.rows[0];
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(newMessage));
      }
    });
    res.status(201).json(newMessage);
  } catch (error) {
    console.error('Error adding message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/messages/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const result = await pool.query('SELECT * FROM messages WHERE username = $1', [username]);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

server.listen(5000, () => {
  console.log('Server listening on port 5000');
});