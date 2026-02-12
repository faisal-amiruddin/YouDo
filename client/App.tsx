
import React, { useState, useEffect, useCallback } from 'react';
import { api } from './api';
import { Task, User, Priority } from './types';
import Button from './components/Button';
import Input from './components/Input';
import TaskCard from './components/TaskCard';
import Loader from './components/Loader';
import ConfirmModal from './components/ConfirmModal';

// Theme Toggle Component
const ThemeToggle: React.FC<{ isDark: boolean; toggle: () => void }> = ({ isDark, toggle }) => (
  <button
    onClick={toggle}
    className={`
      w-16 h-8 border-4 border-black dark:border-white rounded-full relative 
      bg-white dark:bg-black transition-colors neo-brutal-shadow
    `}
    aria-label="Toggle Dark Mode"
  >
    <div
      className={`
        absolute top-[-4px] left-[-4px] w-8 h-8 border-4 border-black dark:border-white rounded-full 
        bg-[#ffdf00] dark:bg-[#00f0ff] transition-transform duration-300 flex items-center justify-center
        ${isDark ? 'translate-x-8' : 'translate-x-0'}
      `}
    >
      {isDark ? '🌙' : '☀️'}
    </div>
  </button>
);

// Priority Select Component
const PrioritySelect: React.FC<{ value: Priority; onChange: (v: Priority) => void }> = ({ value, onChange }) => (
  <div className="mb-6">
    <label className="block mb-2 font-black uppercase tracking-wider text-black dark:text-white">Priority Level</label>
    <div className="flex gap-4">
      {(['low', 'medium', 'high'] as Priority[]).map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onChange(p)}
          className={`
            flex-1 py-3 border-4 border-black dark:border-white font-black uppercase transition-all transform
            ${value === p 
              ? 'bg-black text-white dark:bg-white dark:text-black neo-brutal-shadow-active scale-95' 
              : 'bg-white text-black dark:bg-[#2a2a2a] dark:text-white neo-brutal-shadow hover:translate-y-[-2px]'}
          `}
        >
          {p}
        </button>
      ))}
    </div>
  </div>
);

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('youdo_token'));
  const [isRegister, setIsRegister] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<number | null>(null);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('youdo_theme') === 'dark';
  });

  // Form states
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [taskForm, setTaskForm] = useState({
    id: null as number | null,
    title: '',
    description: '',
    priority: 'medium' as Priority,
    due_date: '',
    is_completed: false,
    show: false
  });

  // Effect for Dark Mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('youdo_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('youdo_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await api.tasks.getAll();
      if (res.success) {
        setTasks(res.data.tasks);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      const savedUser = localStorage.getItem('youdo_user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
      fetchTasks();
    }
  }, [token, fetchTasks]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      let res;
      if (isRegister) {
        res = await api.auth.register(authForm.name, authForm.email, authForm.password);
      } else {
        res = await api.auth.login(authForm.email, authForm.password);
      }

      if (res.success) {
        setToken(res.data.token);
        setUser(res.data.user);
        localStorage.setItem('youdo_token', res.data.token);
        localStorage.setItem('youdo_user', JSON.stringify(res.data.user));
      } else {
        setError(res.message || res.error || 'Operation failed');
      }
    } catch (err: any) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('youdo_token');
    localStorage.removeItem('youdo_user');
  };

  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const formattedDueDate = taskForm.due_date 
        ? new Date(taskForm.due_date).toISOString() 
        : undefined;

      if (taskForm.id) {
        await api.tasks.update(taskForm.id, {
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          due_date: formattedDueDate,
          is_completed: taskForm.is_completed 
        });
      } else {
        await api.tasks.create({
          title: taskForm.title,
          description: taskForm.description,
          priority: taskForm.priority,
          due_date: formattedDueDate
        });
      }
      setTaskForm({ id: null, title: '', description: '', priority: 'medium', due_date: '', is_completed: false, show: false });
      fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
      setLoading(false);
    }
  };

  const handleToggleComplete = async (task: Task) => {
    setLoading(true);
    try {
      await api.tasks.update(task.id, { 
        title: task.title, 
        description: task.description,
        priority: task.priority,
        due_date: task.due_date || undefined,
        is_completed: !task.is_completed 
      });
      await fetchTasks();
    } catch (err: any) {
      setError(err.message || 'Update failed');
      setLoading(false);
    }
  };

  const executeDeleteTask = async () => {
    if (taskToDelete === null) return;
    setLoading(true);
    try {
      await api.tasks.delete(taskToDelete);
      await fetchTasks();
      setTaskToDelete(null);
    } catch (err: any) {
      setError(err.message || 'Delete failed');
      setLoading(false);
    }
  };

  const confirmDeleteTask = (id: number) => {
    setTaskToDelete(id);
  };

  const handleEditTask = (task: Task) => {
    setTaskForm({
      id: task.id,
      title: task.title,
      description: task.description,
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      is_completed: task.is_completed,
      show: true
    });
  };

  const incompleteTasks = tasks.filter(t => !t.is_completed).sort((a, b) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
  const completedTasks = tasks.filter(t => t.is_completed).sort((a, b) => new Date(b.updated_at || 0).getTime() - new Date(a.updated_at || 0).getTime());

  // Count urgent tasks (due date exists, not completed, diff <= 3 days)
  const urgentCount = incompleteTasks.filter(task => {
    if (!task.due_date) return false;
    const due = new Date(task.due_date);
    const now = new Date();
    due.setHours(0,0,0,0);
    now.setHours(0,0,0,0);
    const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays <= 3;
  }).length;

  // --- RENDER AUTH VIEW ---
  if (!token) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 relative bg-grid bg-[#f3f3f3] dark:bg-[#121212] overflow-hidden`}>
        {loading && <Loader />}
        
        {/* Decorative Blobs */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-[#ffdf00] border-4 border-black dark:border-white rounded-full neo-brutal-shadow animate-bounce delay-100 hidden md:block"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 bg-[#00f0ff] border-4 border-black dark:border-white transform rotate-12 neo-brutal-shadow hidden md:block"></div>

        <div className="w-full max-w-lg z-10">
            <div className="flex justify-between items-center mb-6">
                <div className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 text-xl font-black border-4 border-transparent dark:border-transparent -skew-x-12">
                   EST. 2025
                </div>
                <ThemeToggle isDark={isDarkMode} toggle={toggleTheme} />
            </div>

            <div className="bg-white dark:bg-[#1a1a1a] border-4 border-black dark:border-white p-8 md:p-12 neo-brutal-shadow-lg transform rotate-1 md:rotate-2 transition-transform hover:rotate-0">
                <h1 className="text-7xl font-black uppercase mb-2 text-black dark:text-white leading-[0.8]">
                    YOU<span className="text-[#ff5555]">DO</span>.
                </h1>
                <p className="font-bold text-xl uppercase tracking-widest mb-8 text-gray-600 dark:text-gray-400">
                    Get Sh*t Done. No Excuses.
                </p>
                
                {error && (
                    <div className="bg-[#ff5555] text-white border-4 border-black dark:border-white p-4 font-bold uppercase mb-6 neo-brutal-shadow animate-pulse">
                        ⚠️ {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">
                    {isRegister && (
                    <Input 
                        label="FULL NAME" 
                        placeholder="ALAN TURING" 
                        value={authForm.name} 
                        onChange={e => setAuthForm({ ...authForm, name: e.target.value })} 
                        required
                    />
                    )}
                    <Input 
                    label="EMAIL ADDRESS" 
                    type="email" 
                    placeholder="NAME@EXAMPLE.COM" 
                    value={authForm.email} 
                    onChange={e => setAuthForm({ ...authForm, email: e.target.value })} 
                    required
                    />
                    <Input 
                    label="PASSWORD" 
                    type="password" 
                    placeholder="••••••••" 
                    value={authForm.password} 
                    onChange={e => setAuthForm({ ...authForm, password: e.target.value })} 
                    required
                    />
                    
                    <Button type="submit" variant="primary" className="w-full text-xl py-4 mt-4 bg-[#00f0ff] hover:bg-[#00d0df]" disabled={loading}>
                    {isRegister ? 'JOIN THE CLUB' : 'ENTER DASHBOARD'}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t-4 border-black dark:border-white text-center">
                    <p className="font-bold text-black dark:text-white uppercase mb-4">
                        {isRegister ? 'Already a member?' : 'New around here?'}
                    </p>
                    <button 
                        className="font-black text-lg uppercase underline decoration-4 underline-offset-4 hover:text-[#ff5555] dark:text-white dark:hover:text-[#00f0ff] transition-colors"
                        onClick={() => {
                            setIsRegister(!isRegister);
                            setError(null);
                        }}
                    >
                        {isRegister ? 'Log In Now' : 'Create Account'}
                    </button>
                </div>
            </div>
        </div>
      </div>
    );
  }

  // --- RENDER DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-[#f3f3f3] dark:bg-[#121212] transition-colors duration-300">
      {loading && <Loader />}
      
      <ConfirmModal 
        isOpen={taskToDelete !== null}
        title="DELETE TASK?"
        message="Are you sure you want to delete this task? This action cannot be undone!"
        onConfirm={executeDeleteTask}
        onCancel={() => setTaskToDelete(null)}
      />

      {/* HEADER */}
      <header className="border-b-4 border-black dark:border-white bg-white dark:bg-[#1a1a1a] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-4">
                <div className="bg-black text-white dark:bg-white dark:text-black w-12 h-12 flex items-center justify-center font-black text-2xl border-2 border-transparent">
                    YD
                </div>
                <h1 className="text-3xl hidden md:block font-black uppercase tracking-tight text-black dark:text-white">YouDo</h1>
            </div>

            <div className="flex items-center gap-4 md:gap-6">
                 <span className="hidden md:block font-bold uppercase text-sm border-r-4 border-black dark:border-white pr-6 dark:text-white">
                    USER: {user?.name}
                 </span>
                 <ThemeToggle isDark={isDarkMode} toggle={toggleTheme} />
                 <Button variant="danger" onClick={handleLogout} className="px-4 py-2 text-sm">
                    Exit
                 </Button>
            </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        
        {/* STATS BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            <div className="bg-[#ffdf00] border-4 border-black dark:border-white p-4 neo-brutal-shadow">
                <p className="font-bold text-xs uppercase mb-1 text-black">Total Tasks</p>
                <p className="font-black text-4xl text-black">{tasks.length}</p>
            </div>
            <div className="bg-[#00f0ff] border-4 border-black dark:border-white p-4 neo-brutal-shadow">
                <p className="font-bold text-xs uppercase mb-1 text-black">Pending</p>
                <p className="font-black text-4xl text-black">{incompleteTasks.length}</p>
            </div>
            <div className="bg-[#86efac] border-4 border-black dark:border-white p-4 neo-brutal-shadow">
                <p className="font-bold text-xs uppercase mb-1 text-black">Completed</p>
                <p className="font-black text-4xl text-black">{completedTasks.length}</p>
            </div>
            <button 
                onClick={() => setTaskForm({ ...taskForm, show: true, id: null, title: '', description: '', priority: 'medium', due_date: '', is_completed: false })}
                className="bg-black dark:bg-white text-white dark:text-black border-4 border-black dark:border-white p-4 neo-brutal-shadow hover:translate-y-1 active:translate-y-2 flex items-center justify-center gap-2 group"
            >
                <span className="text-4xl leading-none group-hover:rotate-90 transition-transform duration-300">+</span>
                <span className="font-black uppercase text-lg">New Task</span>
            </button>
        </div>

        {error && <div className="bg-[#ff5555] text-white border-4 border-black dark:border-white p-4 font-bold uppercase mb-8 neo-brutal-shadow">{error}</div>}

        {/* MODAL FORM */}
        {taskForm.show && (
          <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-[#f0f0f0] dark:bg-[#222] border-4 border-black dark:border-white p-6 md:p-8 w-full max-w-2xl neo-brutal-shadow-lg max-h-[90vh] overflow-y-auto relative animate-in fade-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center mb-8 border-b-4 border-black dark:border-white pb-4">
                  <h2 className="text-4xl font-black uppercase text-black dark:text-white">{taskForm.id ? 'Edit Mission' : 'New Mission'}</h2>
                  <button onClick={() => setTaskForm({ ...taskForm, show: false })} className="text-4xl font-black hover:text-[#ff5555] dark:text-white dark:hover:text-[#ff5555]">&times;</button>
              </div>
              
              <form onSubmit={handleTaskSubmit}>
                <Input 
                  label="Mission Title" 
                  placeholder="e.g., CONQUER THE WORLD"
                  value={taskForm.title} 
                  onChange={e => setTaskForm({ ...taskForm, title: e.target.value })} 
                  required
                />
                <Input 
                  label="Briefing / Details" 
                  isTextArea 
                  placeholder="Details of the operation..."
                  value={taskForm.description} 
                  onChange={e => setTaskForm({ ...taskForm, description: e.target.value })} 
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <PrioritySelect 
                    value={taskForm.priority} 
                    onChange={val => setTaskForm({ ...taskForm, priority: val })} 
                    />
                    <Input 
                    label="Deadline" 
                    type="date" 
                    value={taskForm.due_date} 
                    onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })} 
                    />
                </div>

                <div className="flex gap-4 mt-8 pt-6 border-t-4 border-black dark:border-white">
                  <Button type="submit" variant="success" className="flex-1 py-4 text-xl" disabled={loading}>
                    {taskForm.id ? 'UPDATE MISSION' : 'INITIATE MISSION'}
                  </Button>
                  <Button type="button" variant="danger" className="flex-1" onClick={() => setTaskForm({ ...taskForm, show: false })}>
                    ABORT
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* URGENCY ALERT BANNER */}
        {urgentCount > 0 && (
          <div className="mb-8 border-4 border-black dark:border-white bg-[#ff5555] p-4 neo-brutal-shadow flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🚨</span>
              <div>
                <h3 className="text-2xl font-black uppercase text-white leading-none">Warning: Deadline approaching!</h3>
                <p className="font-bold text-white uppercase text-sm mt-1">{urgentCount} missions require immediate attention (Less than 3 days left).</p>
              </div>
            </div>
          </div>
        )}

        {/* INCOMPLETE TASKS SECTION */}
        <div className="mb-20">
            <div className="flex items-end gap-4 mb-8 border-b-4 border-black dark:border-white pb-2">
              <h2 className="text-5xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-black to-gray-500 dark:from-white dark:to-gray-500">
                PENDING
              </h2>
            </div>
            
            {incompleteTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {incompleteTasks.map(task => (
                <TaskCard 
                  key={task.id} 
                  task={task} 
                  onToggleComplete={handleToggleComplete}
                  onDelete={confirmDeleteTask}
                  onEdit={handleEditTask}
                />
              ))}
            </div>
          ) : (
            <div className="border-4 border-dashed border-black dark:border-white/50 p-12 text-center bg-white/50 dark:bg-white/5 rounded-lg">
              <p className="text-2xl font-black uppercase text-gray-400 mb-4">NO ACTIVE MISSIONS</p>
              <p className="text-gray-500 dark:text-gray-400 font-bold">The world is safe... for now.</p>
            </div>
          )}
        </div>

        {/* COMPLETED TASKS SECTION */}
        {completedTasks.length > 0 && (
          <div className="opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex items-end gap-4 mb-8 border-b-4 border-black dark:border-white pb-2">
                <h2 className="text-4xl font-black uppercase text-gray-500 dark:text-gray-400">
                  ARCHIVE
                </h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {completedTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onToggleComplete={handleToggleComplete}
                    onDelete={confirmDeleteTask}
                    onEdit={handleEditTask}
                  />
                ))}
              </div>
          </div>
        )}
      </main>

      <footer className="mt-20 py-8 border-t-4 border-black dark:border-white bg-white dark:bg-[#1a1a1a] text-center">
        <p className="font-bold uppercase tracking-widest text-xs md:text-sm text-black dark:text-white">
            YouDo System v2.0 // Neobrutalism Edition // {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
};

export default App;
