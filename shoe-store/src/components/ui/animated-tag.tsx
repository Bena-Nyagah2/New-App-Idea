'use client';

import { motion } from 'framer-motion';
import { Tag } from 'lucide-react';

export function AnimatedTag() {
  return (
    <motion.div
      animate={{ rotate: [0, -10, 10, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <Tag className="text-red-500" size={28} />
    </motion.div>
  );
}
