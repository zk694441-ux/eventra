import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, ArrowRight, Calendar, Users, Star, ChevronRight } from 'lucide-react';
import { getEvents } from '../api';
import EventCard from '../components/EventCard';
import Carousel from '../components/Carousel';

const CATEGORIES = ['Technology', 'Music', 'Food', 'Sports', 'Art', 'Business'];
const CAT_ICONS = { Technology: '💻', Music: '🎵', Food: '🍽️', Sports: '⚽', Art: '🎨', Business: '💼' };

const HOW = [
  { icon: <Search size={28} />, title: 'Discover Events', desc: 'Browse thousands of events by category, location or date.' },
  { icon: <Calendar size={28} />, title: 'Book Tickets', desc: 'Reserve your spot instantly with our seamless checkout.' },
  { icon: <Star size={28} />, title: 'Enjoy & Share', desc: 'Attend amazing events and share your experiences.' },
];

export default function Home() {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => { getEvents().then(setEvents).catch(() => {}); }, []);

  const featured = events.slice(0, 5);
  const upcoming = events.slice(0, 8);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-7xl mx-auto px-4 py-8 space-y-16">
      {/* Hero */}
      <section className="text-center space-y-6 py-8">
        <motion.h1 initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="text-5xl md:text-7xl font-extrabold leading-tight">
          Find Your Next
          <br /><span className="gradient-text">Experience</span>
        </motion.h1>
        <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="text-lg text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
          Discover, register, and manage events that matter to you.
        </motion.p>
        <motion.form initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          onSubmit={e => { e.preventDefault(); navigate(`/events?search=${search}`); }}
          className="flex gap-3 max-w-xl mx-auto">
          <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 shadow-sm">
            <Search size={18} className="text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search events, cities..."
              className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-gray-400" />
          </div>
          <button type="submit" className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-6 py-3 rounded-2xl font-medium hover:opacity-90 transition-opacity flex items-center gap-2">
            Search <ArrowRight size={16} />
          </button>
        </motion.form>

        {/* Category chips */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => navigate(`/events?category=${c}`)}
              className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full text-sm font-medium hover:border-indigo-400 hover:text-indigo-500 transition-all shadow-sm">
              {CAT_ICONS[c]} {c}
            </button>
          ))}
        </motion.div>
      </section>

      {/* Featured Carousel */}
      {featured.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Featured Events</h2>
            <button onClick={() => navigate('/events')} className="text-indigo-500 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              View all <ChevronRight size={16} />
            </button>
          </div>
          <Carousel events={featured} />
        </section>
      )}

      {/* Upcoming Grid */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Upcoming Events</h2>
          <button onClick={() => navigate('/events')} className="text-indigo-500 text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            View all <ChevronRight size={16} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {upcoming.map((e, i) => <EventCard key={e.id} event={e} index={i} />)}
        </div>
      </section>

      {/* How it Works */}
      <section className="py-8">
        <h2 className="text-2xl font-bold text-center mb-10">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {HOW.map((h, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} viewport={{ once: true }}
              className="bg-white dark:bg-gray-900 rounded-2xl p-6 text-center shadow-sm border border-gray-100 dark:border-gray-800">
              <div className="inline-flex p-4 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl text-indigo-500 mb-4">{h.icon}</div>
              <h3 className="font-bold text-lg mb-2">{h.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{h.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl p-8 md:p-12 text-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[['12+', 'Events'], ['5', 'Categories'], ['16K+', 'Attendees'], ['10', 'Cities']].map(([n, l]) => (
            <div key={l}>
              <div className="text-3xl md:text-4xl font-extrabold">{n}</div>
              <div className="text-white/70 text-sm mt-1">{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-800 pt-8 pb-4 text-center text-sm text-gray-400">
        <p className="font-semibold text-lg gradient-text mb-2">Eventra</p>
        <p>© 2026 Eventra. Built with React + Vite + Tailwind.</p>
      </footer>
    </motion.div>
  );
}
