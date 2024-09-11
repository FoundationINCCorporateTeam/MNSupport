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
        display: none; /* Hidden by default */
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
        display: flex;
        flex-direction: column;
        color: black;
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
      .message-bubble {
        padding: 10px;
        margin: 5px;
        border-radius: 15px;
        max-width: 70%;
        word-wrap: break-word;
      }
      .message-bubble.user {
        background-color: #dcf8c6;
        align-self: flex-end;
      }
      .message-bubble.agent {
        background-color: #ffffff;
        border: 1px solid #ddd;
        align-self: flex-start;
      }
      #chat-toggle {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background-color: #007bff;
        color: white;
        padding: 10px;
        border-radius: 50%;
        cursor: pointer;
        z-index: 10001;
      }
      #callout {
        position: fixed;
        bottom: 80px;
        right: 20px;
        background-color: #007bff;
        color: white;
        padding: 10px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        cursor: pointer;
        animation: callout-animation 10s infinite;
      }
      #callout .close-btn {
        margin-left: 10px;
        background: none;
        border: none;
        color: white;
        font-size: 16px;
        cursor: pointer;
      }
      @keyframes callout-animation {
        0% { transform: translateY(0); }
        50% { transform: translateY(-20px); }
        100% { transform: translateY(0); }
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

    const chatToggle = document.createElement('div');
    chatToggle.id = 'chat-toggle';
    chatToggle.textContent = 'Chat';
    document.body.appendChild(chatToggle);

    const callout = document.createElement('div');
    callout.id = 'callout';
    callout.innerHTML = `
      <span>Chat with us!</span>
      <button class="close-btn">×</button>
    `;
    document.body.appendChild(callout);

    // Connect to the server (replace with your server URL)
    const socket = io('https://glorious-goggles-vxqv66jqvv7c7gx-3000.app.github.dev'); // Replace with your server URL
    const chatMessages = document.getElementById('chat-messages');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatContainer = document.getElementById('chat-container');
    const chatToggle = document.getElementById('chat-toggle');
    const callout = document.getElementById('callout');
    const closeCallout = callout.querySelector('.close-btn');

    // Function to append messages to the chat display
    function appendMessage(name, message) {
      const messageElement = document.createElement('div');
      messageElement.className = `message-bubble ${name.toLowerCase()}`;
      messageElement.textContent = `${message}`;
      chatMessages.appendChild(messageElement);
      chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll to the latest message
    }

    // Handle incoming messages
    socket.on('message', (data) => {
      appendMessage(data.name, data.message);
    });

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

    // Toggle chat visibility
    chatToggle.addEventListener('click', () => {
      chatContainer.style.display = chatContainer.style.display === 'none' ? 'flex' : 'none';
    });

    // Close callout
    closeCallout.addEventListener('click', () => {
      callout.style.display = 'none';
    });

    // Hide chat initially
    chatContainer.style.display = 'none';
  }

  // Wait for DOM to load before initializing the chat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChat);
  } else {
    initializeChat();
  }
})();
