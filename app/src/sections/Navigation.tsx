import { useState, useEffect } from 'react';
import { Menu, X, Sparkles } from 'lucide-react';

const Navigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: '首页', href: '#hero' },
    { label: '项目', href: '#projects' },
    { label: '博客', href: '#blog' },
    { label: '更多', href: '#links' },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'glass-strong py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="#hero" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#CCFFFF] to-[#66CCCC] flex items-center justify-center mint-glow-soft group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-[#1a6666]" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-[#1a2b3c]">章立夫的个人站</h1>
            <p className="text-xs text-[#7a8a9a]">学习、项目与生活记录</p>
          </div>
        </a>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="px-5 py-2 text-sm text-[#4a5a6a] hover:text-[#1a2b3c] rounded-full hover:bg-[#CCFFFF]/30 transition-all duration-300 relative group"
            >
              {item.label}
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#66CCCC] to-[#99E6E6] group-hover:w-1/2 transition-all duration-300" />
            </a>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden w-10 h-10 rounded-xl glass flex items-center justify-center text-[#4a5a6a] hover:text-[#1a2b3c] hover:bg-[#CCFFFF]/30 transition-all"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-full left-0 right-0 glass-strong border-t border-[#CCFFFF]/30 transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <div className="px-6 py-4 space-y-2">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 text-[#4a5a6a] hover:text-[#1a2b3c] rounded-xl hover:bg-[#CCFFFF]/30 transition-all"
            >
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
