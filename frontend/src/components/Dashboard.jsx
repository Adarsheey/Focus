import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, Clock, Zap, Medal } from 'lucide-react';
import { fetchWithAuth } from '../utils/api';
import { useAuth } from '../context/AuthContext';

export default function Dashboard({ isActive }) {
    const { currentUser } = useAuth();
    const [data, setData] = useState(null);
    const [dailyNotification, setDailyNotification] = useState(null);

    // Rank logic: 0-59m (Bronze), 60-119m (Silver), 120-179m (Gold), 180m+ (Elite)
    const getRankInfo = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        if (minutes >= 180) return { name: 'Elite', color: 'text-purple-400', nextThreshold: null, currentMins: minutes };
        if (minutes >= 120) return { name: 'Gold', color: 'text-yellow-400', nextThreshold: 180, currentMins: minutes };
        if (minutes >= 60) return { name: 'Silver', color: 'text-gray-300', nextThreshold: 120, currentMins: minutes };
        return { name: 'Bronze', color: 'text-amber-600', nextThreshold: 60, currentMins: minutes };
    };

    useEffect(() => {
        if (!isActive || !currentUser) return;
        const fetchAnalytics = async () => {
            try {
                const res = await fetchWithAuth('http://localhost:3001/api/analytics');
                const json = await res.json();
                const now = new Date();
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);

                const chartData = [];
                for (let i = 0; i < 7; i++) {
                    const d = new Date(startOfWeek);
                    d.setDate(startOfWeek.getDate() + i);

                    const dayStart = new Date(d);
                    const dayEnd = new Date(d);
                    dayEnd.setDate(dayEnd.getDate() + 1);

                    const focusTime = (json.weekSessions || [])
                        .filter(s => {
                            const st = new Date(s.start_time);
                            return st >= dayStart && st < dayEnd;
                        })
                        .reduce((acc, s) => acc + s.actual_focus_time, 0);

                    chartData.push({
                        name: d.toLocaleDateString(undefined, { weekday: 'short' }),
                        focus: parseFloat((focusTime / 60).toFixed(1)),
                    });
                }

                setData({ ...json, chartData });

                // Daily Notification Logic
                const todayStr = new Date().toDateString();
                const lastSeen = localStorage.getItem('lastRankNotificationDate');

                if (lastSeen !== todayStr) {
                    const yesterdayRank = getRankInfo(json.yesterdayFocusSeconds || 0);
                    setDailyNotification({
                        show: true,
                        message: `Yesterday you finished at ${yesterdayRank.name}. Let's see if you can beat that today!`
                    });
                    localStorage.setItem('lastRankNotificationDate', todayStr);
                }

            } catch (e) { console.error(e); }
        };
        fetchAnalytics();
    }, [isActive, currentUser]);

    if (!data) return <div className="text-center text-textMuted py-20 animate-pulse">Loading Analytics...</div>;

    return (
        <div className="w-full max-w-4xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {dailyNotification?.show && (
                <div className="bg-blue-500/10 border border-blue-500/20 text-blue-200 p-4 rounded-xl flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <Medal className="text-blue-400" />
                        <span>{dailyNotification.message}</span>
                    </div>
                    <button onClick={() => setDailyNotification({ ...dailyNotification, show: false })} className="text-blue-400 hover:text-blue-300">
                        ✕
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={<Zap className="text-yellow-400" />}
                    title="Overall Focus Score"
                    value={`${data.focusScore}%`}
                    subtitle="Time active vs. total session time"
                />
                <StatCard
                    icon={<Clock className="text-blue-400" />}
                    title="Avg Daily Focus"
                    value={data.weekFocusSeconds ? `${parseFloat((data.weekFocusSeconds / 60 / (new Date().getDay() + 1)).toFixed(1))}m` : '0m'}
                    subtitle="Average of active time (Sun - Today)"
                />
                <StatCard
                    icon={<Target className="text-emerald-400" />}
                    title="Today's Focus Time"
                    value={data.totalFocusSecondsToday ? `${parseFloat((data.totalFocusSecondsToday / 60).toFixed(1))}m` : '0m'}
                    subtitle="Sum of today's sessions"
                />
                <StatCard
                    icon={<Medal className={getRankInfo(data.totalFocusSecondsToday || 0).color} />}
                    title="Daily Rank"
                    value={getRankInfo(data.totalFocusSecondsToday || 0).name}
                    subtitle={
                        getRankInfo(data.totalFocusSecondsToday || 0).nextThreshold
                            ? `${getRankInfo(data.totalFocusSecondsToday || 0).nextThreshold - getRankInfo(data.totalFocusSecondsToday || 0).currentMins}m to next rank`
                            : "Max Rank Reached!"
                    }
                />
            </div>

            <div className="glass-panel p-6">
                <h3 className="text-lg font-bold mb-6 flex items-center"><Zap size={18} className="mr-2 text-yellow-500" /> Focus Trends (Last 7 Days)</h3>
                <div className="h-72 w-full">
                    {data.chartData && data.chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data.chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorFocus" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#52525b" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#3f3f46', borderRadius: '8px', color: '#f8fafc' }}
                                    itemStyle={{ color: '#60a5fa' }}
                                />
                                <Area type="monotone" dataKey="focus" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorFocus)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-textMuted border border-dashed border-white/10 rounded-xl">
                            No data available yet. Complete a focus session!
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}

function StatCard({ icon, title, value, subtitle }) {
    return (
        <div className="glass-panel p-6 flex flex-col justify-between transition-transform hover:-translate-y-1 duration-300 group">
            <div className="flex justify-between items-start mb-4">
                <h4 className="text-sm font-medium text-textMuted group-hover:text-white transition-colors">{title}</h4>
                <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors drop-shadow-md">{icon}</div>
            </div>
            <div>
                <div className="text-3xl font-black tabular-nums tracking-tight">{value}</div>
                <div className="text-xs text-textMuted mt-1">{subtitle}</div>
            </div>
        </div>
    );
}
