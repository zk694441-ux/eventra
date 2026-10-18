import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, LayoutGrid, List, X } from 'lucide-react';
import { getEvents } from '../api';
import EventCard from '../components/EventCard';
import { SkeletonCard, SkeletonList } from '../components/Skeleton';

const CATEGORIES = ['Technology', 'Music', 'Food', 'Sports', 'Art', 'Business'];
const SORTS = [
  { value: 'date_asc', label: 'Date: Earliest' },
  { value: 'date_desc', label: 'Date: Latest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
];

export default function Events() {
  const [sp, setSp] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [grid, setGrid] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = sp.get('search') || '';
  const category = sp.get('category') || '';
  const sort = sp.get('sort') || 'date_asc';
  const maxPrice = sp.get('maxPrice') || '';

  const set = (key, val) => {
    const next = new URLSearchParams(sp);
    if (val) next.set(key, val); else next.delete(key);
    setSp(next);
  };

  useEffect(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (category) params.category = category;
    if (sort) params.sort = sort;
    if (maxPrice) params.maxPrice = maxPrice;
    getEvents(params).then(d => { setEvents(d); setLoading(false); }).catch(() => setLoading(false));
  }, [search, category, sort, maxPrice]);

  const clearFilters = () => setSp(new URLSearchParams());

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex-1 flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 shadow-sm">
          <Search size={18} className="text-gray-400 shrink-0" />
          <input value={search} onChange={e => set('search', e.target.value)} placeholder="Search events..."
            className="flex-1 bg-transparent py-3 text-sm outline-none" />
          {search && <button onClick={() => set('search', '')}><X size={16} className="text-gray-400" /></button>}
        </div>

        <select value={sort} onChange={e => set('sort', e.target.value)}
          className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3 text-sm outline-none shadow-sm min-w-fit">
          {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </select>

        <button onClick={() => setShowFilters(f => !f)}
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-medium border transition-colors ${showFilters ? 'bg-indigo-500 text-white border-indigo-500' : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700'}`}>
          <SlidersHorizontal size={16} /> Filters
        </button>

        <div className="flex border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-gray-900 shadow-sm">
          <button onClick={() => setGrid(true)} className={`px-4 py-3 ${grid ? 'bg-indigo-500 text-white' : ''} transition-colors`}><LayoutGrid size={16} /></button>
          <button onClick={() => setGrid(false)} className={`px-4 py-3 ${!grid ? 'bg-indigo-500 text-white' : ''} transition-colors`}><List size={16} /></button>
        </div>
      </motion.div>

      {showFilters && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
          className="mb-6 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 shadow-sm space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">Category</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => set('category', category === c ? '' : c)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-all ${category === c ? 'bg-indigo-500 text-white border-indigo-500' : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'}`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-sm font-medium mb-2">Max Price: {maxPrice ? `$${maxPrice}` : 'Any'}</p>
            <input type="range" min="0" max="500" step="10" value={maxPrice || 500}
              onChange={e => set('maxPrice', e.target.value === '500' ? '' : e.target.value)}
              className="w-full accent-indigo-500" />
          </div>
          {(search || category || maxPrice) && (
            <button onClick={clearFilters} className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center gap-1">
              <X size={14} /> Clear all filters
            </button>
          )}
        </motion.div>
      )}

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{loading ? '...' : `${events.length} event${events.length !== 1 ? 's' : ''} found`}</p>
        {category && <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 text-xs px-3 py-1 rounded-full flex items-center gap-1">{category} <button onClick={() => set('category', '')}><X size={12} /></button></span>}
      </div>

      {loading ? (
        <div className={grid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-3'}>
          {Array(8).fill(0).map((_, i) => grid ? <SkeletonCard key={i} /> : <SkeletonList key={i} />)}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold mb-2">No events found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters</p>
          <button onClick={clearFilters} className="bg-indigo-500 text-white px-5 py-2 rounded-xl text-sm font-medium">Clear Filters</button>
        </div>
      ) : (
        <div className={grid ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4' : 'flex flex-col gap-3'}>
          {events.map((e, i) => <EventCard key={e.id} event={e} list={!grid} index={i} />)}
        </div>
      )}
    </div>
  );
}
