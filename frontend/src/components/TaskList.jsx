import { useState, useEffect } from 'react';
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function TaskList({ selectedTaskId, onSelectTask }) {
    const { currentUser } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [newTaskTitle, setNewTaskTitle] = useState('');

    useEffect(() => {
        fetchTasks();
    }, [currentUser]);

    const fetchTasks = async () => {
        try {
            const res = await fetchWithAuth('/api/tasks');
            const data = await res.json();
            if (res.ok && Array.isArray(data)) {
                setTasks(data);
            } else {
                console.error("API returned non-array or error:", data);
                setTasks([]);
            }
        } catch (e) {
            console.error(e);
            setTasks([]);
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (!newTaskTitle.trim()) return;

        try {
            const res = await fetchWithAuth('/api/tasks', {
                method: 'POST',
                body: JSON.stringify({ title: newTaskTitle })
            });

            const data = await res.json();

            if (res.ok) {
                setTasks([data, ...tasks]);
                setNewTaskTitle('');
            } else {
                console.error("Failed to add task:", data);
                alert("Failed to create task: " + (data.error || "Unknown error"));
            }
        } catch (e) {
            console.error(e);
        }
    };

    const deleteTask = async (id) => {
        try {
            await fetchWithAuth(`/api/tasks/${id}`, { method: 'DELETE' });
            setTasks(tasks.filter(t => t.id !== id));
            if (selectedTaskId === id) onSelectTask(null);
        } catch (e) {
            console.error(e);
        }
    };

    const toggleStatus = async (task) => {
        const newStatus = task.status === 'completed' ? 'pending' : 'completed';

        try {
            await fetchWithAuth(`/api/tasks/${task.id}`, {
                method: 'PUT',
                body: JSON.stringify({ status: newStatus })
            });

            fetchTasks();
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <form onSubmit={addTask} className="flex space-x-2">
                <input
                    type="text"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="What do you want to focus on?"
                    className="flex-1 bg-panel border border-white/10 rounded-xl px-4 py-3 text-white placeholder-textMuted focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium shadow-inner"
                />
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl transition-all font-bold flex items-center shadow-lg hover:shadow-blue-500/20 active:scale-95"
                >
                    <Plus size={20} className="mr-1" /> Add
                </button>
            </form>

            <div className="space-y-3">
                {Array.isArray(tasks) && tasks.map(task => (
                    <div
                        key={task.id}
                        className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${selectedTaskId === task.id
                                ? 'bg-blue-900/20 border-blue-500/50 shadow-md shadow-blue-900/10'
                                : 'bg-panel border-white/5 hover:border-white/10 hover:bg-highlight'
                            }`}
                        onClick={() => onSelectTask(task.id)}
                    >
                        <div className="flex items-center space-x-3 flex-1">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleStatus(task);
                                }}
                                className="text-textMuted hover:text-emerald-400 transition-colors"
                            >
                                {task.status === 'completed'
                                    ? <CheckCircle2 className="text-emerald-500" />
                                    : <Circle />}
                            </button>

                            <span
                                className={`font-medium ${task.status === 'completed'
                                        ? 'text-textMuted line-through'
                                        : 'text-textMain'
                                    }`}
                            >
                                {task.title}
                            </span>
                        </div>

                        {selectedTaskId === task.id && (
                            <span className="text-[10px] uppercase tracking-wider font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">
                                Selected
                            </span>
                        )}

                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteTask(task.id);
                            }}
                            className="ml-4 text-textMuted hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-red-400/10 opacity-50 hover:opacity-100"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {(!Array.isArray(tasks) || tasks.length === 0) && (
                    <div className="text-center text-textMuted py-10 opacity-70">
                        No tasks yet. Create one to get started!
                    </div>
                )}
            </div>
        </div>
    );
}