import { Link } from 'react-router-dom';
import { Calendar, MapPin, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORY_COLORS = {
  Technology: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  Music: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  Food: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  Sports: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  Art: 'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  Business: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
};

export default function EventCard({ event, list = false, index = 0 }) {
  const pct = Math.round((event.registered / event.capacity) * 100);
  const color = CATEGORY_COLORS[event.category] || 'bg-gray-100 text-gray-700';

  if (list) return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.05 }}>
      <Link to={`/events/${event.id}`} className="flex gap-4 bg-white dark:bg-gray-900 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all card-hover border border-gray-100 dark:border-gray-800 group">
        <img src={event.image} alt={event.title} className="w-28 h-20 object-cover rounded-xl shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${color}`}>{event.category}</span>
              <h3 className="font-semibold mt-1 group-hover:text-indigo-500 transition-colors truncate">{event.title}</h3>
            </div>
            <span className="font-bold text-indigo-500 shrink-0">{event.price === 0 ? 'Free' : `$${event.price}`}</span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><Calendar size={13} />{event.date}</span>
            <span className="flex items-center gap-1"><MapPin size={13} />{event.city}</span>
          </div>
          <div className="mt-2">
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden w-48">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-400 mt-0.5">{event.registered}/{event.capacity} registered</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Link to={`/events/${event.id}`} className="block bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all card-hover border border-gray-100 dark:border-gray-800 group">
        <div className="relative h-44 overflow-hidden">
          <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className={`absolute top-3 left-3 text-xs px-2 py-1 rounded-full font-medium ${color}`}>{event.category}</span>
          <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full font-medium">
            {event.price === 0 ? 'Free' : `$${event.price}`}
          </span>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-base leading-tight group-hover:text-indigo-500 transition-colors">{event.title}</h3>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1"><Calendar size={13} />{event.date}</span>
            <span className="flex items-center gap-1"><MapPin size={13} />{event.city}</span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-400 mb-1">
              <span>{event.registered} registered</span>
              <span>{pct}%</span>
            </div>
            <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

export { CATEGORY_COLORS };
