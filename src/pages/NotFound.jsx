import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="text-8xl mb-6">🎪</div>
      <h1 className="text-6xl font-extrabold gradient-text mb-4">404</h1>
      <h2 className="text-2xl font-bold mb-2">Page Not Found</h2>
      <p className="text-gray-500 mb-8 max-w-sm">This page doesn't exist or has been moved. Let's get you back to the events!</p>
      <Link to="/" className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
        <Home size={18} /> Back to Home
      </Link>
    </motion.div>
  );
}
