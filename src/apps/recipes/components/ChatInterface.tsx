import React, { useState, useRef, useEffect } from 'react';
import './ChatInterface.css';

const ChatInterface = ({ messages, onSendMessage }) => {
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const message = inputValue.trim();
    setInputValue('');
    setIsLoading(true);

    try {
      await onSendMessage(message);
    } catch (error: unknown) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const formatMessage = (content) => {
    // Simple markdown-like formatting for code blocks
    return content
      .split('```json')
      .map((part, index: number) => {
        if (index === 0) return part;
        const [code, ...rest] = part.split('```');
        return (
          <span key={index}>
            <div className="code-block">
              <div className="code-header">Recipe JSON</div>
              <pre><code>{code}</code></pre>
            </div>
            {rest.join('```')}
          </span>
        );
      });
  };

  return (
    <div className="chat-interface">
      <div className="chat-header">
        <h3>Recipe Assistant Chat</h3>
        <div className="chat-status">
          {isLoading && <span className="loading-indicator">Thinking...</span>}
        </div>
      </div>

      <div className="chat-messages">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <div className="assistant-avatar">🤖</div>
            <div className="message-content">
              <p>Hi! I'm your recipe assistant. I can help you:</p>
              <ul>
                <li>Create custom recipes based on your preferences</li>
                <li>Suggest ingredient substitutions</li>
                <li>Modify cooking techniques</li>
                <li>Scale recipes up or down</li>
                <li>Provide flavor pairing ideas</li>
              </ul>
              <p>What kind of dish would you like to make today?</p>
            </div>
          </div>
        ) : (
          messages.map((message, index: number) => (
            <div key={index} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                <div className="message-text">
                  {formatMessage(message.content)}
                </div>
                <div className="message-timestamp">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <div className="input-container">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me about recipes, ingredients, cooking techniques..."
            className="chat-input"
            rows="3"
            disabled={isLoading}
          />
          <button 
            type="submit" 
            className="send-button"
            disabled={!inputValue.trim() || isLoading}
          >
            {isLoading ? '⏳' : '📤'}
          </button>
        </div>
        <div className="input-hints">
          <span>Press Enter to send • Shift+Enter for new line</span>
        </div>
      </form>
    </div>
  );
};

export default ChatInterface;
