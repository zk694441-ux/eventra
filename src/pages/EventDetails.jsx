import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, Users, Ticket, Edit, ArrowLeft, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { getEvent, registerForEvent } from '../api';
import Modal from '../components/Modal';
import { CATEGORY_COLORS } from '../components/EventCard';

export default function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState(1);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    getEvent(id).then(e => { setEvent(e); setLoading(false); }).catch(() => { setLoading(false); navigate('/404'); });
  }, [id]);

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!form.email.trim()) e.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Invalid email';
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitting(true);
    try {
      await registerForEvent(id, { ...form, tickets });
      setRegistered(true);
      setModal(false);
      setEvent(ev => ({ ...ev, registered: ev.registered + tickets }));
      toast.success('Registration successful! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
    }
    setSubmitting(false);
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse space-y-4">
      <div className="h-72 bg-gray-200 dark:bg-gray-800 rounded-3xl" />
      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-2/3" />
      <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-1/2" />
    </div>
  );

  if (!event) return null;

  const pct = Math.round((event.registered / event.capacity) * 100);
  const color = CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-700';
  const available = event.capacity - event.registered;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-indigo-500 mb-6 transition-colors">
        <ArrowLeft size={16} /> Back
      </button>

      {/* Banner */}
      <div className="relative h-72 md:h-96 rounded-3xl overflow-hidden mb-8 shadow-2xl">
        <img src={event.image} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute top-4 left-4 flex gap-2">
          <span className={`text-xs px-3 py-1.5 rounded-full font-medium ${color}`}>{event.category}</span>
        </div>
        <Link to={`/events/${id}/edit`} className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-xl hover:bg-black/60 transition-colors">
          <Edit size={13} /> Edit
        </Link>
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl md:text-4xl font-extrabold">{event.title}</h1>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-white/80 text-sm">
            <span className="flex items-center gap-1.5"><Calendar size={14} />{event.date}</span>
            <span className="flex items-center gap-1.5"><Clock size={14} />{event.time}</span>
            <span className="flex items-center gap-1.5"><MapPin size={14} />{event.venue}, {event.city}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: details */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-lg mb-3">About This Event</h2>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{event.description}</p>
          </div>

          {event.schedule?.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg mb-4">Schedule</h2>
              <div className="space-y-3">
                {event.schedule.map((s, i) => (
                  <div key={i} className="flex gap-4">
                    <span className="text-indigo-500 font-mono text-sm font-semibold w-14 shrink-0">{s.time}</span>
                    <div className="flex-1 border-l-2 border-indigo-200 dark:border-indigo-800 pl-4">
                      <p className="font-medium text-sm">{s.title}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <h2 className="font-bold text-lg mb-3">Venue</h2>
            <div className="flex items-start gap-3 text-gray-600 dark:text-gray-300">
              <MapPin className="text-indigo-500 mt-0.5 shrink-0" size={18} />
              <div>
                <p className="font-medium">{event.venue}</p>
                <p className="text-sm">{event.city}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: ticket selector */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 sticky top-20">
            <div className="text-3xl font-extrabold gradient-text mb-1">
              {event.price === 0 ? 'Free' : `$${event.price}`}
            </div>
            <p className="text-sm text-gray-500 mb-4">per ticket</p>

            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span className="flex items-center gap-1"><Users size={12} />{event.registered}/{event.capacity}</span>
                <span>{pct}% full</span>
              </div>
              <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div className={`h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 ${pct >= 90 ? 'from-red-400 to-red-500' : ''}`} style={{ width: `${pct}%` }} />
              </div>
              {pct >= 90 && <p className="text-xs text-red-500 mt-1">Almost full!</p>}
            </div>

            {available > 0 && !registered ? (
              <>
                <div className="flex items-center justify-between mb-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                  <button onClick={() => setTickets(t => Math.max(1, t - 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-lg font-bold hover:bg-indigo-50 transition-colors">−</button>
                  <span className="font-bold">{tickets} ticket{tickets > 1 ? 's' : ''}</span>
                  <button onClick={() => setTickets(t => Math.min(available, t + 1))} className="w-8 h-8 rounded-lg bg-white dark:bg-gray-700 shadow-sm flex items-center justify-center text-lg font-bold hover:bg-indigo-50 transition-colors">+</button>
                </div>
                {event.price > 0 && <p className="text-center text-sm text-gray-500 mb-4">Total: <strong className="text-gray-900 dark:text-white">${event.price * tickets}</strong></p>}
                <button onClick={() => setModal(true)} className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                  <Ticket size={18} /> Register Now
                </button>
              </>
            ) : registered ? (
              <div className="text-center py-4">
                <CheckCircle className="text-green-500 mx-auto mb-2" size={32} />
                <p className="font-semibold text-green-500">You're registered!</p>
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <p className="font-semibold">Sold Out</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Register Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Complete Registration">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1">Full Name *</label>
            <input value={form.name} onChange={e => { setForm(f => ({ ...f, name: e.target.value })); setErrors(er => ({ ...er, name: '' })); }}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-indigo-400" placeholder="John Doe" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Email *</label>
            <input type="email" value={form.email} onChange={e => { setForm(f => ({ ...f, email: e.target.value })); setErrors(er => ({ ...er, email: '' })); }}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-indigo-400" placeholder="you@example.com" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Phone</label>
            <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2 text-sm bg-transparent outline-none focus:ring-2 focus:ring-indigo-400" placeholder="+1 555 000 0000" />
          </div>
          <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-3 text-sm">
            <p className="font-medium">{event.title}</p>
            <p className="text-gray-500">{tickets} ticket{tickets > 1 ? 's' : ''} · {event.price === 0 ? 'Free' : `$${event.price * tickets}`}</p>
          </div>
          <button onClick={handleRegister} disabled={submitting}
            className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {submitting ? 'Processing...' : 'Confirm Registration'}
          </button>
        </div>
      </Modal>
    </motion.div>
  );
}
