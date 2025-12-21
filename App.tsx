import React, { useState, useEffect, useRef } from 'react';
import { supabase, ALLOWED_EMAIL, STORAGE_BUCKET } from './services/supabaseClient';
import { Link, Memo, Doc, ViewState } from './types';
import { Session } from '@supabase/supabase-js';

// --- Icons ---
const Icons = {
  Lock: () => <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>,
  Settings: () => <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>,
  Edit: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>,
  File: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>,
  Image: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
  PDF: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M10 13h1v4h-1z"/><path d="M14 13h1v4h-1z"/><path d="M6 13h1v4h-1z"/></svg>,
  Download: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Eye: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>,
  Upload: () => <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>,
  Music: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>,
  Video: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
};

// Helper for Doc Icons
const getFileIcon = (filename: string) => {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'tiff'].includes(ext || '')) {
    return <div className="p-2 bg-purple-50 text-purple-600 rounded-lg flex-shrink-0"><Icons.Image /></div>;
  }
  
  // Audio Support
  if (['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'].includes(ext || '')) {
    return <div className="p-2 bg-pink-50 text-pink-600 rounded-lg flex-shrink-0"><Icons.Music /></div>;
  }

  // Video Support
  if (['mp4', 'mov', 'avi', 'webm', 'mkv', 'flv', 'wmv'].includes(ext || '')) {
    return <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg flex-shrink-0"><Icons.Video /></div>;
  }
  
  if (ext === 'pdf') {
    return <div className="p-2 bg-red-50 text-red-600 rounded-lg flex-shrink-0"><span className="font-bold text-xs">PDF</span></div>;
  }
  
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext || '')) {
    return <div className="p-2 bg-blue-50 text-blue-600 rounded-lg flex-shrink-0"><span className="font-bold text-xs">DOC</span></div>;
  }
  
  if (['xls', 'xlsx', 'csv'].includes(ext || '')) {
    return <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg flex-shrink-0"><span className="font-bold text-xs">XLS</span></div>;
  }

  if (['ppt', 'pptx'].includes(ext || '')) {
    return <div className="p-2 bg-orange-50 text-orange-600 rounded-lg flex-shrink-0"><span className="font-bold text-xs">PPT</span></div>;
  }

  // Archives
  if (['zip', 'rar', '7z', 'tar', 'gz'].includes(ext || '')) {
    return <div className="p-2 bg-gray-100 text-gray-600 rounded-lg flex-shrink-0"><span className="font-bold text-xs">ZIP</span></div>;
  }

  return <div className="p-2 bg-gray-100 text-gray-500 rounded-lg flex-shrink-0"><Icons.File /></div>;
};

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<ViewState>('links-view');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Ref to handle notification timeout cleanup
  const notificationTimeoutRef = useRef<number | null>(null);

  // Data States
  const [links, setLinks] = useState<Link[]>([]);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    // Check for existing session
    const initSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;
        validateSession(session);
      } catch (err) {
        console.error("Session check failed", err);
        setLoading(false); 
      }
    };

    initSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      validateSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const validateSession = (session: Session | null) => {
    if (session) {
      if (session.user.email !== ALLOWED_EMAIL) {
        supabase.auth.signOut();
        setSession(null);
        showNotification("Access Restricted: Unauthorized Email", 'error');
        setLoading(false);
      } else {
        setSession(session);
        fetchData(session.user.id).finally(() => setLoading(false));
      }
    } else {
      setSession(null);
      setLinks([]);
      setMemos([]);
      setDocs([]);
      setLoading(false);
    }
  };

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    // Clear any existing timeout to prevent premature dismissal of new messages
    if (notificationTimeoutRef.current) {
        window.clearTimeout(notificationTimeoutRef.current);
    }

    setNotification({ message, type });
    
    // Set timer for 1 second (Reduced from 1.5)
    notificationTimeoutRef.current = window.setTimeout(() => {
        setNotification(null);
        notificationTimeoutRef.current = null;
    }, 1000);
  };

  const fetchData = async (userId: string) => {
    try {
      const [linksRes, memosRes, docsRes] = await Promise.all([
        supabase.from('links').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('memos').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
        supabase.from('docs').select('*').eq('user_id', userId).order('created_at', { ascending: false })
      ]);

      if (linksRes.error) throw linksRes.error;
      if (memosRes.error) throw memosRes.error;
      if (docsRes.error) throw docsRes.error;

      if (linksRes.data) setLinks(linksRes.data);
      if (memosRes.data) setMemos(memosRes.data);
      if (docsRes.data) setDocs(docsRes.data);
    } catch (error: any) {
      console.error("Error fetching data:", error);
      showNotification(`Error loading data: ${error.message || 'Unknown error'}`, 'error');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        <div className="text-gray-500 font-medium mt-4">Loading Hub...</div>
      </div>
    );
  }

  return (
    <>
      {/* Global Notification Banner */}
      {notification && (
        <div className={`fixed top-4 right-4 sm:top-6 sm:right-6 px-4 py-3 rounded-lg text-white shadow-lg z-50 transition-opacity duration-300 font-medium text-sm flex items-center gap-2 ${notification.type === 'error' ? 'bg-red-500' : 'bg-emerald-600'}`}>
          {notification.message}
        </div>
      )}

      {!session ? (
        <LoginScreen showNotification={showNotification} />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-start pt-4 sm:pt-6 p-3 sm:p-4 bg-[#f8fafc] font-sans">
          <div className="w-full max-w-2xl flex flex-col items-center animate-fade-in">
            {/* Header */}
            <header className="w-full bg-yellow-300 border-none rounded-2xl p-2 sm:p-3 flex flex-nowrap items-center shadow-lg mb-6 gap-2 sm:gap-4 sticky top-4 z-40">
              <div className="flex flex-col flex-shrink-0 ml-1">
                <span className="text-[14px] text-black-800 font-extrabold uppercase tracking-widest">Welcome!</span>
                <span className="text-base sm:text-lg font-black text-red-500 leading-none">Aayush</span>
              </div>

              <nav className="flex-1 min-w-0 overflow-x-auto flex items-center gap-1 sm:gap-2 px-1 scrollbar-hide">
                <NavButton label="Links" active={currentView === 'links-view'} onClick={() => setCurrentView('links-view')} />
                <NavButton label="Docs" active={currentView === 'document'} onClick={() => setCurrentView('document')} />
                <NavButton label="Memos" active={currentView === 'memo'} onClick={() => setCurrentView('memo')} />
                <button 
                  onClick={() => setCurrentView('settings')} 
                  className={`flex items-center justify-center p-2 rounded-lg font-bold transition-all ${currentView === 'settings' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-700 hover:bg-white/50'}`}
                >
                  <Icons.Settings />
                </button>
              </nav>

              <button 
                onClick={() => supabase.auth.signOut()} 
                className="flex-shrink-0 bg-red-500 hover:bg-red-600 text-white font-bold py-1.5 px-3 rounded-lg shadow transition-colors flex items-center text-sm"
              >
                Logout
              </button>
            </header>

            {/* Content Area */}
            <div className="w-full transition-opacity duration-300">
              {currentView === 'links-view' && (
                <LinksView 
                  links={links} 
                  userId={session.user.id} 
                  refresh={() => fetchData(session.user.id)} 
                  notify={showNotification} 
                />
              )}
              {currentView === 'document' && (
                <DocsView 
                  docs={docs} 
                  userId={session.user.id} 
                  refresh={() => fetchData(session.user.id)} 
                  notify={showNotification} 
                />
              )}
              {currentView === 'memo' && (
                <MemosView 
                  memos={memos} 
                  userId={session.user.id} 
                  refresh={() => fetchData(session.user.id)} 
                  notify={showNotification} 
                />
              )}
              {currentView === 'settings' && (
                <SettingsView notify={showNotification} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// --- Sub Components ---

const LoginScreen: React.FC<{ showNotification: (msg: string, type: 'error' | 'success') => void }> = ({ showNotification }) => {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email: ALLOWED_EMAIL,
      password: password
    });

    if (error) {
      showNotification("Access denied. Incorrect password", 'error');
      setPassword('');
      setLoading(false); 
    } else {
        // Success case: state change triggers App re-render.
        // We show notification and let the useEffect in App handle the transition.
        showNotification("Access Granted", 'success');
    }
  };

  return (
    <div className="min-h-screen w-full flex items-start justify-center pt-20 bg-[#f8fafc] px-4">
      <div className="bg-white p-8 rounded-2xl w-full max-w-sm border border-gray-100 shadow-xl text-center">
        <div className="mb-5 flex justify-center">
          <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
            <Icons.Lock />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Private Hub Login</h1>
        <p className="text-gray-500 text-sm mb-6">Access restricted to Aayush Baral</p>
        <form onSubmit={handleLogin} className="space-y-4">
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition-colors text-center" 
            placeholder="Enter password" 
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-[0.98] transition-transform shadow-md disabled:opacity-70"
          >
            {loading ? 'Checking...' : 'Unlock Hub'}
          </button>
        </form>
      </div>
    </div>
  );
};

const NavButton: React.FC<{ label: string; active: boolean; onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick} 
    className={`px-3 py-2 rounded-lg font-bold text-sm sm:text-base transition-colors whitespace-nowrap ${active ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-700 hover:bg-white/50'}`}
  >
    {label}
  </button>
);

// --- VIEWS ---

const LinksView: React.FC<{ links: Link[], userId: string, refresh: () => void, notify: (m: string, t: 'success' | 'error') => void }> = ({ links, userId, refresh, notify }) => {
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ title: '', url: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { title: formData.title, url: formData.url, user_id: userId };
    
    let error;
    if (editingId) {
      const { error: err } = await supabase.from('links').update(payload).eq('id', editingId);
      error = err;
    } else {
      const { error: err } = await supabase.from('links').insert(payload);
      error = err;
    }

    if (error) notify(error.message, 'error');
    else {
      notify("Success!", 'success');
      setShowModal(false);
      refresh();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this link?")) return;
    const { error } = await supabase.from('links').delete().eq('id', id);
    if (error) notify(error.message, 'error');
    else {
      notify("Deleted", 'success');
      refresh();
    }
  };

  const openModal = (link?: Link) => {
    if (link) {
      setEditingId(link.id);
      setFormData({ title: link.title, url: link.url });
    } else {
      setEditingId(null);
      setFormData({ title: '', url: '' });
    }
    setShowModal(true);
  };

  return (
    <div className="space-y-4 w-full">
      <div className="flex justify-between items-center pb-2">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 flex items-center">
          Saved Links <span className="ml-2 text-gray-400 text-base font-medium">({links.length})</span>
        </h2>
        <button 
          onClick={() => openModal()}
          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-emerald-700 transition-colors shadow-sm flex items-center gap-1"
        >
          <Icons.Plus /> Add
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {links.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-300 text-gray-400">No links found.</div>
        ) : (
          links.map(l => (
            <div 
              key={l.id} 
              onClick={() => window.open(l.url, '_blank')}
              className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md cursor-pointer group relative flex justify-between items-center transition-all"
            >
              <div className="min-w-0 flex-1 pr-4">
                <h3 className="font-bold text-blue-700 text-base mb-1 truncate">{l.title}</h3>
                <p className="text-xs text-gray-400 truncate font-mono">{l.url}</p>
              </div>
              <div className="flex space-x-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <button onClick={() => openModal(l)} className="p-2 text-yellow-600 hover:bg-yellow-50 rounded"><Icons.Edit /></button>
                <button onClick={() => handleDelete(l.id)} className="p-2 text-red-600 hover:bg-red-50 rounded"><Icons.Trash /></button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4">{editingId ? 'Edit Link' : 'Add Link'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Title" 
                required 
                value={formData.title} 
                onChange={e => setFormData({...formData, title: e.target.value})}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <input 
                type="url" 
                placeholder="URL" 
                required 
                value={formData.url} 
                onChange={e => setFormData({...formData, url: e.target.value})}
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const MemosView: React.FC<{ memos: Memo[], userId: string, refresh: () => void, notify: (m: string, t: 'success' | 'error') => void }> = ({ memos, userId, refresh, notify }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');

  const handleSave = async () => {
    if (!content.trim() || !title.trim()) {
        notify("Title and Content are required", 'error');
        return;
    }
    const { error } = await supabase.from('memos').insert({ title, content, user_id: userId });
    if (error) notify(error.message, 'error');
    else {
      setTitle('');
      setContent('');
      refresh();
      notify("Saved", 'success');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const { error } = await supabase.from('memos').update({ title: editTitle, content: editContent }).eq('id', editingId);
    if (error) notify(error.message, 'error');
    else {
      setEditingId(null);
      refresh();
      notify("Updated", 'success');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete memo?")) return;
    const { error } = await supabase.from('memos').delete().eq('id', id);
    if (error) notify(error.message, 'error');
    else {
      refresh();
      notify("Deleted", 'success');
    }
  };

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 border-b border-gray-200 pb-4">Saved Memos <span className="text-gray-400 text-base font-medium">({memos.length})</span></h2>
      
      <div className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm space-y-2">
         <input 
          type="text" 
          placeholder="Memo Title..." 
          value={title}
          onChange={e => setTitle(e.target.value)}
          className="w-full p-2 border-b border-gray-100 focus:ring-0 text-gray-800 font-bold placeholder-gray-400 bg-transparent outline-none text-base"
        />
        <textarea 
          rows={3} 
          placeholder="Write your memo here..." 
          value={content}
          onChange={e => setContent(e.target.value)}
          className="w-full p-2 border-0 focus:ring-0 text-gray-700 placeholder-gray-400 resize-none bg-transparent outline-none text-base"
        />
        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button onClick={handleSave} className="px-4 py-1.5 bg-emerald-600 text-white text-sm font-bold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">Save</button>
        </div>
      </div>

      <div className="space-y-3 pr-1 memo-scroll">
        {memos.length === 0 ? <p className="text-center text-gray-400 py-6">No memos yet.</p> : memos.map(m => (
          <div key={m.id} className="p-4 rounded-xl bg-[#fffbeb] border border-[#fcd34d] relative group hover:shadow-sm transition-shadow">
            <h3 className="text-gray-900 font-bold mb-1 text-lg">{m.title}</h3>
            <div className="prose prose-sm max-w-none text-gray-700 whitespace-pre-wrap break-words">{m.content}</div>
            <div className="mt-3 flex justify-between items-end border-t border-[#fde68a] pt-2">
              <span className="text-xs text-yellow-700 font-semibold opacity-60">{new Date(m.created_at).toLocaleString()}</span>
              <div className="flex space-x-1 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingId(m.id); setEditTitle(m.title); setEditContent(m.content); }} className="p-1 text-yellow-800 hover:bg-yellow-200 rounded"><Icons.Edit /></button>
                <button onClick={() => handleDelete(m.id)} className="p-1 text-red-700 hover:bg-red-100 rounded"><Icons.Trash /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editingId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setEditingId(null)}>
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold mb-4">Edit Memo</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <input 
                type="text" 
                placeholder="Title" 
                value={editTitle} 
                onChange={e => setEditTitle(e.target.value)} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none font-bold" 
                required 
              />
              <textarea 
                rows={6} 
                value={editContent} 
                onChange={e => setEditContent(e.target.value)} 
                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                required 
              />
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setEditingId(null)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const DocsView: React.FC<{ docs: Doc[], userId: string, refresh: () => void, notify: (m: string, t: 'success' | 'error') => void }> = ({ docs, userId, refresh, notify }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      notify("Max file size is 50MB", 'error');
      return;
    }

    setUploading(true);
    // 1. Upload to Storage
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storagePath = `${userId}/${Date.now()}_${cleanName}`;

    const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(storagePath, file);

    if (uploadError) {
      notify(uploadError.message, 'error');
      setUploading(false);
      return;
    }

    // 2. Insert into 'docs' table
    const { error: dbError } = await supabase.from('docs').insert({
      name: file.name,
      storage_path: storagePath,
      size: file.size,
      mime_type: file.type,
      user_id: userId
    });

    if (dbError) {
      // Cleanup storage if DB insert fails
      await supabase.storage.from(STORAGE_BUCKET).remove([storagePath]);
      notify(`DB Error: ${dbError.message}`, 'error');
    } else {
      notify("Uploaded successfully", 'success');
      refresh();
    }
    setUploading(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (doc: Doc) => {
    if (!window.confirm(`Delete ${doc.name}?`)) return;

    // 1. Delete from DB first
    const { error: dbError } = await supabase.from('docs').delete().eq('id', doc.id);

    if (dbError) {
      notify(dbError.message, 'error');
      return;
    }

    // 2. Delete from Storage
    const { error: storageError } = await supabase.storage.from(STORAGE_BUCKET).remove([doc.storage_path]);
    
    if (storageError) notify(`Storage cleanup warning: ${storageError.message}`, 'error');
    
    notify("Deleted", 'success');
    refresh();
  };

  const handleDownload = async (doc: Doc) => {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).download(doc.storage_path);
    if (error) {
      notify(error.message, 'error');
      return;
    }
    const url = URL.createObjectURL(data);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleView = async (doc: Doc) => {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).createSignedUrl(doc.storage_path, 60);
    if (error) notify(error.message, 'error');
    else window.open(data.signedUrl, '_blank');
  };

  // Expanded list to include music types for "View" capability
  const isViewable = (name: string) => ['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac', '.wma'].some(ext => name.toLowerCase().endsWith(ext));

  return (
    <div className="space-y-6 w-full">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 pb-2">Saved Documents <span className="text-gray-400 text-base font-medium">({docs.length})</span></h2>
      
      <div 
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={() => setDragActive(true)}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`bg-blue-50 border-2 border-dashed rounded-xl p-6 sm:p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-100' : 'border-blue-200 hover:bg-blue-100 hover:border-blue-400'}`}
      >
        <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
          <Icons.Upload />
        </div>
        <p className="text-blue-900 font-semibold text-sm sm:text-base">{uploading ? 'Uploading...' : 'Click or Drag file here'}</p>
        <p className="text-blue-400 text-xs mt-1">Max 50MB</p>
      </div>

      <div className="space-y-3">
        {docs.length === 0 ? <div className="text-center py-6 text-gray-400 italic">No documents.</div> : docs.map(doc => (
          <div key={doc.id} className="p-4 bg-white border border-gray-200 rounded-lg flex items-center justify-between hover:shadow-md transition-colors group">
            <div className="flex items-center gap-3 overflow-hidden min-w-0">
              {getFileIcon(doc.name)}
              <div className="min-w-0">
                <h3 className="font-bold text-gray-800 text-sm truncate" title={doc.name}>{doc.name}</h3>
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                  <span>•</span>
                  <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {isViewable(doc.name) && (
                <button onClick={() => handleView(doc)} className="p-2 text-gray-400 hover:text-emerald-600 rounded hover:bg-emerald-50"><Icons.Eye /></button>
              )}
              <button onClick={() => handleDownload(doc)} className="p-2 text-gray-400 hover:text-blue-600 rounded hover:bg-blue-50"><Icons.Download /></button>
              <button onClick={() => handleDelete(doc)} className="p-2 text-gray-400 hover:text-red-600 rounded hover:bg-red-50"><Icons.Trash /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsView: React.FC<{ notify: (m: string, t: 'success' | 'error') => void }> = ({ notify }) => {
  const [form, setForm] = useState({ current: '', new: '', confirm: '' });

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.new !== form.confirm) {
      notify("Passwords do not match", 'error');
      return;
    }
    
    // Re-auth to confirm ownership before change
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: ALLOWED_EMAIL, password: form.current });
    if (signInError) {
      notify("Incorrect current password", 'error');
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: form.new });
    if (updateError) notify(updateError.message, 'error');
    else {
      notify("Password changed successfully", 'success');
      setForm({ current: '', new: '', confirm: '' });
    }
  };

  return (
    <div className="w-full">
      <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-4">Settings</h2>
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h3 className="text-base font-bold text-gray-800 mb-4 flex items-center text-red-600">Change Password</h3>
        <form onSubmit={handleChange} className="space-y-4">
          <input 
            type="password" 
            placeholder="Current Password" 
            required 
            value={form.current}
            onChange={e => setForm({...form, current: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
          />
          <input 
            type="password" 
            placeholder="New Password" 
            required 
            minLength={6}
            value={form.new}
            onChange={e => setForm({...form, new: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
          />
          <input 
            type="password" 
            placeholder="Confirm New Password" 
            required 
            minLength={6}
            value={form.confirm}
            onChange={e => setForm({...form, confirm: e.target.value})}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm" 
          />
          <button type="submit" className="w-full py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors text-sm">Update Password</button>
        </form>
      </div>
    </div>
  );
};

export default App;