(function () {
  function loadSupabaseCDN(callback) {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.min.js';
    script.onload = callback;
    document.head.appendChild(script);
  }

  function initializeChat() {
    // Inject CSS styles
    const style = document.createElement('style');
    style.innerHTML = `
      #chat-container {
        position: fixed;
        bottom: 60px; /* Adjusted to account for the chat button height */
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
        bottom: 20px; /* Adjusted for proper positioning */
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
      #callout::after {
        content: '';
        position: absolute;
        bottom: -10px;
        right: 20px;
        width: 0;
        height: 0;
        border: 10px solid transparent;
        border-top-color: #007bff;
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
      const supabaseUrl = 'https://dvsoyesscauzsirtjthh.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR2c295ZXNzY2F1enNpcnRqdGhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTQzNTU4NDQsImV4cCI6MjAyOTkzMTg0NH0.3HoGdobfXm7-SJtRSVF7R9kraDNHBFsiEaJunMjwpHk'; // Replace with your Supabase key
      const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

      // Initialize Socket.io client with secure WebSocket
      const socket = io('https://glorious-goggles-vxqv66jqvv7c7gx-3000.app.github.dev/', { // Replace with your server URL
        transports: ['websocket'],
        secure: true,
        reconnect: true,
        rejectUnauthorized: false // Allow self-signed certificates (only for development)
      });

      // Event listeners for connection
      socket.on('connect', () => {
        console.log('WebSocket connection established successfully');
      });

      socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
      });

      socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
      });

     const chatMessages = document.getElementById('chat-messages');
      const chatInput = document.getElementById('chat-input');
      const chatSend = document.getElementById('chat-send');
      const chatHeader = document.getElementById('chat-header');
      const welcomeScreen = document.getElementById('welcome-screen');
      const preChatForm = document.getElementById('pre-chat-form');
      const chatInputContainer = document.getElementById('chat-input-container');
      const startChatButton = document.getElementById('start-chat');
      const calloutButton = document.getElementById('callout');

      // Toggle chat visibility
      chatHeader.addEventListener('click', () => {
        chatContainer.classList.toggle('show');
      });

      // Callout button click handler
      calloutButton.addEventListener('click', () => {
        chatContainer.classList.toggle('show');
      });

      // Function to display messages
      function displayMessage(message, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        messageDiv.textContent = message;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }

      // Function to send a message
      function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        const userId = localStorage.getItem('userId');
        if (!userId) {
          console.error('User ID not found in local storage.');
          return;
        }

        displayMessage(message, 'user');

        // Send message to the server
        socket.emit('message', { message, from: 'user', userId });

        // Clear the input
        chatInput.value = '';
      }

      chatSend.addEventListener('click', sendMessage);

      chatInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
          event.preventDefault();
          sendMessage();
        }
      });

      // Show pre-chat form if no user data exists
      function showPreChatForm() {
        welcomeScreen.style.display = 'none';
        preChatForm.style.display = 'flex';
      }

      // Check if user data is stored in localStorage
      const storedUserName = localStorage.getItem('userName');
      const storedUserEmail = localStorage.getItem('userEmail');
      const storedUserId = localStorage.getItem('userId');

      // If user data is found in localStorage, skip the form and start the chat
      startChatButton.addEventListener('click', () => {
        if (storedUserName && storedUserEmail && storedUserId) {
          // Load previous messages
          preChatForm.style.display = 'none';
          chatInputContainer.style.display = 'flex';
          loadPreviousMessages(storedUserId);
        } else {
          // If no user data, show the pre-chat form
          showPreChatForm();
        }
      });

      // Handle pre-chat form submission
      preChatForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const userName = document.getElementById('user-name').value;
        const userEmail = document.getElementById('user-email').value;

        // Store user data in local storage
        localStorage.setItem('userName', userName);
        localStorage.setItem('userEmail', userEmail);

        // Save user information to Supabase
        const { data: profile, error } = await supabase
          .from('chatusers')
          .insert({ name: userName, email: userEmail })
          .select();

        if (error) {
          console.error('Error saving user information:', error);
          return;
        }

        const userId = profile[0].id;
        localStorage.setItem('userId', userId);

        preChatForm.style.display = 'none';
        chatInputContainer.style.display = 'flex';

        loadPreviousMessages(userId);
      });

      // Function to load previous messages
      async function loadPreviousMessages(userId) {
        const { data: messages, error } = await supabase
          .from('messages')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error loading messages:', error);
          return;
        }

        messages.forEach((msg) => {
          displayMessage(msg.message, msg.sender === 'user' ? 'user' : 'agent');
        });
      }

      // Load previous messages if the user has already chatted
      if (storedUserId) {
        loadPreviousMessages(storedUserId);
      }
    });
  }

  // Initialize the chat interface when the document is ready
  document.addEventListener('DOMContentLoaded', initializeChat);
})();
