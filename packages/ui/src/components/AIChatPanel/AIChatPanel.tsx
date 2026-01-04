import { useState, useRef, useEffect } from 'react';
import { CloseOutline, SendOutline, FlashOutline, TrashOutline } from 'react-ionicons';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface WorkspaceContext {
  name?: string;
  tone?: string;
  main_objectives?: string[];
  target_audience?: string;
}

interface AIChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  onClearHistory: () => void;
  isLoading?: boolean;
  workspaceContext?: WorkspaceContext | null;
  suggestions?: string[];
}

const defaultSuggestions = [
  "💡 Donne-moi 5 idées de posts pour cette semaine",
  "🎯 Analyse ma stratégie actuelle",
  "📊 Comment améliorer mon engagement ?",
  "🎣 Génère des hooks percutants",
];

export function AIChatPanel({
  isOpen,
  onClose,
  messages,
  onSendMessage,
  onClearHistory,
  isLoading = false,
  workspaceContext,
  suggestions = defaultSuggestions,
}: AIChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue;
    setInputValue('');
    await onSendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <div 
        className={`ai-chat-overlay ${isOpen ? 'ai-chat-overlay--visible' : ''}`}
        onClick={onClose}
      />

      <div className={`ai-chat-panel ${isOpen ? 'ai-chat-panel--open' : ''}`}>
        <div className="ai-chat-panel__header">
          <div className="ai-chat-panel__header-left">
            <div className="ai-chat-panel__avatar">
              <FlashOutline color="currentColor" width="20px" height="20px" />
            </div>
            <div className="ai-chat-panel__header-info">
              <h3 className="ai-chat-panel__title">Coach IA</h3>
              {workspaceContext && (
                <span className="ai-chat-panel__subtitle">{workspaceContext.name}</span>
              )}
            </div>
          </div>
          <div className="ai-chat-panel__header-actions">
            <button 
              className="ai-chat-panel__icon-btn"
              onClick={onClearHistory}
              title="Effacer l'historique"
            >
              <TrashOutline color="currentColor" width="18px" height="18px" />
            </button>
            <button 
              className="ai-chat-panel__icon-btn"
              onClick={onClose}
              title="Fermer (Esc)"
            >
              <CloseOutline color="currentColor" width="20px" height="20px" />
            </button>
          </div>
        </div>

        <div className="ai-chat-panel__messages">
          {messages.length === 0 ? (
            <div className="ai-chat-panel__empty">
              <div className="ai-chat-panel__empty-icon">
                <FlashOutline color="currentColor" width="48px" height="48px" />
              </div>
              <h4>Comment puis-je t'aider ?</h4>
              <p>Pose-moi des questions sur ta stratégie, tes performances ou tes KPIs.</p>
              
              <div className="ai-chat-panel__suggestions">
                {suggestions.map((suggestion: string, index: number) => (
                  <button
                    key={index}
                    className="ai-chat-panel__suggestion"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`ai-chat-panel__message ai-chat-panel__message--${msg.role}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="ai-chat-panel__message-avatar">
                      <FlashOutline color="currentColor" width="16px" height="16px" />
                    </div>
                  )}
                  <div className="ai-chat-panel__message-content">
                    <p>{msg.content}</p>
                    <span className="ai-chat-panel__message-time">
                      {formatTime(msg.timestamp)}
                    </span>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="ai-chat-panel__message ai-chat-panel__message--assistant">
                  <div className="ai-chat-panel__message-avatar">
                    <FlashOutline color="currentColor" width="16px" height="16px" />
                  </div>
                  <div className="ai-chat-panel__message-content ai-chat-panel__message-content--typing">
                    <span className="ai-chat-panel__dot"></span>
                    <span className="ai-chat-panel__dot"></span>
                    <span className="ai-chat-panel__dot"></span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="ai-chat-panel__input-container">
          <input
            ref={inputRef}
            type="text"
            className="ai-chat-panel__input"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Pose ta question..."
            disabled={isLoading}
          />
          <button
            className="ai-chat-panel__send"
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
          >
            <SendOutline color="currentColor" width="20px" height="20px" />
          </button>
        </div>

        <div className="ai-chat-panel__footer">
          <span>⌘K pour ouvrir/fermer</span>
        </div>
      </div>
    </>
  );
}

export default AIChatPanel;
