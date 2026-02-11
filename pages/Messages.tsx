
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../lib/mockDb';
import { Message, User } from '../types';
import { useAppContext } from '../App';

const MessagesPage: React.FC = () => {
  const { user } = useAppContext();
  const [conversations, setConversations] = useState<{ [key: string]: Message[] }>({});
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  const fetchConversations = () => {
    if (!user) return;
    const messages = db.getMessages();
    const threads: { [key: string]: Message[] } = {};
    
    messages.filter(m => m.senderId === user.id || m.receiverId === user.id).forEach(m => {
      const otherId = m.senderId === user.id ? m.receiverId : m.senderId;
      if (!threads[otherId]) threads[otherId] = [];
      threads[otherId].push(m);
    });

    // Mark current thread as read
    if (activeThreadId) {
      let changed = false;
      const updatedMessages = messages.map(m => {
        if (m.receiverId === user.id && m.senderId === activeThreadId && !m.read) {
          changed = true;
          return { ...m, read: true };
        }
        return m;
      });
      if (changed) {
        db.saveMessages(updatedMessages);
      }
    }

    setConversations(threads);
  };

  useEffect(() => {
    fetchConversations();
    // Real-time polling
    const interval = setInterval(fetchConversations, 2000);
    return () => clearInterval(interval);
  }, [user, activeThreadId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, activeThreadId]);

  const getUserName = (id: string) => {
    return db.getUsers().find(u => u.id === id)?.fullName || 'Member';
  };

  const sendMessage = () => {
    if (!replyText.trim() || !activeThreadId || !user) return;
    const allMessages = db.getMessages();
    const newMessage: Message = {
      id: Math.random().toString(36).substr(2, 9),
      senderId: user.id,
      receiverId: activeThreadId,
      content: replyText.trim(),
      timestamp: Date.now(),
      read: false
    };
    
    db.saveMessages([...allMessages, newMessage]);
    setReplyText('');
    fetchConversations();
  };

  const activeMessages = activeThreadId ? (conversations[activeThreadId] || []) : [];

  return (
    <div className="flex h-[calc(100vh-12rem)] bg-white rounded-[4rem] border border-stone-100 shadow-2xl overflow-hidden mt-8">
      {/* Sidebar - Threads */}
      <div className="w-1/3 border-r border-stone-50 flex flex-col bg-[#fafaf9]">
        <div className="p-10 border-b border-stone-50">
          <h2 className="text-xl font-black uppercase tracking-widest text-stone-900">Inbox</h2>
          <p className="text-[9px] font-bold text-stone-400 uppercase tracking-widest mt-1">Direct recruitment workspace</p>
        </div>
        <div className="flex-1 overflow-y-auto no-scrollbar">
          {Object.keys(conversations).sort((a,b) => {
            const lastA = conversations[a][conversations[a].length - 1].timestamp;
            const lastB = conversations[b][conversations[b].length - 1].timestamp;
            return lastB - lastA;
          }).map(otherId => {
            const lastMsg = conversations[otherId][conversations[otherId].length - 1];
            const unreadCount = conversations[otherId].filter(m => m.receiverId === user?.id && !m.read).length;
            return (
              <button 
                key={otherId}
                onClick={() => setActiveThreadId(otherId)}
                className={`w-full p-10 text-left border-b border-stone-50 transition-all flex items-center gap-6 group ${activeThreadId === otherId ? 'bg-white shadow-inner' : 'hover:bg-white'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm transition-all group-hover:scale-110 ${activeThreadId === otherId ? 'bg-orange-700 text-white shadow-orange-100' : 'bg-stone-100 text-stone-400'}`}>
                  {getUserName(otherId).charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-sm font-black truncate tracking-tight transition-all ${activeThreadId === otherId ? 'text-orange-700' : 'text-stone-800'}`}>{getUserName(otherId)}</span>
                    <span className="text-[8px] text-stone-300 font-bold uppercase tracking-tighter">{new Date(lastMsg.timestamp).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className={`text-[10px] truncate uppercase tracking-widest ${unreadCount > 0 ? 'text-stone-900 font-black' : 'text-stone-400 font-medium'}`}>{lastMsg.content}</p>
                    {unreadCount > 0 && <span className="w-5 h-5 bg-orange-700 rounded-full flex items-center justify-center text-[8px] text-white font-black animate-pulse">{unreadCount}</span>}
                  </div>
                </div>
              </button>
            );
          })}
          {Object.keys(conversations).length === 0 && (
            <div className="p-20 text-center text-stone-200 font-black uppercase text-[10px] tracking-[0.4em] italic opacity-40">No threads</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {activeThreadId ? (
          <>
            <div className="p-8 bg-white border-b border-stone-50 flex items-center gap-5">
               <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white font-black text-sm">
                 {getUserName(activeThreadId).charAt(0)}
               </div>
               <div>
                 <h3 className="font-black text-stone-900 uppercase tracking-widest text-xs">{getUserName(activeThreadId)}</h3>
                 <p className="text-[8px] font-bold text-orange-600 uppercase tracking-[0.2em] mt-0.5">Secure Workspace</p>
               </div>
            </div>
            <div className="flex-1 p-12 overflow-y-auto space-y-8 no-scrollbar">
              {activeMessages.sort((a,b) => a.timestamp - b.timestamp).map(m => {
                const isMe = m.senderId === user?.id;
                return (
                  <div key={m.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                    <div className={`max-w-[65%] p-8 rounded-[2.5rem] shadow-sm text-sm font-medium leading-loose tracking-tight ${isMe ? 'bg-stone-900 text-white rounded-tr-none shadow-xl shadow-stone-200' : 'bg-[#fafaf9] text-stone-700 rounded-tl-none border border-stone-100'}`}>
                      {m.content}
                      <div className={`text-[8px] mt-4 font-black uppercase tracking-widest ${isMe ? 'text-stone-500 text-right' : 'text-stone-300'}`}>
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <div className="p-12 bg-white border-t border-stone-50 flex gap-6">
              <input 
                className="flex-1 p-6 bg-[#fafaf9] border border-stone-100 rounded-[2.5rem] text-sm font-bold outline-none focus:ring-4 focus:ring-orange-50 focus:border-orange-200 transition-all shadow-inner placeholder:text-stone-300"
                placeholder="Type your reply..."
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && sendMessage()}
              />
              <button 
                onClick={sendMessage}
                className="px-14 bg-stone-900 text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-orange-700 shadow-2xl shadow-stone-100 transition-all active:scale-95"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-stone-200 p-20 text-center">
             <div className="w-40 h-40 bg-[#fafaf9] rounded-[4rem] flex items-center justify-center mb-10 border border-stone-100">
               <svg className="w-16 h-16 text-stone-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
             </div>
             <h3 className="text-3xl font-black text-stone-300 uppercase tracking-tighter mb-4 italic opacity-20">Stall Messaging</h3>
             <p className="font-black uppercase tracking-[0.4em] text-[10px] opacity-40 max-w-xs leading-loose">Initialize a professional thread to begin collaboration</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
