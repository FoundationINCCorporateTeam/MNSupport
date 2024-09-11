// chat-widget.js
(function() {
  // Inject CSS styles
  const style = document.createElement('style');
  style.innerHTML = `
    #chat-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 300px;
      height: 400px;
      background-color: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
      font-family: Arial, sans-serif;
      z-index: 10000;
    }
    #chat-header {
      background-color: #007bff;
      color: white;
      padding: 10px;
      text-align: center;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;
    }
    #chat-messages {
      flex: 1;
      padding: 10px;
      overflow-y: auto;
      border-top: 1px solid #ddd;
    }
    #chat-input-container {
      display: flex;
      border-top: 1px solid #ddd;
    }
    #chat-input {
      flex: 1;
      padding: 10px;
      border: none;
      border-bottom-left-radius: 8px;
    }
    #chat-send {
      background-color: #007bff;
      color: white;
      border: none;
      padding: 10px;
      cursor: pointer;
      border-bottom-right-radius: 8px;
    }
  `;
  document.head.appendChild(style);

  // Create chat elements
  const chatContainer = document.createElement('div');
  chatContainer.id = 'chat-container';
  
  chatContainer.innerHTML = `
    <div id="chat-header">Live Chat</div>
    <div id="chat-messages"></div>
    <div id="chat-input-container">
      <input type="text" id="chat-input" placeholder="Type a message..." />
      <button id="chat-send">Send</button>
    </div>
  `;
  document.body.appendChild(chatContainer);

  const socket = io('https://your-server-url'); // Replace with your server URL
  const chatMessages = document.getElementById('chat-messages');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');

  socket.on('connect', () => {
    console.log('Connected to chat server');
  });

  socket.on('message', (data) => {
    const messageElement = document.createElement('div');
    messageElement.textContent = `${data.name}: ${data.message}`;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
  });

  chatSend.addEventListener('click', () => {
    const message = chatInput.value;
    if (message) {
      socket.emit('message', { message });
      chatInput.value = '';
    }
  });

  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      chatSend.click();
    }
  });
})();
