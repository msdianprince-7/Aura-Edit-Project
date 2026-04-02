// components/Navbar.tsx
import Link from 'next/link';

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full border-b border-white/10 bg-black/50 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* The Logo */}
        <Link href="/" className="text-xl font-bold tracking-tighter text-white">
          Aura<span className="text-purple-500">Edit</span>
        </Link>
        
        {/* The Links */}
        <div className="flex gap-6 items-center">
          <Link href="/dashboard" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">
            Dashboard
          </Link>
          <Link href="/upload" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-gray-200 transition-colors">
            Upload
          </Link>
        </div>
      </div>
    </nav>
  );
}