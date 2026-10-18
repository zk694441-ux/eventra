import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Calendar, MapPin } from 'lucide-react';

export default function Carousel({ events }) {
  const [idx, setIdx] = useState(0);
  const timer = useRef(null);

  const next = () => setIdx(i => (i + 1) % events.length);
  const prev = () => setIdx(i => (i - 1 + events.length) % events.length);

  useEffect(() => {
    timer.current = setInterval(next, 5000);
    return () => clearInterval(timer.current);
  }, [events.length]);

  if (!events.length) return null;
  const e = events[idx];

  return (
    <div className="relative rounded-3xl overflow-hidden h-80 md:h-96 shadow-2xl">
      <AnimatePresence mode="wait">
        <motion.img key={e.id} src={e.image} alt={e.title} initial={{ opacity: 0, scale: 1.05 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}
          className="absolute inset-0 w-full h-full object-cover" />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      <AnimatePresence mode="wait">
        <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
          className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
          <span className="text-xs bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full mb-2 inline-block">{e.category}</span>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">{e.title}</h2>
          <div className="flex items-center gap-4 text-sm text-white/80 mb-4">
            <span className="flex items-center gap-1"><Calendar size={14} />{e.date}</span>
            <span className="flex items-center gap-1"><MapPin size={14} />{e.city}</span>
            <span className="font-semibold text-white">{e.price === 0 ? 'Free' : `$${e.price}`}</span>
          </div>
          <Link to={`/events/${e.id}`} className="inline-block bg-white text-gray-900 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-indigo-50 transition-colors">
            View Event →
          </Link>
        </motion.div>
      </AnimatePresence>

      <button onClick={prev} className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-xl backdrop-blur-sm transition-colors">
        <ChevronLeft size={20} />
      </button>
      <button onClick={next} className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-xl backdrop-blur-sm transition-colors">
        <ChevronRight size={20} />
      </button>

      <div className="absolute bottom-4 right-6 flex gap-1.5">
        {events.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)} className={`h-1.5 rounded-full transition-all ${i === idx ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`} />
        ))}
      </div>
    </div>
  );
}
