import { Link, useLocation } from 'react-router-dom';
import { Sun, Moon, Zap, Menu, X } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const links = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/dashboard', label: 'Dashboard' },
];

export default function Navbar() {
  const { dark, toggle } = useTheme();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 glass border-b border-white/10">
      <nav className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <Zap className="text-indigo-500" size={22} />
          <span className="gradient-text">Eventra</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          {links.map(l => (
            <Link key={l.to} to={l.to} className={`text-sm font-medium transition-colors hover:text-indigo-500 ${pathname === l.to ? 'text-indigo-500' : 'text-gray-600 dark:text-gray-300'}`}>{l.label}</Link>
          ))}
          <Link to="/events/new" className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:opacity-90 transition-opacity">
            + Create Event
          </Link>
          <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <div className="md:hidden flex items-center gap-2">
          <button onClick={toggle} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setOpen(o => !o)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800">
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="md:hidden border-t border-white/10 glass px-4 pb-4 flex flex-col gap-3">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setOpen(false)} className={`py-2 text-sm font-medium ${pathname === l.to ? 'text-indigo-500' : 'text-gray-600 dark:text-gray-300'}`}>{l.label}</Link>
            ))}
            <Link to="/events/new" onClick={() => setOpen(false)} className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-4 py-2 rounded-xl text-sm font-medium text-center">+ Create Event</Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
