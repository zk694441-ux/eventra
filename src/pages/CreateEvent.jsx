import { useState, useEffect, useCallback, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ChevronRight, ChevronLeft, Calendar, MapPin, Tag, Ticket, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { createEvent, updateEvent, getEvent } from '../api';

const CATEGORIES = ['Technology', 'Music', 'Food', 'Sports', 'Art', 'Business'];
const STEPS = ['Details', 'Date & Venue', 'Tickets', 'Preview'];

const DEFAULTS = {
  title: '', category: '', description: '',
  image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
  date: '', time: '09:00', venue: '', city: '',
  price: 0, capacity: 100, schedule: [],
};

/* ── Memoised preview – only re-renders when form actually changes ── */
const PreviewCard = memo(({ form }) => (
  <div className="hidden lg:block">
    <p className="text-sm font-medium text-gray-500 mb-3">Live Preview</p>
    <div className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
      <div className="h-44 overflow-hidden bg-gray-200 dark:bg-gray-800 relative">
        {form.image && (
          <img src={form.image} alt="" className="w-full h-full object-cover"
            onError={e => { e.target.style.display = 'none'; }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        {form.category && (
          <span className="absolute top-3 left-3 text-xs px-2 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">
            {form.category}
          </span>
        )}
        <span className="absolute top-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
          {Number(form.price) === 0 ? 'Free' : `$${form.price}`}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold">{form.title || 'Event Title'}</h3>
        <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
          {form.date && <span className="flex items-center gap-1"><Calendar size={12} />{form.date}</span>}
          {form.city && <span className="flex items-center gap-1"><MapPin size={12} />{form.city}</span>}
        </div>
        <p className="text-xs text-gray-400 mt-2 line-clamp-2">{form.description}</p>
      </div>
    </div>
  </div>
));

/* ── Controlled responsive text / textarea inputs ── */
const TextField = ({ label, error, value, onChange, placeholder, type = 'text', ...rest }) => (
  <div>
    {label && <label className="text-sm font-medium block mb-1">{label}</label>}
    <input
      type={type}
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow"
      {...rest}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const TextArea = ({ label, error, value, onChange, placeholder, rows = 4 }) => (
  <div>
    {label && <label className="text-sm font-medium block mb-1">{label}</label>}
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      rows={rows}
      placeholder={placeholder}
      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow resize-none"
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

export default function CreateEvent() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULTS);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const isEdit = !!id;

  useEffect(() => {
    if (isEdit) getEvent(id).then(e => setForm({ ...DEFAULTS, ...e })).catch(() => navigate('/events'));
  }, [id]);

  /* Stable setter – never recreated */
  const set = useCallback((k, v) => {
    setForm(f => ({ ...f, [k]: v }));
    setErrors(e => ({ ...e, [k]: '' }));
  }, []);

  const validateStep = () => {
    const e = {};
    if (step === 0) {
      if (!form.title.trim()) e.title = 'Required';
      if (!form.category) e.category = 'Required';
      if (!form.description.trim()) e.description = 'Required';
    }
    if (step === 1) {
      if (!form.date) e.date = 'Required';
      if (!form.venue.trim()) e.venue = 'Required';
      if (!form.city.trim()) e.city = 'Required';
    }
    if (step === 2) {
      if (Number(form.price) < 0) e.price = 'Cannot be negative';
      if (Number(form.capacity) < 1) e.capacity = 'Minimum 1';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep(s => s + 1); };
  const prev = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    if (!form.title?.trim() || !form.category || !form.date) {
      toast.error('Please complete title, category and date');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        capacity: Number(form.capacity) || 100
      };
      if (isEdit) {
        await updateEvent(id, payload);
        toast.success('Event updated!');
        navigate(`/events/${id}`);
      } else {
        const e = await createEvent(payload);
        toast.success('Event created! 🎉');
        if (e && e.id) {
          navigate(`/events/${e.id}`);
        } else {
          navigate('/events');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || err.message || 'Something went wrong');
    }
    setSaving(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-2xl font-bold mb-6">
        {isEdit ? 'Edit Event' : 'Create New Event'}
      </motion.h1>

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-8 overflow-x-auto">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1">
            <button
              onClick={() => i < step && setStep(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                i === step ? 'bg-indigo-500 text-white'
                : i < step ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-300 cursor-pointer'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
              }`}>
              {i < step ? <Check size={14} /> : <span className="w-4 text-center">{i + 1}</span>}
              <span className="hidden sm:inline">{s}</span>
            </button>
            {i < STEPS.length - 1 && <ChevronRight size={16} className="text-gray-300 shrink-0" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* ── Form panel ── */}
        <AnimatePresence mode="wait">
          <motion.div key={step} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.2 }}
            className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm space-y-4">

            {step === 0 && (
              <>
                <TextField key={`title-${isEdit}`} label="Event Title *" error={errors.title} value={form.title}
                  onChange={v => set('title', v)} placeholder="Amazing Conference 2026" />

                <div>
                  <label className="text-sm font-medium block mb-1">Category *</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow">
                    <option value="">Select category</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                  {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
                </div>

                <TextArea key={`desc-${isEdit}`} label="Description *" error={errors.description} value={form.description}
                  onChange={v => set('description', v)} placeholder="Describe your event..." />

                <TextField key={`img-${isEdit}`} label="Banner Image URL" value={form.image}
                  onChange={v => set('image', v)} placeholder="https://images.unsplash.com/..." />
              </>
            )}

            {step === 1 && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium block mb-1">Date *</label>
                    <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow" />
                    {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                  </div>
                  <div>
                    <label className="text-sm font-medium block mb-1">Time</label>
                    <input type="time" value={form.time} onChange={e => set('time', e.target.value)}
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow" />
                  </div>
                </div>

                <TextField key={`venue-${isEdit}`} label="Venue *" error={errors.venue} value={form.venue}
                  onChange={v => set('venue', v)} placeholder="Convention Center" />

                <TextField key={`city-${isEdit}`} label="City *" error={errors.city} value={form.city}
                  onChange={v => set('city', v)} placeholder="San Francisco" />

                <div>
                  <label className="text-sm font-medium block mb-2">Schedule <span className="text-gray-400 font-normal">(optional)</span></label>
                  {form.schedule.map((s, i) => (
                    <div key={i} className="flex gap-2 mb-2">
                      <input defaultValue={s.time}
                        onBlur={e => { const sc = [...form.schedule]; sc[i] = { ...sc[i], time: e.target.value }; set('schedule', sc); }}
                        className="w-24 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400" placeholder="10:00" />
                      <input defaultValue={s.title}
                        onBlur={e => { const sc = [...form.schedule]; sc[i] = { ...sc[i], title: e.target.value }; set('schedule', sc); }}
                        className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-2 py-2 text-xs bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400" placeholder="Session title" />
                      <button onClick={() => set('schedule', form.schedule.filter((_, j) => j !== i))}
                        className="text-red-400 hover:text-red-500 text-xs px-2 transition-colors">✕</button>
                    </div>
                  ))}
                  <button onClick={() => set('schedule', [...form.schedule, { time: '', title: '' }])}
                    className="text-indigo-500 text-sm font-medium hover:text-indigo-600 transition-colors">
                    + Add session
                  </button>
                </div>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="text-sm font-medium block mb-1">Ticket Price ($)</label>
                  <input type="number" min="0" value={form.price}
                    onChange={e => set('price', e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow"
                    placeholder="0 for free" />
                  {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
                </div>

                <div>
                  <label className="text-sm font-medium block mb-1">Capacity *</label>
                  <input type="number" min="1" value={form.capacity}
                    onChange={e => set('capacity', e.target.value)}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm bg-white dark:bg-gray-900 outline-none focus:ring-2 focus:ring-indigo-400 transition-shadow"
                    placeholder="100" />
                  {errors.capacity && <p className="text-red-500 text-xs mt-1">{errors.capacity}</p>}
                </div>

                <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl p-4 text-sm">
                  <p className="font-medium">💡 Pricing Tips</p>
                  <ul className="text-gray-500 mt-1 space-y-1 text-xs">
                    <li>• Set price to 0 for free events</li>
                    <li>• Tickets are sold on a first-come basis</li>
                    <li>• You can edit price/capacity later</li>
                  </ul>
                </div>
              </>
            )}

            {step === 3 && (
              <div className="space-y-3 text-sm">
                <h3 className="font-semibold text-base flex items-center gap-2">
                  <Eye size={16} className="text-indigo-500" /> Review Your Event
                </h3>
                {[
                  { icon: <Tag size={14} />, label: 'Title', val: form.title || '—' },
                  { icon: <Tag size={14} />, label: 'Category', val: form.category || '—' },
                  { icon: <Calendar size={14} />, label: 'Date', val: form.date ? `${form.date} at ${form.time}` : '—' },
                  { icon: <MapPin size={14} />, label: 'Location', val: form.venue ? `${form.venue}, ${form.city}` : '—' },
                  { icon: <Ticket size={14} />, label: 'Ticket', val: `${Number(form.price) === 0 ? 'Free' : `$${form.price}`} · Cap: ${form.capacity}` },
                ].map(r => (
                  <div key={r.label} className="flex gap-3 items-start">
                    <span className="text-indigo-500 mt-0.5 shrink-0">{r.icon}</span>
                    <div><span className="font-medium">{r.label}: </span><span className="text-gray-600 dark:text-gray-300">{r.val}</span></div>
                  </div>
                ))}
                <p className="text-gray-500 line-clamp-3">{form.description}</p>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Live Preview (memoised) ── */}
        <PreviewCard form={form} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button onClick={prev} disabled={step === 0}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
          <ChevronLeft size={16} /> Back
        </button>

        {step < STEPS.length - 1 ? (
          <button onClick={next}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity">
            Next <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={saving}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">
            {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Publish Event'} <Check size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
