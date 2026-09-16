import React from 'react';
import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 py-12 px-6 font-sans text-zinc-400">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 select-none">
        <div className="space-y-4">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white text-sm tracking-tight">
              NutriVision AI
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-zinc-500 max-w-xs">
            Unlock complete nutritional transparency and freshness analytics using state-of-the-art computer vision models.
          </p>
        </div>

        <div>
          <h5 className="text-zinc-100 text-xs font-bold uppercase tracking-wider mb-4">Product</h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/" className="hover:text-white transition-colors">Features</Link></li>
            <li><Link href="/scanner" className="hover:text-white transition-colors">AI Scanner</Link></li>
            <li><Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-zinc-100 text-xs font-bold uppercase tracking-wider mb-4">Company</h5>
          <ul className="space-y-2 text-xs">
            <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        <div>
          <h5 className="text-zinc-100 text-xs font-bold uppercase tracking-wider mb-4">Legal</h5>
          <p className="text-xs leading-relaxed text-zinc-500">
            Compliance parameters aligned with standard USDA database schemas and HIPAA storage regulations.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-zinc-800 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-650 gap-4">
        <span>© {new Date().getFullYear()} NutriVision AI. All rights reserved.</span>
        <span>Version 1.0 (Demo Build)</span>
      </div>
    </footer>
  );
}
