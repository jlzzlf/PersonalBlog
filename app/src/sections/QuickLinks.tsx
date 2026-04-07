import { useRef, useState, useEffect } from 'react';
import { 
  Github, 
  Cloud, 
  Bot, 
  Code2, 
  ShoppingBag, 
  MoreHorizontal,
  ExternalLink,
  Compass
} from 'lucide-react';

interface QuickLink {
  name: string;
  url: string;
  description: string;
  subDescription: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const QuickLinks = () => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const links: QuickLink[] = [
    {
      name: 'GitHub',
      url: 'https://github.com/jlzztf',
      description: '代码仓库',
      subDescription: 'github.com/jlzztf',
      icon: Github,
      color: 'text-[#4a5a6a]',
      gradient: 'from-[#7a8a9a] to-[#9aaaba]',
    },
    {
      name: 'Cloudflare',
      url: 'https://dash.cloudflare.com',
      description: '站点与域名控制台',
      subDescription: 'dash.cloudflare.com',
      icon: Cloud,
      color: 'text-[#E67E22]',
      gradient: 'from-[#F39C12] to-[#E67E22]',
    },
    {
      name: 'ChatGPT',
      url: 'https://chatgpt.com',
      description: '日常对话与辅助工具',
      subDescription: 'chatgpt.com',
      icon: Bot,
      color: 'text-[#27AE60]',
      gradient: 'from-[#2ECC71] to-[#27AE60]',
    },
    {
      name: 'labuladong',
      url: 'https://labuladong.online',
      description: '算法题解与框架笔记',
      subDescription: 'labuladong.online',
      icon: Code2,
      color: 'text-[#3498DB]',
      gradient: 'from-[#5DADE2] to-[#3498DB]',
    },
    {
      name: 'Unity Asset Store',
      url: 'https://assetstore.unity.com',
      description: 'Unity 插件与素材市场',
      subDescription: 'assetstore.unity.com',
      icon: ShoppingBag,
      color: 'text-[#9B59B6]',
      gradient: 'from-[#BB8FCE] to-[#9B59B6]',
    },
    {
      name: '更多',
      url: '#',
      description: 'website collection',
      subDescription: '打开完整网站卡片页',
      icon: MoreHorizontal,
      color: 'text-[#66CCCC]',
      gradient: 'from-[#66CCCC] to-[#99E6E6]',
    },
  ];

  return (
    <section id="links" ref={sectionRef} className="py-24 relative">
      {/* Background */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-[#CCFFFF]/30 rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div
          className={`mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div className="flex items-center gap-3 mb-2">
            <Compass className="w-5 h-5 text-[#66CCCC]" />
            <p className="text-[#66CCCC] text-sm font-medium tracking-wider uppercase">
              Quick Navigation
            </p>
          </div>
          <h2 className="text-4xl font-bold text-[#1a2b3c] mb-4">快捷导航</h2>
          <p className="text-[#4a5a6a] max-w-2xl">
            常用网站会以矩形模块的方式铺开，窗口变宽时会自动多排一点。
          </p>
        </div>

        {/* Links Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {links.map((link, index) => (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group relative overflow-hidden rounded-2xl glass hover-lift transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 1) * 50}ms` }}
            >
              {/* Hover Gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${link.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}
              />

              {/* Border */}
              <div className="absolute inset-0 rounded-2xl border border-[#CCFFFF]/50 group-hover:border-[#66CCCC]/60 transition-colors duration-500" />

              <div className="relative p-5">
                {/* Icon & Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                  >
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-[#1a2b3c] font-medium group-hover:text-[#66CCCC] transition-colors">
                      {link.name}
                    </h3>
                    <p className="text-[#7a8a9a] text-xs truncate max-w-[120px]">
                      {link.subDescription}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[#4a5a6a] text-sm mb-3">{link.description}</p>

                {/* External Link Indicator */}
                <div className="flex items-center justify-end">
                  <ExternalLink className="w-4 h-4 text-[#CCFFFF] group-hover:text-[#66CCCC] transition-colors" />
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};

export default QuickLinks;
