// chat-widget.js
(function () {
  function initializeChat() {
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
        transition: transform 0.3s ease;
        transform: translateY(100%);
      }
      #chat-container.show {
        transform: translateY(0);
      }
      #chat-header {
        background-color: #007bff;
        color: white;
        padding: 10px;
        text-align: center;
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        cursor: pointer;
      }
      #chat-messages {
        flex: 1;
        padding: 10px;
        overflow-y: auto;
        border-top: 1px solid #ddd;
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: opacity 0.3s ease;
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
        outline: none;
      }
      #chat-send {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px;
        cursor: pointer;
        border-bottom-right-radius: 8px;
      }
      .message {
        padding: 10px;
        border-radius: 12px;
        max-width: 80%;
        display: inline-block;
        word-wrap: break-word;
        position: relative;
        animation: fadeIn 0.3s ease;
      }
      .message.user {
        background-color: #007bff;
        color: white;
        align-self: flex-end;
        border-top-left-radius: 0;
      }
      .message.agent {
        background-color: #f1f0f0;
        color: black;
        align-self: flex-start;
        border-top-right-radius: 0;
      }
      .callout {
        position: fixed;
        bottom: 100px;
        right: 20px;
        background-color: #007bff;
        color: white;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .callout button {
        background-color: transparent;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
      }
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }
    `;
    document.head.appendChild(style);

    // Create chat elements
    const chatContainer = document.createElement('div');
    chatContainer.id = 'chat-container';

    chatContainer.innerHTML = `
      <div id="chat-header">Live Chat</div>
      <div id="chat-messages" class="hidden"></div>
      <div id="chat-input-container" class="hidden">
        <input type="text" id="chat-input" placeholder="Type a message..." />
        <button id="chat-send">Send</button>
      </div>
    `;
    document.body.appendChild(chatContainer);

    // Create callout element
    const callout = document.createElement('div');
    callout.className = 'callout';
    callout.innerHTML = `
      <span>Welcome! Click here to start a chat.</span>
      <button id="callout-dismiss">X</button>
    `;
    document.body.appendChild(callout);

    // Connect to the server (replace with your server URL)
    const socket = io('https://glorious-goggles-vxqv66jqvv7c7gx-3000.app.github.dev/', { transports: ['websocket'] });

    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatHeader = document.getElementById('chat-header');
    const chatInputContainer = document.getElementById('chat-input-container');
    const calloutDismiss = document.getElementById('callout-dismiss');

    // Show chat container
    function showChat() {
      chatContainer.classList.add('show');
      chatMessages.classList.remove('hidden');
      chatInputContainer.classList.remove('hidden');
      callout.style.display = 'none';
    }

    // Handle callout dismiss
    calloutDismiss.addEventListener('click', () => {
      callout.style.display = 'none';
      showChat();
    });

    // Toggle chat container visibility
    chatHeader.addEventListener('click', () => {
      chatContainer.classList.toggle('show');
    });

    // Handle incoming messages
    socket.on('message', (data) => {
      appendMessage(data.name, data.message);
      saveMessageToLocalStorage(data.name, data.message);
    });

    // Append message to chat
    function appendMessage(name, message) {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${name === 'You' ? 'user' : 'agent'}`;
      messageElement.textContent = `${name}: ${message}`;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
    }

    // Handle sending messages
    function sendMessage() {
      const message = chatInput.value.trim();
      if (message) {
        // Display the message immediately on the client's chat
        appendMessage('You', message);

        // Send the message to the server
        socket.emit('message', { message });

        // Clear the input field
        chatInput.value = '';
      }
    }

    // Send message on button click
    chatSend.addEventListener('click', sendMessage);

    // Send message on pressing Enter key
    chatInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        sendMessage();
      }
    });

    // Save message to localStorage
    function saveMessageToLocalStorage(name, message) {
      const messages = JSON.parse(localStorage.getItem('messages')) || [];
      messages.push({ name, message, timestamp: new Date().toISOString() });
      localStorage.setItem('messages', JSON.stringify(messages));
    }

    // Load and display previous messages from localStorage
    function loadMessagesFromLocalStorage() {
      const messages = JSON.parse(localStorage.getItem('messages')) || [];
      messages.forEach(msg => {
        appendMessage(msg.name, msg.message);
      });
    }

    // Load previous messages on initialization
    loadMessagesFromLocalStorage();
  }

  // Wait for DOM to load before initializing the chat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChat);
  } else {
    initializeChat();
  }
})();
