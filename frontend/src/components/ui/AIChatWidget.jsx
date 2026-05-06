import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../api/axios.js';

// ─── Message bubble ───────────────────────────────────────────────────────────
function Bubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c5cdb] to-[#a78bfa] flex items-center justify-center flex-shrink-0 mb-0.5">
          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.607L5 14.5m14.8.5l-1.293 5.173a2.25 2.25 0 01-2.183 1.702H7.676a2.25 2.25 0 01-2.183-1.702L4.207 15M5 14.5V12a2.25 2.25 0 012.25-2.25h9.5A2.25 2.25 0 0119 12v2.5" />
          </svg>
        </div>
      )}
      {/* Bubble */}
      <div
        className={`max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed shadow-sm ${
          isUser
            ? 'bg-gradient-to-br from-[#7c5cdb] to-[#6d4fcb] text-white rounded-br-sm'
            : 'bg-white text-slate-800 border border-[#f0edf8] rounded-bl-sm'
        }`}
      >
        {msg.content}
      </div>
    </div>
  );
}

// ─── Typing indicator (animated dots) ────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#7c5cdb] to-[#a78bfa] flex items-center justify-center flex-shrink-0">
        <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15M14.25 3.104c.251.023.501.05.75.082M19.8 15l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.607L5 14.5m14.8.5l-1.293 5.173a2.25 2.25 0 01-2.183 1.702H7.676a2.25 2.25 0 01-2.183-1.702L4.207 15M5 14.5V12a2.25 2.25 0 012.25-2.25h9.5A2.25 2.25 0 0119 12v2.5" />
        </svg>
      </div>
      <div className="bg-white border border-[#f0edf8] rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
        <div className="flex gap-1 items-center h-4">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#7c5cdb] opacity-60 animate-bounce"
              style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.9s' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Suggested quick questions ─────────────────────────────────────────────────
const SUGGESTIONS = [
  'Çfarë paketa keni?',
  'Sa kushton interneti?',
  'Si mund ta ndryshoj paketën?',
  'A keni TV kabllor?',
];

// ─── Main widget ──────────────────────────────────────────────────────────────
export default function AIChatWidget() {
  const { isAuthenticated } = useAuthStore();
  const [open,         setOpen]         = useState(false);
  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState('');
  const [loading,      setLoading]      = useState(false);
  const [sessionToken, setSessionToken] = useState(() => localStorage.getItem('ai_chat_session') ?? null);
  const [unread,       setUnread]       = useState(0);
  const [error,        setError]        = useState('');

  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  // Greet on first open -------------------------------------------------------
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{
        role:    'assistant',
        content: 'Mirë se vini te TelekomiYt! 👋 Unë jam asistenti juaj virtual. Si mund t\'ju ndihmoj sot?',
      }]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
    if (open) setUnread(0);
  }, [open]);

  // Auto-scroll to bottom on new message -------------------------------------
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // ── Send message ────────────────────────────────────────────────────────────
  const sendMessage = useCallback(async (text) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setInput('');
    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setLoading(true);

    try {
      const { data } = await api.post('/ai-chat', {
        message:       msg,
        session_token: sessionToken,
      });

      const newToken = data.session_token;
      if (newToken && newToken !== sessionToken) {
        setSessionToken(newToken);
        localStorage.setItem('ai_chat_session', newToken);
      }

      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);

      if (!open) setUnread((n) => n + 1);
    } catch {
      setError('Dërgimi dështoi. Kontrolloni lidhjen dhe provoni sërish.');
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [loading, sessionToken, open]);

  // ── Reset conversation ──────────────────────────────────────────────────────
  const resetConversation = useCallback(async () => {
    if (sessionToken) {
      try { await api.post('/ai-chat/reset', { session_token: sessionToken }); } catch { /* ignore */ }
    }
    const newToken = null;
    setSessionToken(newToken);
    localStorage.removeItem('ai_chat_session');
    setMessages([{
      role:    'assistant',
      content: 'Biseda u ristartu. Si mund t\'ju ndihmoj?',
    }]);
    setError('');
  }, [sessionToken]);

  // ── Key handler ─────────────────────────────────────────────────────────────
  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const hasSuggestions = messages.length <= 1 && !loading;

  return (
    <>
      {/* ── Chat panel ──────────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-20 right-4 z-[9998] w-[360px] flex flex-col rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.2)] border border-[#f0edf8] bg-[#f8f7fc] overflow-hidden transition-all duration-300 origin-bottom-right ${
          open ? 'scale-100 opacity-100 pointer-events-auto' : 'scale-95 opacity-0 pointer-events-none'
        }`}
        style={{ maxHeight: 'min(520px, calc(100vh - 100px))' }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-[#7c5cdb] to-[#a78bfa] flex-shrink-0">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-black text-white leading-none">Asistenti AI</p>
            <p className="text-[10px] text-white/70 font-medium mt-0.5">TelekomiYt · Gjithmonë aktiv</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={resetConversation}
              title="Bisedë e re"
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
            </button>
            <button
              onClick={() => setOpen(false)}
              className="w-7 h-7 rounded-lg bg-white/15 hover:bg-white/25 flex items-center justify-center transition-colors"
            >
              <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0 scrollbar-hide" style={{ maxHeight: 340 }}>
          {messages.map((m, i) => <Bubble key={i} msg={m} />)}
          {loading && <TypingIndicator />}
          {error && (
            <div className="flex items-center gap-2 text-[11px] text-red-500 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {hasSuggestions && (
          <div className="px-4 pb-2 flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => sendMessage(s)}
                className="text-[11px] font-semibold text-[#7c5cdb] bg-white border border-[#e9e5f5] hover:border-[#7c5cdb] hover:bg-[#f5f3ff] px-2.5 py-1 rounded-full transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-3 bg-white border-t border-[#f0edf8] flex-shrink-0">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Shkruani mesazhin…"
            disabled={loading}
            maxLength={2000}
            className="flex-1 text-[13px] bg-[#f8f7fc] border border-[#e9e5f5] rounded-xl px-3 py-2 text-slate-800 placeholder-slate-400 outline-none focus:border-[#7c5cdb] focus:ring-1 focus:ring-[#7c5cdb]/20 transition disabled:opacity-50"
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || loading}
            className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#7c5cdb] to-[#a78bfa] flex items-center justify-center text-white disabled:opacity-40 hover:from-[#6d4fcb] hover:to-[#9370f0] transition-all shadow-[0_2px_8px_rgba(124,92,219,0.35)] flex-shrink-0"
          >
            {loading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── Floating trigger button ──────────────────────────────────────────── */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-[9999] w-14 h-14 rounded-full bg-gradient-to-br from-[#7c5cdb] to-[#a78bfa] flex items-center justify-center shadow-[0_4px_20px_rgba(124,92,219,0.5)] hover:shadow-[0_6px_28px_rgba(124,92,219,0.65)] transition-all hover:scale-105 active:scale-95"
        title="Asistenti AI"
      >
        {/* Unread badge */}
        {unread > 0 && !open && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">
            {unread}
          </span>
        )}
        <svg
          className={`w-6 h-6 text-white transition-transform duration-300 ${open ? 'rotate-180 scale-0 absolute' : 'rotate-0'}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
        {open && (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        )}
      </button>
    </>
  );
}
