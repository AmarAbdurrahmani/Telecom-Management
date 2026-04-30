import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore.js';
import api from '../../api/axios.js';

const EMOJIS = ['👍','❤️','😂','😮','😢','👏','🔥','✅','⚡','🎉'];

const ROLE_COLORS = {
  admin: 'bg-violet-600',
  tl:    'bg-blue-600',
  sv:    'bg-emerald-600',
  agent: 'bg-slate-600',
};
const ROLE_LABELS = {
  admin: 'Admin',
  tl:    'Team Lead',
  sv:    'Supervisor',
  agent: 'Agjent',
};

function Avatar({ name, roli }) {
  const initials = name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?';
  return (
    <div className={`w-8 h-8 rounded-full ${ROLE_COLORS[roli] ?? 'bg-slate-500'} flex items-center justify-center text-white text-[11px] font-black flex-shrink-0`}>
      {initials}
    </div>
  );
}

export default function MSChat() {
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const [msg, setMsg] = useState('');
  const [showEmoji, setShowEmoji] = useState(null);
  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    titulli: '', pershkrimi: '', prioriteti: 'medium', assigned_to: '', due_date: '',
  });
  const bottomRef = useRef(null);

  const { data, isLoading } = useQuery({
    queryKey: ['chat'],
    queryFn: () => api.get('/chat?per_page=100').then(r => r.data),
    refetchInterval: 3000,
    staleTime: 0,
  });

  const { data: staffData } = useQuery({
    queryKey: ['staff-list'],
    queryFn: () => api.get('/staff-list').then(r => r.data),
    staleTime: 60000,
  });

  const messages = data?.data ?? [];

  const sendMutation = useMutation({
    mutationFn: (mesazhi) => api.post('/chat', { mesazhi }),
    onSuccess: () => { qc.invalidateQueries(['chat']); setMsg(''); },
  });

  const reactMutation = useMutation({
    mutationFn: ({ id, emoji }) => api.post(`/chat/${id}/react`, { emoji }),
    onSuccess: () => qc.invalidateQueries(['chat']),
  });

  const taskMutation = useMutation({
    mutationFn: (data) => api.post('/tasks', data),
    onSuccess: () => {
      setTaskModal(false);
      setTaskForm({ titulli: '', pershkrimi: '', prioriteti: 'medium', assigned_to: '', due_date: '' });
    },
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    sendMutation.mutate(msg.trim());
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#f0edf8] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#f0edf8] flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <div>
            <p className="text-[14px] font-black text-slate-800">TelekomiYt · Staff Chat</p>
            <p className="text-[10px] text-slate-400 font-medium">{(staffData ?? []).length} anetare aktiv</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTaskModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ede9f7] text-[#7c5cdb] rounded-xl text-[12px] font-bold hover:bg-violet-100 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Cakto Detyre
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-5 h-5 border-2 border-[#7c5cdb] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">Ende nuk ka mesazhe.</div>
        ) : (
          messages.map((m) => {
            const isMe = m.sender_id === user?.id;
            return (
              <div key={m.message_id} className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : ''}`}>
                {!isMe && <Avatar name={m.sender?.name} roli={m.sender?.roli} />}
                <div className={`max-w-[72%] group relative`}>
                  {!isMe && (
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[11px] font-bold text-slate-700">{m.sender?.name}</span>
                      <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-full text-white ${ROLE_COLORS[m.sender?.roli] ?? 'bg-slate-400'}`}>
                        {ROLE_LABELS[m.sender?.roli] ?? m.sender?.roli}
                      </span>
                    </div>
                  )}
                  <div className={`relative rounded-2xl px-3.5 py-2.5 text-[13px] font-medium leading-relaxed
                    ${isMe
                      ? 'bg-[#7c5cdb] text-white rounded-br-sm'
                      : 'bg-[#f8f7fc] text-slate-800 rounded-bl-sm border border-[#f0edf8]'
                    }`}
                  >
                    {m.mesazhi}
                    {m.emoji_reaction && (
                      <span className="absolute -bottom-2.5 right-2 text-[14px] bg-white border border-[#f0edf8] rounded-full px-1 shadow-sm">
                        {m.emoji_reaction}
                      </span>
                    )}
                  </div>
                  {/* Emoji picker trigger */}
                  <button
                    onClick={() => setShowEmoji(showEmoji === m.message_id ? null : m.message_id)}
                    className={`absolute ${isMe ? 'left-0 -translate-x-6' : 'right-0 translate-x-6'} bottom-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-700`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  {/* Emoji picker */}
                  {showEmoji === m.message_id && (
                    <div className={`absolute ${isMe ? 'right-full mr-2' : 'left-full ml-2'} bottom-0 bg-white border border-[#f0edf8] rounded-2xl shadow-xl p-2 flex gap-1 z-10`}>
                      {EMOJIS.map(e => (
                        <button
                          key={e}
                          onClick={() => { reactMutation.mutate({ id: m.message_id, emoji: e }); setShowEmoji(null); }}
                          className="w-8 h-8 rounded-xl hover:bg-[#f0edf8] flex items-center justify-center text-lg transition-colors"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  )}
                  <p className={`text-[10px] mt-0.5 ${isMe ? 'text-right text-slate-400' : 'text-slate-400'}`}>
                    {new Date(m.created_at).toLocaleTimeString('sq-AL', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                {isMe && <Avatar name={m.sender?.name ?? user?.name} roli={m.sender?.roli ?? user?.roli} />}
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="px-4 pb-4 pt-2 border-t border-[#f0edf8] flex-shrink-0">
        <div className="flex items-center gap-2 bg-[#f8f7fc] border border-[#f0edf8] rounded-2xl px-3 py-2">
          <Avatar name={user?.name} roli={user?.roli} />
          <input
            value={msg}
            onChange={e => setMsg(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Shkruaj mesazhin..."
            className="flex-1 bg-transparent text-[13px] font-medium text-slate-800 placeholder-slate-400 outline-none"
          />
          <button
            type="submit"
            disabled={!msg.trim() || sendMutation.isPending}
            className="w-8 h-8 rounded-xl bg-[#7c5cdb] flex items-center justify-center text-white disabled:opacity-40 hover:bg-violet-700 transition-colors flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </form>

      {/* Task assignment modal */}
      {taskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,10,30,0.5)' }}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-[15px] font-black text-slate-800 mb-4">Cakto Detyre</h3>
            <div className="space-y-3">
              <input
                value={taskForm.titulli}
                onChange={e => setTaskForm(f => ({ ...f, titulli: e.target.value }))}
                placeholder="Titulli i detyrës*"
                className="w-full px-3 py-2.5 border border-[#f0edf8] rounded-xl text-[13px] font-medium outline-none focus:border-[#7c5cdb]/40"
              />
              <textarea
                value={taskForm.pershkrimi}
                onChange={e => setTaskForm(f => ({ ...f, pershkrimi: e.target.value }))}
                placeholder="Pershkrimi (opsional)"
                rows={2}
                className="w-full px-3 py-2.5 border border-[#f0edf8] rounded-xl text-[13px] font-medium outline-none focus:border-[#7c5cdb]/40 resize-none"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={taskForm.prioriteti}
                  onChange={e => setTaskForm(f => ({ ...f, prioriteti: e.target.value }))}
                  className="px-3 py-2.5 border border-[#f0edf8] rounded-xl text-[13px] font-medium outline-none bg-white"
                >
                  <option value="low">E ulet</option>
                  <option value="medium">Mesatare</option>
                  <option value="high">E larte</option>
                  <option value="urgent">Urgjente</option>
                </select>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={e => setTaskForm(f => ({ ...f, due_date: e.target.value }))}
                  className="px-3 py-2.5 border border-[#f0edf8] rounded-xl text-[13px] font-medium outline-none"
                />
              </div>
              <select
                value={taskForm.assigned_to}
                onChange={e => setTaskForm(f => ({ ...f, assigned_to: e.target.value }))}
                className="w-full px-3 py-2.5 border border-[#f0edf8] rounded-xl text-[13px] font-medium outline-none bg-white"
              >
                <option value="">Cakto tek punetori*</option>
                {(staffData ?? []).map(s => (
                  <option key={s.id} value={s.id}>{s.name} ({ROLE_LABELS[s.roli] ?? s.roli})</option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setTaskModal(false)}
                className="flex-1 py-2.5 border border-[#f0edf8] rounded-xl text-[13px] font-bold text-slate-600 hover:bg-[#f8f7fc] transition-colors"
              >
                Anulo
              </button>
              <button
                onClick={() => taskMutation.mutate({
                  ...taskForm,
                  tipi: 'general',
                  assigned_to: parseInt(taskForm.assigned_to),
                })}
                disabled={!taskForm.titulli || !taskForm.assigned_to || taskMutation.isPending}
                className="flex-1 py-2.5 bg-[#7c5cdb] text-white rounded-xl text-[13px] font-bold hover:bg-violet-700 disabled:opacity-40 transition-colors"
              >
                {taskMutation.isPending ? 'Duke derguar...' : 'Cakto Detyrën'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
