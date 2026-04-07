import { Heart, Sparkles, Github, Mail, ArrowUp } from 'lucide-react';

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-16 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#E6FFFF] via-[#f0ffff] to-transparent" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-[#99E6E6]/20 rounded-full blur-[100px]" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[#CCFFFF]/20 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Main Footer Content */}
        <div className="flex flex-col items-center text-center mb-12">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CCFFFF] to-[#66CCCC] flex items-center justify-center mint-glow-soft">
              <Sparkles className="w-6 h-6 text-[#1a6666]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#1a2b3c]">章立夫的个人站</h3>
              <p className="text-sm text-[#7a8a9a]">学习、项目与生活记录</p>
            </div>
          </div>

          {/* Description */}
          <p className="text-[#4a5a6a] max-w-md mb-8">
            感谢访问我的个人博客。这里记录着我的学习历程、项目实践和生活感悟。
            希望能给你带来一些启发和帮助。
          </p>

          {/* Social Links */}
          <div className="flex gap-4 mb-8">
            <a
              href="https://github.com/jlzztf"
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-xl glass flex items-center justify-center text-[#4a5a6a] hover:text-[#1a2b3c] hover:bg-[#CCFFFF]/40 transition-all hover-lift"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="mailto:16927546047@qq.com"
              className="w-12 h-12 rounded-xl glass flex items-center justify-center text-[#4a5a6a] hover:text-[#1a2b3c] hover:bg-[#CCFFFF]/40 transition-all hover-lift"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          {/* Divider */}
          <div className="w-full max-w-md h-px bg-gradient-to-r from-transparent via-[#CCFFFF]/50 to-transparent mb-8" />

          {/* Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-2 text-sm text-[#7a8a9a]">
            <span>© {currentYear} 章立夫. All rights reserved.</span>
            <span className="hidden sm:inline text-[#CCFFFF]">·</span>
            <span className="flex items-center gap-1">
              Made with <Heart className="w-4 h-4 text-[#E74C3C] fill-[#E74C3C]" /> using React & Tailwind
            </span>
          </div>
        </div>

        {/* Back to Top Button */}
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 rounded-xl glass flex items-center justify-center text-[#4a5a6a] hover:text-[#1a2b3c] hover:bg-[#CCFFFF]/50 hover:border-[#66CCCC]/50 transition-all hover-lift z-50 border border-[#CCFFFF]/50"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      </div>
    </footer>
  );
};

export default Footer;
