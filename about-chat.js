(function () {
  var chat = document.getElementById('about-inline-chat');
  if (!chat) return;

  chat.innerHTML = [
    '<div class="chat-actions">',
      '<button class="chat-action" type="button" aria-label="Reset chat">',
        '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
      '</button>',
    '</div>',
    '<div class="chat-messages" role="log" aria-live="polite">',
      '<div class="chat-welcome">',
        '<p class="chat-welcome__text"><img src="images/carlos-avatar-about.jpg" alt="" class="chat-welcome__avatar">Hey, ask away.</p>',
        '<p class="chat-welcome__hint">Ask me anything or try one of these:</p>',
        '<div class="chat-starters">',
          '<button class="chat-starter" type="button">Tell me about your time at DDS</button>',
          '<button class="chat-starter" type="button">What’s your design philosophy?</button>',
          '<button class="chat-starter" type="button">How do you approach simplifying complex systems?</button>',
          '<button class="chat-starter" type="button">What makes a great designer?</button>',
        '</div>',
      '</div>',
    '</div>',
    '<div class="chat-input-area"><div class="chat-input-wrap">',
      '<input class="chat-input" type="text" placeholder="Carlos LLM" aria-label="Type a message" maxlength="500" autocomplete="off">',
      '<button class="chat-send" type="button" aria-label="Send message" disabled>',
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
      '</button>',
    '</div></div>'
  ].join('');

  var resetButton = chat.querySelector('.chat-action');
  var messagesEl = chat.querySelector('.chat-messages');
  var input = chat.querySelector('.chat-input');
  var sendButton = chat.querySelector('.chat-send');
  var welcomeHTML = messagesEl.innerHTML;
  var messages = [];
  var isLoading = false;

  function bindStarters() {
    chat.querySelectorAll('.chat-starter').forEach(function (button) {
      button.addEventListener('click', function () { sendMessage(button.textContent); });
    });
  }

  function resetChat() {
    messages = [];
    isLoading = false;
    messagesEl.innerHTML = welcomeHTML;
    input.value = '';
    sendButton.disabled = true;
    bindStarters();
  }

  function addMessage(role, content) {
    var message = document.createElement('div');
    message.className = 'chat-msg chat-msg--' + (role === 'user' ? 'user' : 'bot');
    message.textContent = content;
    messagesEl.appendChild(message);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function addTyping() {
    var typing = document.createElement('div');
    typing.className = 'chat-msg chat-msg--bot';
    typing.dataset.typing = 'true';
    typing.innerHTML = '<div class="chat-typing"><span></span><span></span><span></span></div>';
    messagesEl.appendChild(typing);
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  function removeTyping() {
    var typing = messagesEl.querySelector('[data-typing="true"]');
    if (typing) typing.remove();
  }

  function sendMessage(text) {
    if (!text || isLoading) return;
    var welcome = messagesEl.querySelector('.chat-welcome');
    if (welcome) welcome.remove();
    messages.push({ role: 'user', content: text });
    addMessage('user', text);
    input.value = '';
    isLoading = true;
    sendButton.disabled = true;
    addTyping();

    fetch('https://carlos-chat-proxy.vercel.app/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      body: JSON.stringify({ messages: messages })
    })
      .then(function (response) {
        if (!response.ok) {
          if (response.status === 429) throw new Error('Slow down a bit, try again in a minute.');
          throw new Error('Something went wrong. Try again.');
        }
        return response.json();
      })
      .then(function (data) {
        removeTyping();
        var reply = data.response || "Hmm, I don't have an answer for that right now. Try asking me something else.";
        messages.push({ role: 'assistant', content: reply });
        addMessage('assistant', reply);
      })
      .catch(function (error) {
        removeTyping();
        messages.pop();
        var errorEl = document.createElement('div');
        errorEl.className = 'chat-error';
        errorEl.textContent = error.message;
        messagesEl.appendChild(errorEl);
      })
      .finally(function () {
        isLoading = false;
        sendButton.disabled = !input.value.trim();
      });
  }

  resetButton.addEventListener('click', resetChat);
  input.addEventListener('input', function () {
    sendButton.disabled = !input.value.trim() || isLoading;
  });
  input.addEventListener('keydown', function (event) {
    if (event.key === 'Enter' && !sendButton.disabled) sendMessage(input.value.trim());
  });
  sendButton.addEventListener('click', function () {
    if (!sendButton.disabled) sendMessage(input.value.trim());
  });
  bindStarters();
}());
