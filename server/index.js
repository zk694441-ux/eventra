import express from 'express';
import cors from 'cors';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { v4 as uuid } from 'uuid';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();

const allowedOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
if (process.env.CLIENT_URL) {
  process.env.CLIENT_URL.split(',').forEach(url => {
    const trimmed = url.trim().replace(/\/+$/, '');
    if (trimmed) allowedOrigins.push(trimmed);
  });
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const cleanOrigin = origin.replace(/\/+$/, '');
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} not allowed by CORS`));
  },
  credentials: true
}));
app.use(express.json());

const SEED = [
  { id: uuid(), title: 'ReactConf 2026', category: 'Technology', date: '2026-11-15', time: '09:00', venue: 'Jio World Convention Centre', city: 'Mumbai', price: 2999, capacity: 500, registered: 342, image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', description: 'The premier React conference with talks from the core team and leading practitioners.', schedule: [{ time: '09:00', title: 'Registration & Breakfast' }, { time: '10:00', title: 'Keynote: React 2026' }, { time: '11:30', title: 'Workshop: Server Components' }, { time: '14:00', title: 'Talk: Performance Patterns' }] },
  { id: uuid(), title: 'AI Summit India', category: 'Technology', date: '2026-11-22', time: '10:00', venue: 'Bharat Mandapam', city: 'New Delhi', price: 4999, capacity: 1000, registered: 876, image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800', description: 'Explore the frontier of artificial intelligence with leading researchers and builders.', schedule: [{ time: '10:00', title: 'Opening Keynote' }, { time: '11:30', title: 'LLM Panel' }, { time: '13:00', title: 'Lunch Break' }, { time: '14:30', title: 'Hands-on AI Workshop' }] },
  { id: uuid(), title: 'Jazz Nights Festival', category: 'Music', date: '2026-12-05', time: '19:00', venue: 'Mehboob Studios', city: 'Mumbai', price: 799, capacity: 300, registered: 210, image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800', description: 'A magical evening of live jazz under the stars with world-class musicians.', schedule: [{ time: '19:00', title: 'Doors Open' }, { time: '20:00', title: 'Opening Act' }, { time: '21:00', title: 'Main Performance' }, { time: '23:00', title: 'Encore & Close' }] },
  { id: uuid(), title: 'EDM Block Party', category: 'Music', date: '2026-12-12', time: '20:00', venue: 'MMRDA Grounds, BKC', city: 'Mumbai', price: 599, capacity: 2000, registered: 1543, image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800', description: 'Three stages, twelve DJs, one massive night of electronic music.', schedule: [{ time: '20:00', title: 'Gates Open' }, { time: '21:00', title: 'Opening DJs' }, { time: '23:00', title: 'Headliner Set' }, { time: '02:00', title: 'After Party' }] },
  { id: uuid(), title: 'Food & Flavours Expo', category: 'Food', date: '2026-11-28', time: '12:00', venue: 'Palace Grounds', city: 'Bengaluru', price: 999, capacity: 800, registered: 654, image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800', description: 'Savor culinary masterpieces from 50+ chefs across India paired with craft beverages.', schedule: [{ time: '12:00', title: 'Expo Opens' }, { time: '13:00', title: 'Chef Demos' }, { time: '15:00', title: 'Tasting Sessions' }, { time: '17:00', title: 'Awards Ceremony' }] },
  { id: uuid(), title: 'Street Food Carnival', category: 'Food', date: '2026-12-20', time: '11:00', venue: 'Lal Qila Maidan', city: 'New Delhi', price: 199, capacity: 5000, registered: 3200, image: 'https://images.unsplash.com/photo-1565123409695-7b5ef63a2efb?w=800', description: 'Over 100 vendors serving iconic Indian street food in a festive outdoor setting.', schedule: [{ time: '11:00', title: 'Opening' }, { time: '12:00', title: 'Cook-off Competition' }, { time: '15:00', title: 'Live Music' }, { time: '18:00', title: 'Closing' }] },
  { id: uuid(), title: 'Mumbai Marathon 2026', category: 'Sports', date: '2026-11-30', time: '06:00', venue: 'Azad Maidan', city: 'Mumbai', price: 850, capacity: 10000, registered: 8920, image: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=800', description: 'The annual city marathon through iconic historic routes. All paces welcome.', schedule: [{ time: '06:00', title: 'Registration & Warmup' }, { time: '07:00', title: 'Race Start' }, { time: '09:00', title: 'First Finishers' }, { time: '12:00', title: 'Awards Ceremony' }] },
  { id: uuid(), title: 'Yoga Retreat Weekend', category: 'Sports', date: '2026-12-07', time: '07:00', venue: 'Ananda Spa Resort', city: 'Rishikesh', price: 3500, capacity: 100, registered: 67, image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800', description: 'A transformative weekend of yoga, meditation and wellness in the foothills of the Himalayas.', schedule: [{ time: '07:00', title: 'Morning Flow' }, { time: '09:00', title: 'Breakfast' }, { time: '10:30', title: 'Workshop: Pranayama' }, { time: '15:00', title: 'Sunset Meditation' }] },
  { id: uuid(), title: 'Modern Art Fair', category: 'Art', date: '2026-12-01', time: '10:00', venue: 'National Gallery of Modern Art', city: 'New Delhi', price: 450, capacity: 600, registered: 389, image: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800', description: 'Discover emerging and established Indian artists in an immersive gallery experience.', schedule: [{ time: '10:00', title: 'Doors Open' }, { time: '11:00', title: 'Artist Talks' }, { time: '14:00', title: 'Curator Tour' }, { time: '17:00', title: 'Evening Reception' }] },
  { id: uuid(), title: 'Photography Workshop', category: 'Art', date: '2026-12-14', time: '09:00', venue: 'Dhobi Ghat Studios', city: 'Mumbai', price: 1800, capacity: 30, registered: 28, image: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800', description: 'Hands-on workshop covering composition, lighting and post-processing with pros.', schedule: [{ time: '09:00', title: 'Introduction' }, { time: '10:00', title: 'Studio Session' }, { time: '13:00', title: 'Field Shoot' }, { time: '16:00', title: 'Editing Masterclass' }] },
  { id: uuid(), title: 'Startup Pitch Night', category: 'Business', date: '2026-11-18', time: '18:00', venue: 'NASSCOM 10000 Startups Hub', city: 'Bengaluru', price: 0, capacity: 200, registered: 185, image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800', description: 'Watch 10 startups compete for ₹1 Crore in funding before a panel of top VCs.', schedule: [{ time: '18:00', title: 'Networking' }, { time: '19:00', title: 'Pitches Begin' }, { time: '21:00', title: 'Judging' }, { time: '22:00', title: 'Winner Announced' }] },
  { id: uuid(), title: 'Digital Marketing Summit', category: 'Business', date: '2026-12-09', time: '09:00', venue: 'Hyderabad International Convention Centre', city: 'Hyderabad', price: 1999, capacity: 400, registered: 267, image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800', description: 'Master SEO, social media, and growth hacking from India\'s top industry leaders.', schedule: [{ time: '09:00', title: 'Keynote' }, { time: '10:30', title: 'SEO Deep Dive' }, { time: '13:00', title: 'Lunch' }, { time: '14:00', title: 'Growth Hacking Panel' }] },
];

const dbPath = join(__dirname, 'db.json');
if (!fs.existsSync(dbPath)) {
  fs.writeFileSync(dbPath, JSON.stringify({ events: SEED, registrations: [] }, null, 2));
}

const adapter = new JSONFile(dbPath);
const defaultData = { events: SEED, registrations: [] };
const db = new Low(adapter, defaultData);
await db.read();

if (!db.data || !db.data.events || !db.data.events.length) {
  db.data = { events: SEED, registrations: db.data?.registrations || [] };
  await db.write();
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/events', async (req, res) => {
  await db.read();
  let events = db.data.events;
  const { category, search, minPrice, maxPrice, sort } = req.query;
  if (category) events = events.filter(e => e.category === category);
  if (search) events = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()) || e.city.toLowerCase().includes(search.toLowerCase()));
  if (minPrice !== undefined) events = events.filter(e => e.price >= Number(minPrice));
  if (maxPrice !== undefined) events = events.filter(e => e.price <= Number(maxPrice));
  if (sort === 'price_asc') events = [...events].sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') events = [...events].sort((a, b) => b.price - a.price);
  if (sort === 'date_asc') events = [...events].sort((a, b) => new Date(a.date) - new Date(b.date));
  if (sort === 'date_desc') events = [...events].sort((a, b) => new Date(b.date) - new Date(a.date));
  res.json(events);
});

app.get('/api/events/:id', async (req, res) => {
  await db.read();
  const event = db.data.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  res.json(event);
});

app.post('/api/events', async (req, res) => {
  await db.read();
  const { title, category, date, time, venue, city, price, capacity, image, description, schedule } = req.body;
  if (!title || !category || !date) return res.status(400).json({ error: 'title, category, date required' });
  const event = { id: uuid(), title, category, date, time: time || '09:00', venue: venue || '', city: city || '', price: Number(price) || 0, capacity: Number(capacity) || 100, registered: 0, image: image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800', description: description || '', schedule: schedule || [] };
  db.data.events.push(event);
  await db.write();
  res.status(201).json(event);
});

app.put('/api/events/:id', async (req, res) => {
  await db.read();
  const idx = db.data.events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.events[idx] = { ...db.data.events[idx], ...req.body };
  await db.write();
  res.json(db.data.events[idx]);
});

app.delete('/api/events/:id', async (req, res) => {
  await db.read();
  const idx = db.data.events.findIndex(e => e.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  db.data.events.splice(idx, 1);
  db.data.registrations = db.data.registrations.filter(r => r.eventId !== req.params.id);
  await db.write();
  res.json({ ok: true });
});

app.post('/api/events/:id/register', async (req, res) => {
  await db.read();
  const event = db.data.events.find(e => e.id === req.params.id);
  if (!event) return res.status(404).json({ error: 'Not found' });
  const { name, email, phone, tickets } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name and email required' });
  const count = Number(tickets) || 1;
  if (event.registered + count > event.capacity) return res.status(400).json({ error: 'Not enough capacity' });
  const reg = { id: uuid(), eventId: event.id, eventTitle: event.title, name, email, phone: phone || '', tickets: count, registeredAt: new Date().toISOString() };
  db.data.registrations.push(reg);
  event.registered += count;
  await db.write();
  res.status(201).json(reg);
});

app.get('/api/registrations', async (req, res) => {
  await db.read();
  res.json(db.data.registrations);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Eventra API → http://localhost:${PORT}`));

export default app;
