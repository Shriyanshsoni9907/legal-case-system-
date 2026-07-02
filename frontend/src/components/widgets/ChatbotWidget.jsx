import React, { useState, useEffect, useRef } from 'react';
import chatService from '../../services/chatService';
import { MessageSquare, X, Send, Bot, Sparkles, Loader2, ArrowRight } from 'lucide-react';

const SUGGESTED_CHIPS = [
  "How many active cases do I have?",
  "Show my upcoming hearings",
  "Who are the firm's clients?",
  "List our firm lawyers"
];

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! I am your **Coderlly Manage AI Assistant**. Ask me anything about cases, upcoming hearings, clients, or attorneys.",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setLoading(true);

    try {
      const response = await chatService.sendMessage(textToSend);
      const botReply = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: response.data.reply,
        timestamp: new Date(),
        mode: response.data.mode
      };
      setMessages(prev => [...prev, botReply]);
    } catch (err) {
      const errorReply = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: "I'm sorry, I encountered an issue querying the database. Please check if the backend server is running.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(inputValue);
  };

  // Helper to convert basic markdown-like structures (**bold**) in replies
  const renderMessageText = (text) => {
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = text.split(boldRegex);
    return parts.map((part, i) => {
      if (i % 2 === 1) {
        return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part}</strong>;
      }
      // Handle simple linebreaks
      if (part.includes('\n')) {
        return part.split('\n').map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            {idx < part.split('\n').length - 1 && <br />}
          </React.Fragment>
        ));
      }
      return part;
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Chat Drawer */}
      {isOpen && (
        <div className="w-[380px] sm:w-[400px] h-[550px] bg-white rounded-2xl border border-slate-150 shadow-2xl flex flex-col mb-4 overflow-hidden animate-in slide-in-from-bottom-5 duration-200">
          
          {/* Header */}
          <div className="bg-primary text-white p-4 flex items-center justify-between border-b border-primary-dark shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="h-9 w-9 rounded-lg bg-accent/20 flex items-center justify-center border border-accent/20">
                <Bot className="h-5 w-5 text-accent animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold tracking-wide">Coderlly Manage AI Assistant</h3>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-[10px] text-blue-200 font-semibold tracking-wider uppercase">System Connected</span>
                </div>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              <X className="h-4 w-4 text-white" />
            </button>
          </div>

          {/* Messages body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                className={`flex items-start gap-2.5 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar Icon */}
                <div className={`h-8 w-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  msg.sender === 'user' 
                    ? 'bg-accent/15 text-accent border border-accent/20' 
                    : 'bg-primary text-white'
                }`}>
                  {msg.sender === 'user' ? 'ME' : <Bot className="h-4.5 w-4.5" />}
                </div>

                {/* Message Bubble */}
                <div className="flex flex-col max-w-[75%]">
                  <div className={`rounded-2xl p-3 text-sm shadow-xs border ${
                    msg.sender === 'user' 
                      ? 'bg-accent text-white border-accent/30 rounded-tr-none' 
                      : 'bg-white text-slate-800 border-slate-100 rounded-tl-none'
                  }`}>
                    {renderMessageText(msg.text)}
                  </div>
                  <span className={`text-[10px] text-slate-400 mt-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    {msg.mode && (
                      <span className="ml-1 text-accent font-semibold">
                        ({msg.mode === 'generative' ? 'GenAI' : 'Local NLP'})
                      </span>
                    )}
                  </span>
                </div>
              </div>
            ))}

            {/* Typing Loader Indicator */}
            {loading && (
              <div className="flex items-start gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary text-white flex items-center justify-center">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none p-3.5 shadow-xs flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-accent" />
                  <span className="text-xs font-semibold text-slate-500">Retrieving context facts...</span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick chip options (visible only when not busy) */}
          {!loading && (
            <div className="p-3 bg-slate-100/50 border-t border-slate-150 flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {SUGGESTED_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(chip)}
                  className="text-xs px-2.5 py-1.5 bg-white hover:bg-slate-50 border border-slate-200/60 rounded-full text-slate-600 hover:text-slate-900 transition-colors font-medium flex items-center gap-1"
                >
                  {chip}
                  <ArrowRight className="h-3 w-3 text-slate-450" />
                </button>
              ))}
            </div>
          )}

          {/* Footer Input form */}
          <form 
            onSubmit={handleFormSubmit}
            className="p-3 border-t border-slate-150 bg-white flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask AI Assistant about cases..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent text-sm disabled:bg-slate-50 disabled:text-slate-400"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || loading}
              className="h-10 w-10 bg-accent hover:bg-accent-hover disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-xl flex items-center justify-center transition-colors shadow-md shadow-accent/15"
            >
              <Send className="h-4.5 w-4.5" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Action Button bubble */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="h-14 w-14 rounded-full bg-accent hover:bg-accent-hover text-white flex items-center justify-center shadow-lg shadow-accent/25 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
        title="Open AI Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : (
          <div className="relative">
            <MessageSquare className="h-6 w-6" />
            <Sparkles className="h-3.5 w-3.5 text-yellow-350 absolute -top-1.5 -right-1.5 animate-bounce" />
          </div>
        )}
      </button>
    </div>
  );
};

export default ChatbotWidget;
