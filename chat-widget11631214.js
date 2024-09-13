(function () {
  function loadSupabaseCDN(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
    script.onload = callback;
    script.onerror = () => console.error('Failed to load Supabase CDN');
    document.head.appendChild(script);
  }

  function initializeChat() {
    console.log('Initializing chat...');
    // Inject CSS styles
    const style = document.createElement('style');
    style.innerHTML = `
      #chat-container {
        position: fixed;
        bottom: 60px;
        right: 20px;
        width: 400px;
        height: 500px;
        background-color: #fff;
        border: 2px solid #007bff;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        display: flex;
        flex-direction: column;
        font-family: Arial, sans-serif;
        z-index: 10000;
        transform: translateY(100%);
        transition: transform 0.3s ease;
        visibility: hidden; /* Hidden by default */
      }
      #chat-container.show {
        transform: translateY(0);
        visibility: visible; /* Make visible when shown */
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
        border-top: 1px solid #ddd;
        padding: 10px;
        background-color: #f4f4f4;
        display: flex;
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
        bottom: 20px;
        right: 20px;
        background-color: #007bff;
        color: white;
        border-radius: 16px;
        padding: 10px 15px;
        box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
        display: flex;
        align-items: center;
        gap: 10px;
        transition: opacity 0.5s ease, transform 0.5s ease;
        cursor: pointer;
        z-index: 9999;
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
      .message.user::after {
        content: '';
        position: absolute;
        top: 10px;
        right: -10px;
        width: 0;
        height: 0;
        border: 10px solid transparent;
        border-left-color: #007bff;
      }
      .message.agent {
        background-color: #f1f0f0;
        color: black;
        align-self: flex-start;
        border-top-right-radius: 0;
      }
      .message.agent::after {
        content: '';
        position: absolute;
        top: 10px;
        left: -10px;
        width: 0;
        height: 0;
        border: 10px solid transparent;
        border-right-color: #f1f0f0;
      }
      #pre-chat-form {
        display: flex;
        flex-direction: column;
        padding: 20px;
        flex: 1;
        justify-content: center;
        align-items: center;
        gap: 10px;
      }
      #pre-chat-form input {
        width: 90%;
        padding: 10px;
        border: 1px solid #ddd;
        border-radius: 8px;
        font-size: 14px;
        outline: none;
      }
      #pre-chat-form button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 8px;
        font-size: 16px;
      }
      #welcome-screen {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        padding: 20px;
        flex: 1;
        gap: 10px;
      }
      #welcome-screen h2 {
        margin: 0;
        font-size: 18px;
        color: #333;
      }
      #welcome-screen button {
        background-color: #007bff;
        color: white;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 8px;
        font-size: 16px;
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
      <div id="welcome-screen">
        <h2>Welcome to our Live Chat!</h2>
        <button id="start-chat">Start Chat</button>
      </div>
      <form id="pre-chat-form" style="display: none;">
        <input type="text" id="user-name" placeholder="Enter your name" required />
        <input type="email" id="user-email" placeholder="Enter your email" required />
        <button type="submit">Start Chat</button>
      </form>
      <div id="chat-messages"></div>
      <div id="chat-input-container" style="display: none;">
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
    `;
    document.body.appendChild(callout);

    // Initialize Supabase after the CDN is loaded
    loadSupabaseCDN(() => {
      console.log('Supabase CDN loaded successfully');
      const supabaseUrl = 'https://dvsoyesscauzsirtjthh.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2c295ZXNzY2F1enNpcnRqdGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQzNTU4NDQsImV4cCI6MjAyOTkzMTg0NH0.3HoGdobfXm7-SJtRSVF7R9kraDNHBFsiEaJunMjwpHk'; // Replace with your Supabase key
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

      // Initialize Socket.io client with secure WebSocket
      const socket = io('https://glorious-goggles-vxqv66jqvv7c7gx-3000.app.github.dev/', { // Replace with your server URL
        transports: ['websocket'],
        secure: true,
      });

      console.log('Socket.io and Supabase initialized');

      const chatHeader = document.getElementById('chat-header');
      const chatMessages = document.getElementById('chat-messages');
      const chatInputContainer = document.getElementById('chat-input-container');
      const chatInput = document.getElementById('chat-input');
      const chatSend = document.getElementById('chat-send');
      const chatContainer = document.getElementById('chat-container');
      const welcomeScreen = document.getElementById('welcome-screen');
      const preChatForm = document.getElementById('pre-chat-form');
      const callout = document.getElementById('callout');
      const startChatButton = document.getElementById('start-chat');

      function appendMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.textContent = text;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      // Chat functionality
      function handleSendMessage() {
        const message = chatInput.value.trim();
        if (message) {
          appendMessage(message, 'user');
          socket.emit('message', message); // Send message to the server
          chatInput.value = '';
        }
      }

      // Receive messages from the server
      socket.on('message', (message) => {
        appendMessage(message, 'agent');
      });

      // Handle pre-chat form submission
      preChatForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const userName = document.getElementById('user-name').value.trim();
        const userEmail = document.getElementById('user-email').value.trim();

        // Save user data in local storage
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', userEmail);

        // Send user data to Supabase
        supabase.from('chatusers')
          .insert([{ name: userName, email: userEmail }])
          .then(({ data, error }) => {
            if (error) {
              console.error('Error saving user data:', error);
            } else {
              console.log('User data saved:', data);
            }
          });

        welcomeScreen.style.display = 'none';
        preChatForm.style.display = 'none';
        chatMessages.style.display = 'flex';
        chatInputContainer.style.display = 'flex';

        chatContainer.classList.add('show');
      });

      // Toggle chat visibility
      callout.addEventListener('click', () => {
        chatContainer.classList.add('show');
        callout.style.opacity = '0';
        setTimeout(() => {
          callout.style.display = 'none';
        }, 500);
      });

      chatHeader.addEventListener('click', () => {
        chatContainer.classList.remove('show');
        callout.style.display = 'flex';
        setTimeout(() => {
          callout.style.opacity = '1';
        }, 10);
      });

      startChatButton.addEventListener('click', () => {
        welcomeScreen.style.display = 'none';
        preChatForm.style.display = 'flex';
      });

      chatSend.addEventListener('click', handleSendMessage);
      chatInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          handleSendMessage();
        }
      });

      // Background polling to check if user left the chat
      setInterval(() => {
        if (!chatContainer.classList.contains('show')) {
          localStorage.removeItem('userName');
          localStorage.removeItem('userEmail');
          console.log('User has left the chat, local storage cleared');
        }
      }, 5000); // Check every 5 seconds
    });
  }

  // Initialize the chat application
  initializeChat();
})();
