import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, UserCheck, UserX, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import PresenceDetector from './FaceDetector';
import { fetchWithAuth } from '../utils/api';

export default function Timer({ selectedTaskId }) {
    const [focusDuration, setFocusDuration] = useState(25);
    const [breakDuration, setBreakDuration] = useState(5);
    const [timeLeft, setTimeLeft] = useState(focusDuration * 60);
    const [isActive, setIsActive] = useState(false);
    const [isFacePresent, setIsFacePresent] = useState(true);
    const [mode, setMode] = useState('focus'); // 'focus' | 'break'

    const [stats, setStats] = useState({ actualFocus: 0, totalSession: 0 });
    const [graceCounter, setGraceCounter] = useState(0);
    const [showSettings, setShowSettings] = useState(false);
    const [isAutoPaused, setIsAutoPaused] = useState(false);

    const GRACE_PERIOD_SEC = 10; // 10s grace period

    useEffect(() => {
        let interval = null;

        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);

                if (mode === 'focus') {
                    setStats(s => ({ ...s, totalSession: s.totalSession + 1 }));

                    if (!isFacePresent) {
                        setGraceCounter(g => g + 1);
                        if (graceCounter + 1 >= GRACE_PERIOD_SEC) {
                            setIsActive(false); // Auto pause!
                            setIsAutoPaused(true);
                            setGraceCounter(0); // Reset for next time
                        }
                    } else {
                        setStats(s => ({ ...s, actualFocus: s.actualFocus + 1 }));
                        setGraceCounter(0);
                    }
                }
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            handleComplete();
        }

        return () => clearInterval(interval);
    }, [isActive, timeLeft, isFacePresent, mode, graceCounter]);

    // Auto-resume logic
    useEffect(() => {
        if (isFacePresent && isAutoPaused && mode === 'focus') {
            setIsActive(true);
            setIsAutoPaused(false);
        }
    }, [isFacePresent, isAutoPaused, mode]);
    const handleComplete = async () => {
        if (mode === 'focus') {
            if (selectedTaskId) {
                try {
                    await fetchWithAuth('/api/sessions', {
                        method: 'POST',
                        body: JSON.stringify({
                            task_id: selectedTaskId,
                            start_time: new Date(Date.now() - stats.totalSession * 1000).toISOString(),
                            end_time: new Date().toISOString(),
                            actual_focus_time: stats.actualFocus,
                            total_session_time: stats.totalSession
                        })
                    });
                } catch (e) {
                    console.error('Failed to log session', e);
                }
            }

            setMode('break');
            setTimeLeft(breakDuration * 60);
            setStats({ actualFocus: 0, totalSession: 0 });

        } else {
            setMode('focus');
            setTimeLeft(focusDuration * 60);
        }

        setIsAutoPaused(false);
    };

    const toggleTimer = () => {
        setIsActive(!isActive);
        setIsAutoPaused(false);
    };

    const resetTimer = () => {
        setIsActive(false);
        setTimeLeft(mode === 'focus' ? focusDuration * 60 : breakDuration * 60);
        setStats({ actualFocus: 0, totalSession: 0 });
        setGraceCounter(0);
        setIsAutoPaused(false);
    };

    const handleFocusChange = (e) => {
        const val = Math.max(1, parseInt(e.target.value) || 1);
        setFocusDuration(val);
        if (mode === 'focus' && !isActive) setTimeLeft(val * 60);
    };

    const handleBreakChange = (e) => {
        const val = Math.max(1, parseInt(e.target.value) || 1);
        setBreakDuration(val);
        if (mode === 'break' && !isActive) setTimeLeft(val * 60);
    };

    const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const secs = (timeLeft % 60).toString().padStart(2, '0');

    const currentFocusScore = stats.totalSession > 0
        ? Math.round((stats.actualFocus / stats.totalSession) * 100)
        : 100;

    return (
        <div className="flex flex-col items-center justify-center h-full space-y-8 animate-in fade-in zoom-in duration-500">

            {!selectedTaskId && (
                <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-lg border border-yellow-500/20 text-sm mb-4">
                    No task selected! Select a task in the Tasks tab to log this session.
                </div>
            )}

            {showSettings && !isActive && (
                <div className="flex space-x-4 bg-panel p-4 rounded-xl border border-white/5 shadow-lg mb-4">
                    <div className="flex flex-col">
                        <label className="text-xs text-textMuted mb-1 font-bold">Focus (min)</label>
                        <input
                            type="number"
                            value={focusDuration}
                            onChange={handleFocusChange}
                            className="w-20 bg-background border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                            min="1"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="text-xs text-textMuted mb-1 font-bold">Break (min)</label>
                        <input
                            type="number"
                            value={breakDuration}
                            onChange={handleBreakChange}
                            className="w-20 bg-background border border-white/10 rounded px-2 py-1 text-white text-sm focus:outline-none focus:border-blue-500"
                            min="1"
                        />
                    </div>
                </div>
            )}

            <div className="flex w-full max-w-sm justify-between items-center mb-4">
                <div className="flex items-center space-x-2">
                    {mode === 'focus' ? (
                        isFacePresent ? (
                            <div className="flex items-center text-emerald-400 bg-emerald-400/10 px-3 py-1 rounded-full text-xs font-semibold">
                                <UserCheck size={14} className="mr-1" /> Present
                            </div>
                        ) : (
                            <div className="flex items-center text-red-400 bg-red-400/10 px-3 py-1 rounded-full text-xs font-semibold">
                                <UserX size={14} className="mr-1" /> Away ({graceCounter}s/{GRACE_PERIOD_SEC}s)
                            </div>
                        )
                    ) : (
                        <div className="flex items-center text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full text-xs font-semibold">
                            Break Mode
                        </div>
                    )}
                </div>
                <div style={{ visibility: mode === 'focus' ? 'visible' : 'hidden' }}>
                    <PresenceDetector onPresenceChange={setIsFacePresent} />
                </div>
            </div>

            <motion.div
                className="relative flex items-center justify-center w-72 h-72 rounded-full border-4 border-white/5 bg-panel shadow-2xl"
                animate={{ scale: isActive ? 1.05 : 1, borderColor: isActive && mode === 'focus' && !isFacePresent ? '#f87171' : isActive ? '#60a5fa' : '#27272a' }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
            >
                <div className="text-center w-full relative">
                    {!isActive && (
                        <button
                            onClick={() => setShowSettings(!showSettings)}
                            className="absolute -top-12 left-1/2 transform -translate-x-1/2 text-textMuted hover:text-white transition-colors"
                            title="Settings"
                        >
                            <Settings size={18} />
                        </button>
                    )}
                    <div className="text-sm text-textMuted uppercase tracking-widest font-bold mb-2">
                        {mode === 'focus' ? 'Focus Time' : 'Break Time'}
                    </div>
                    <div className="text-6xl font-black text-white tracking-tighter tabular-nums drop-shadow-md">
                        {mins}:{secs}
                    </div>
                    {mode === 'focus' && (
                        <div className="mt-4 text-xs font-medium text-emerald-400/80">
                            Focus Score: {currentFocusScore}%
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="flex space-x-4">
                <button
                    onClick={toggleTimer}
                    className={`flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 shadow-lg ${isActive ? 'bg-white/10 text-white hover:bg-white/20' : 'bg-blue-600 text-white hover:bg-blue-500 hover:scale-105'}`}
                >
                    {isActive ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </button>
                <button
                    onClick={resetTimer}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-panel text-textMuted hover:text-white hover:bg-highlight transition-all shadow-md"
                >
                    <RotateCcw size={24} />
                </button>
            </div>

        </div>
    );
}
