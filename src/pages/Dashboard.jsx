import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, Calendar, Users, TrendingUp, Edit, Trash2, Download, Plus, ChevronRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { getEvents, getRegistrations, deleteEvent } from '../api';

const COLORS = ['#6366f1', '#8b5cf6', '#f59e0b', '#10b981', '#ec4899', '#3b82f6'];

export default function Dashboard() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const fetchDashboardData = () => {
    Promise.allSettled([getEvents(), getRegistrations()])
      .then(([eventsRes, regRes]) => {
        const e = eventsRes.status === 'fulfilled' && Array.isArray(eventsRes.value) ? eventsRes.value : [];
        const r = regRes.status === 'fulfilled' && Array.isArray(regRes.value) ? regRes.value : [];
        setEvents(e);
        setRegistrations(r);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const safeEvents = Array.isArray(events) ? events : [];
  const safeRegistrations = Array.isArray(registrations) ? registrations : [];

  const totalRegistrations = safeEvents.reduce((a, e) => a + (Number(e.registered) || 0), 0);
  const totalRevenue = safeRegistrations.reduce((a, r) => {
    const ev = safeEvents.find(e => e.id === r.eventId);
    return a + (ev ? (Number(ev.price) || 0) * (Number(r.tickets) || 1) : 0);
  }, 0);

  const categoryData = safeEvents.reduce((acc, e) => {
    if (!e || !e.category) return acc;
    const existing = acc.find(a => a.name === e.category);
    if (existing) existing.value++;
    else acc.push({ name: e.category, value: 1 });
    return acc;
  }, []);

  const regByEvent = safeEvents
    .map(e => ({
      name: (e.title || '').slice(0, 16) + '…',
      registrations: Number(e.registered) || 0,
      capacity: Number(e.capacity) || 100
    }))
    .sort((a, b) => b.registrations - a.registrations)
    .slice(0, 6);

  const handleDelete = async (id) => {
    if (!confirm('Delete this event?')) return;
    try {
      await deleteEvent(id);
      setEvents(ev => (Array.isArray(ev) ? ev : []).filter(e => e.id !== id));
      setRegistrations(r => (Array.isArray(r) ? r : []).filter(reg => reg.eventId !== id));
      toast.success('Event deleted');
    } catch { toast.error('Failed to delete'); }
  };

  const exportCSV = () => {
    const rows = [['Event', 'Name', 'Email', 'Phone', 'Tickets', 'Date']];
    safeRegistrations.forEach(r => rows.push([r.eventTitle || '', r.name || '', r.email || '', r.phone || '', r.tickets || 1, (r.registeredAt || '').slice(0, 10)]));
    const csv = rows.map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    a.download = 'attendees.csv';
    a.click();
    toast.success('CSV exported!');
  };

  const STATS = [
    { label: 'Total Events', value: safeEvents.length, icon: <Calendar size={20} />, color: 'from-indigo-500 to-violet-500' },
    { label: 'Registrations', value: totalRegistrations.toLocaleString(), icon: <Users size={20} />, color: 'from-blue-500 to-cyan-500' },
    { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: <TrendingUp size={20} />, color: 'from-emerald-500 to-teal-500' },
    { label: 'Categories', value: categoryData.length, icon: <LayoutDashboard size={20} />, color: 'from-orange-500 to-amber-500' },
  ];

  const NAV_ITEMS = [
    { key: 'overview', label: 'Overview', icon: <LayoutDashboard size={18} /> },
    { key: 'events', label: 'Events', icon: <Calendar size={18} /> },
    { key: 'attendees', label: 'Attendees', icon: <Users size={18} /> },
  ];

  const Sidebar = () => (
    <aside className="w-56 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 h-full flex flex-col p-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-bold text-lg gradient-text">Dashboard</h2>
        <button className="lg:hidden" onClick={() => setSidebarOpen(false)}><X size={18} /></button>
      </div>
      <nav className="space-y-1 flex-1">
        {NAV_ITEMS.map(n => (
          <button key={n.key} onClick={() => { setTab(n.key); setSidebarOpen(false); }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === n.key ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            {n.icon}{n.label}
          </button>
        ))}
      </nav>
      <Link to="/events/new" className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-100 transition-colors">
        <Plus size={16} /> Create Event
      </Link>
    </aside>
  );

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Desktop sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-56 z-50"><Sidebar /></div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-950 p-4 md:p-6">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center gap-3 mb-4">
          <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
            <LayoutDashboard size={18} />
          </button>
          <h2 className="font-bold capitalize">{tab}</h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {Array(4).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-gray-900 rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <>
            {tab === 'overview' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {STATS.map((s, i) => (
                    <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                      className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                      <div className={`inline-flex p-2 rounded-xl bg-gradient-to-r ${s.color} text-white mb-3`}>{s.icon}</div>
                      <div className="text-2xl font-bold">{s.value}</div>
                      <div className="text-sm text-gray-500">{s.label}</div>
                    </motion.div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold mb-4">Registrations by Event</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={regByEvent}>
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="registrations" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 shadow-sm">
                    <h3 className="font-bold mb-4">Events by Category</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name }) => name}>
                          {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'events' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">All Events</h3>
                  <Link to="/events/new" className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5">
                    <Plus size={16} /> New Event
                  </Link>
                </div>
                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs uppercase">
                        <tr>
                          {['Event', 'Category', 'Date', 'Price', 'Registered', 'Actions'].map(h => (
                            <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {safeEvents.map(e => (
                          <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-3">
                                <img src={e.image} alt="" className="w-10 h-8 object-cover rounded-lg shrink-0" />
                                <span className="font-medium truncate max-w-32">{e.title}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500">{e.category}</td>
                            <td className="px-4 py-3 text-gray-500">{e.date}</td>
                            <td className="px-4 py-3">{e.price === 0 ? <span className="text-green-500 font-medium">Free</span> : `$${e.price}`}</td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="h-1.5 w-16 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.round(e.registered / e.capacity * 100)}%` }} />
                                </div>
                                <span className="text-gray-500">{e.registered}/{e.capacity}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <button onClick={() => navigate(`/events/${e.id}/edit`)} className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-lg text-indigo-500 transition-colors"><Edit size={15} /></button>
                                <button onClick={() => handleDelete(e.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-400 transition-colors"><Trash2 size={15} /></button>
                                <Link to={`/events/${e.id}`} className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-gray-400 transition-colors"><ChevronRight size={15} /></Link>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {tab === 'attendees' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Attendees ({safeRegistrations.length})</h3>
                  <button onClick={exportCSV} className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <Download size={16} className="text-indigo-500" /> Export CSV
                  </button>
                </div>
                {safeRegistrations.length === 0 ? (
                  <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                    <div className="text-5xl mb-3">👥</div>
                    <p className="font-semibold">No registrations yet</p>
                    <p className="text-gray-500 text-sm mt-1">Registrations will appear here</p>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800 text-gray-500 text-xs uppercase">
                          <tr>
                            {['Name', 'Email', 'Event', 'Tickets', 'Date'].map(h => (
                              <th key={h} className="px-4 py-3 text-left font-medium">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                          {safeRegistrations.map(r => (
                            <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                              <td className="px-4 py-3 font-medium">{r.name}</td>
                              <td className="px-4 py-3 text-gray-500">{r.email}</td>
                              <td className="px-4 py-3 text-gray-500 max-w-32 truncate">{r.eventTitle}</td>
                              <td className="px-4 py-3">{r.tickets}</td>
                              <td className="px-4 py-3 text-gray-500">{r.registeredAt?.slice(0, 10)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
