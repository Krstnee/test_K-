import React, { useState, useEffect } from 'react';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [username, setUsername] = useState('');
  const createUser = async (username) => {
    try {
      const response = await fetch('/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username }),
      });

      if (response.ok) {
        console.log('Пользователь создан:', username);
      } else {
        console.error('Ошибка при создании пользователя:', response.statusText);
      }
    } catch (error) {
      console.error('Ошибка при создании пользователя:', error);
    }
  };

  const requestUsername = async () => {
    const inputUsername = prompt('Введите ваше имя:');
    if (inputUsername) {
      const response = await fetch(`/users/${inputUsername}`);
      if (response.ok) {
        setUsername(inputUsername);
        localStorage.setItem('username', inputUsername);
        const userData = await response.json();
        if (userData.length === 0) {
          await createUser(inputUsername);
        } else {
          fetchMessages(inputUsername);
        }
      } else {
        console.error('Ошибка при проверке существования пользователя:', response.statusText);
      }
    } else {
      // Можно добавить обработку, если пользователь не ввел имя
    }
  };


  useEffect(() => {
    requestUsername();
  }, []);

  useEffect(() => {
    const messagesContainer = document.getElementById('messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);
  const fetchMessages = async (username) => {
    try {
      const response = await fetch(`/messages/${username}`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        console.error('Ошибка при загрузке сообщений:', response.statusText);
      }
    } catch (error) {
      console.error('Ошибка при загрузке сообщений:', error);
    }
  };

  const sendMessage = async () => {
    if (message.trim() !== '') {
      if (!username) {
        requestUsername();
        return;
      }

      const response = await fetch('/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: message, username }),
      });

      if (response.ok) {
        const newMessage = { content: message, username };
        setMessages([...messages, newMessage]);
        setMessage('');
      } else {
        console.error('Ошибка при отправке сообщения:', response.statusText);
      }
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div id="messages-container" className="messages">
        {messages.map((msg, index) => (
          <div key={index} className="message">
            <strong>{msg.username}:</strong> {msg.content}
          </div>
        ))}
      </div>
      <div className="input-container">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Введите сообщение..."
        />
        <button onClick={sendMessage}>Отправить</button>
      </div>
    </div>
  );
};

export default App;
