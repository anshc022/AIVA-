"use client";

import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Home', href: '/', icon: '🏠' },
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'About', href: '/about', icon: 'ℹ️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-slate-900 to-green-950">
      {pathname !== '/' && pathname !== '/dashboard' && (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-sm border-b border-green-500/20">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AI</span>
                </div>
                <span className="text-green-100 font-medium">AIVA</span>
              </Link>
              
              <div className="flex space-x-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center space-x-1 px-3 py-2 rounded-lg transition-colors ${
                      pathname === link.href
                        ? 'bg-green-600/20 text-green-100'
                        : 'text-green-200/70 hover:text-green-100 hover:bg-green-600/10'
                    }`}
                  >
                    <span>{link.icon}</span>
                    <span className="text-sm">{link.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </nav>
      )}
      
      <main className={pathname !== '/' && pathname !== '/dashboard' ? 'pt-16' : ''}>
        {children}
      </main>
    </div>
  );
};