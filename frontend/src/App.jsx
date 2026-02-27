import React, { useState, useEffect } from 'react';
import { Clock, LayoutDashboard, ListTodo } from 'lucide-react';
import Timer from './components/Timer';
import TaskList from './components/TaskList';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import Register from './components/Register';
import { useAuth } from './context/AuthContext';
import { LogOut } from 'lucide-react';
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background text-textMain flex flex-col items-center justify-center p-8">
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl max-w-xl text-center">
            <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong.</h2>
            <p className="text-textMuted text-sm mb-4">The application crashed while rendering. Check the DevTools console.</p>
            <pre className="text-left text-xs bg-black/50 p-4 rounded text-red-300 overflow-x-auto">
              {this.state.error?.toString()}
            </pre>
            <button onClick={() => window.location.reload()} className="mt-4 bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded">
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  const [activeTab, setActiveTab] = useState('focus');
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-background text-textMain flex flex-col items-center justify-center p-4">
        {showRegister ? (
          <Register onSwitchToLogin={() => setShowRegister(false)} />
        ) : (
          <Login onSwitchToRegister={() => setShowRegister(true)} />
        )}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background text-textMain flex flex-col items-center py-10 px-4">
        <header className="w-full max-w-4xl mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-white fade-in">
            FocusForge
          </h1>
          <div className="flex items-center space-x-4">
            <nav className="flex space-x-2 bg-panel p-1 rounded-full border border-white/5 shadow-inner">
              <TabButton icon={<Clock size={18} />} label="Focus" isActive={activeTab === 'focus'} onClick={() => setActiveTab('focus')} />
              <TabButton icon={<ListTodo size={18} />} label="Tasks" isActive={activeTab === 'tasks'} onClick={() => setActiveTab('tasks')} />
              <TabButton icon={<LayoutDashboard size={18} />} label="Analytics" isActive={activeTab === 'analytics'} onClick={() => setActiveTab('analytics')} />
            </nav>
            <button onClick={logout} className="p-2 text-textMuted hover:text-red-400 hover:bg-red-500/10 bg-panel rounded-full border border-white/5 transition-colors shadow-sm" title="Log Out">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <main className="w-full max-w-4xl flex-1 flex flex-col relative">
          <div className={activeTab === 'focus' ? 'block flex-1' : 'hidden'}>
            <Timer selectedTaskId={selectedTaskId} />
          </div>
          <div className={activeTab === 'tasks' ? 'block flex-1' : 'hidden'}>
            <TaskList selectedTaskId={selectedTaskId} onSelectTask={setSelectedTaskId} />
          </div>
          <div className={activeTab === 'analytics' ? 'block flex-1' : 'hidden'}>
            <Dashboard isActive={activeTab === 'analytics'} />
          </div>
        </main>
      </div>
    </ErrorBoundary>
  );
}

function TabButton({ icon, label, isActive, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${isActive ? 'bg-highlight text-white shadow-md' : 'text-textMuted hover:text-white hover:bg-white/5'}`}
    >
      {icon}
      <span className="font-medium text-sm">{label}</span>
    </button>
  );
}

export default App;
