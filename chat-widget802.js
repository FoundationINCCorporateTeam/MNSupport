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
        transform: translateY(100%);
        transition: transform 0.3s ease;
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
      #callout {
        position: fixed;
        bottom: 100px;
        right: 20px;
        background-color: #f1f0f0;
        border: 1px solid #ddd;
        border-radius: 8px;
        padding: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        transition: opacity 0.5s ease;
        cursor: pointer;
      }
      #callout-dismiss {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: #007bff;
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
      <div id="chat-messages"></div>
      <div id="chat-input-container">
        <input type="text" id="chat-input" placeholder="Type a message..." />
        <button id="chat-send">Send</button>
      </div>
    `;
    document.body.appendChild(chatContainer);

    // Create callout element
    const callout = document.createElement('div');
    callout.id = 'callout';
    callout.innerHTML = `
      <span>Need help? Click here to chat!</span>
      <button id="callout-dismiss">X</button>
    `;
    document.body.appendChild(callout);

    // Connect to the server
    const socket = io('https://glorious-goggles-vxqv66jqvv7c7gx-3000.app.github.dev/', { transports: ['websocket'] });

    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatHeader = document.getElementById('chat-header');
    const calloutDismiss = document.getElementById('callout-dismiss');

    let chatVisible = false;

    // Show chat container
    function showChat() {
      chatContainer.classList.add('show');
      callout.style.display = 'none';
      chatVisible = true;
    }

    // Hide chat container
    function hideChat() {
      chatContainer.classList.remove('show');
      if (!chatVisible) {
        callout.style.opacity = 1;
      }
      chatVisible = false;
    }

    // Handle callout click
    callout.addEventListener('click', () => {
      showChat();
    });

    // Handle callout dismiss
    calloutDismiss.addEventListener('click', () => {
      callout.style.opacity = 0;
      hideChat();
    });

    // Toggle chat container visibility by clicking header
    chatHeader.addEventListener('click', () => {
      if (chatVisible) {
        hideChat();
      } else {
        showChat();
      }
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
        socket.emit('message', { message, from: 'user' });

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

    // Load messages from localStorage
    function loadMessagesFromLocalStorage() {
      const messages = JSON.parse(localStorage.getItem('messages')) || [];
      messages.forEach((msg) => {
        appendMessage(msg.name, msg.message);
      });
    }

    // Load messages on initialization
    loadMessagesFromLocalStorage();
  }

  // Wait for DOM to load before initializing the chat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChat);
  } else {
    initializeChat();
  }
})();
