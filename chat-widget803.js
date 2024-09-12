<!-- Chat Widget HTML and CSS/JS -->
(function () {
  function initializeChat() {
    // Inject CSS styles
    const style = document.createElement('style');
    style.innerHTML = `
      #chat-container {
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 400px; /* Increased width */
        height: 500px; /* Increased height */
        background-color: #fff;
        border: 2px solid #007bff;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        font-family: Arial, sans-serif;
        z-index: 10000;
        transform: translateY(100%);
        transition: transform 0.3s ease, bottom 0.3s ease; /* Smooth transition */
      }
      #chat-container.show {
        transform: translateY(0);
      }
      #chat-header {
        background-color: #007bff;
        color: white;
        padding: 15px;
        text-align: center;
        border-top-left-radius: 16px;
        border-top-right-radius: 16px;
        cursor: pointer;
        font-size: 18px;
        font-weight: bold;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      #chat-header span {
        flex: 1;
        text-align: center;
      }
      #chat-close {
        font-size: 16px;
        cursor: pointer;
        padding: 0 10px;
      }
      #chat-messages {
        flex: 1;
        padding: 15px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 10px;
        background-color: #f9f9f9;
        border-top: 1px solid #ddd;
      }
      #chat-input-container {
        display: flex;
        border-top: 1px solid #ddd;
        padding: 10px;
        background-color: #f4f4f4;
        align-items: center;
      }
      #chat-input {
        flex: 1;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 20px;
        outline: none;
        margin-right: 10px;
        font-size: 14px;
      }
      #chat-send {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 15px;
        cursor: pointer;
        border-radius: 50%;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      #callout {
        position: fixed;
        bottom: 100px;
        right: 20px;
        background-color: #007bff;
        color: white;
        border-radius: 12px;
        padding: 10px 15px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        transition: opacity 0.5s ease, transform 0.5s ease; /* Add animation for callout */
      }
      #callout-dismiss {
        background: none;
        border: none;
        font-size: 16px;
        cursor: pointer;
        color: white;
      }
      .message {
        padding: 10px 15px;
        border-radius: 20px;
        max-width: 75%;
        display: inline-block;
        word-wrap: break-word;
        position: relative;
        animation: fadeIn 0.3s ease;
        font-size: 14px;
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
      <div id="chat-header">
        <span>Live Chat</span>
        <button id="chat-close">✕</button>
      </div>
      <div id="chat-messages"></div>
      <div id="chat-input-container">
        <input type="text" id="chat-input" placeholder="Type a message..." />
        <button id="chat-send">➤</button>
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
    const chatClose = document.getElementById('chat-close');

    let chatVisible = false;

    // Show chat container
    function showChat() {
      chatContainer.classList.add('show');
      chatVisible = true;
      callout.style.display = 'none';
    }

    // Hide chat container
    function hideChat() {
      chatContainer.classList.remove('show');
      chatVisible = false;
      showCallout();
    }

    // Show callout message
    function showCallout() {
      callout.style.opacity = 1;
      callout.style.transform = 'translateY(0)';
      setTimeout(() => {
        callout.style.opacity = 0;
        callout.style.transform = 'translateY(20px)';
      }, 10000); // Show for 10 seconds
    }

    // Handle callout dismiss
    document.getElementById('callout-dismiss').addEventListener('click', () => {
      callout.style.opacity = 0;
      if (!chatVisible) {
        chatVisible = false;
      }
    });

    // Toggle chat container visibility
    chatHeader.addEventListener('click', () => {
      if (chatVisible) {
        hideChat();
      } else {
        showChat();
      }
    });

    // Close chat on button click
    chatClose.addEventListener('click', () => {
      hideChat();
    });

    // Handle incoming messages
    socket.on('message', (data) => {
      appendMessage(data.name === 'User' ? 'You' : 'Agent', data.message);
      saveMessageToLocalStorage(data.name, data.message);
    });

    // Append message to chat
    function appendMessage(name, message) {
      const messageElement = document.createElement('div');
      messageElement.className = `message ${name === 'You' ? 'user' : 'agent'}`;
      messageElement.textContent = message;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
    }

    // Handle sending messages
    function sendMessage() {
      const message = chatInput.value.trim();
      if (message) {
        appendMessage('You', message); // Display the message immediately on the client's chat
        socket.emit('message', { message, from: 'user' }); // Send the message to the server
        chatInput.value = ''; // Clear the input field
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
