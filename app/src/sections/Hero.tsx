import { useEffect, useRef } from 'react';
import { Github, Mail, Phone, Gamepad2, Code, BookOpen, ArrowRight } from 'lucide-react';

const Hero = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle animation - 浅色版
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
    }

    const particles: Particle[] = [];
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
      });
    }

    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      particles.forEach((particle, i) => {
        particle.x += particle.vx;
        particle.y += particle.vy;

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(102, 204, 204, ${particle.opacity})`;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((other) => {
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 150) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(102, 204, 204, ${0.08 * (1 - distance / 150)})`;
            ctx.stroke();
          }
        });
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const tags = [
    { label: 'Unity开发', icon: Gamepad2, color: 'from-[#66CCCC] to-[#99E6E6]' },
    { label: '项目实践', icon: Code, color: 'from-[#80D4D4] to-[#A8E6E6]' },
    { label: '生活记录', icon: BookOpen, color: 'from-[#5CB8B8] to-[#7ECFCF]' },
  ];

  const recentPosts = [
    {
      date: '4月2日',
      title: '学习递归，理解递归',
      desc: '说说我对于递归的理解',
      tag: '最新归档',
    },
    {
      date: '3月30日',
      title: '第一篇博客',
      desc: '这是博客正式开张前的第一条记录。',
      tag: '最新归档',
    },
  ];

  return (
    <section id="hero" className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-0"
      />

      {/* Gradient Overlays - 浅色版 */}
      <div className="absolute inset-0 bg-gradient-mesh z-0" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#CCFFFF]/40 rounded-full blur-[120px] animate-pulse-glow" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#99E6E6]/30 rounded-full blur-[120px] animate-pulse-glow" style={{ animationDelay: '2s' }} />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-32 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Profile */}
          <div className="space-y-8 animate-slide-up">
            {/* Greeting */}
            <div className="space-y-2">
              <p className="text-[#66CCCC] text-sm font-medium tracking-wider uppercase">
                你好，我是
              </p>
              <h1 className="text-6xl md:text-7xl font-bold text-[#1a2b3c] leading-tight">
                章立夫
              </h1>
              <p className="text-xl text-[#7a8a9a] font-light">
                Unity Developer
              </p>
            </div>

            {/* Description */}
            <div className="space-y-4">
              <p className="text-[#4a5a6a] text-lg leading-relaxed">
                这里是我的个人博客。
                <br />
                我会在这里展示项目、记录学习、分享生活。
              </p>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-3">
              {tags.map((tag) => (
                <span
                  key={tag.label}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r ${tag.color} text-[#1a6666] text-sm font-medium shadow-sm hover-lift cursor-default`}
                >
                  <tag.icon className="w-4 h-4" />
                  #{tag.label}
                </span>
              ))}
            </div>

            {/* Contact Info */}
            <div className="space-y-3 pt-4">
              <div className="flex items-center gap-3 text-[#4a5a6a]">
                <Mail className="w-5 h-5 text-[#66CCCC]" />
                <span>邮箱</span>
                <span className="text-[#1a2b3c]">16927546047@qq.com</span>
              </div>
              <div className="flex items-center gap-3 text-[#4a5a6a]">
                <Phone className="w-5 h-5 text-[#5CB8B8]" />
                <span>电话</span>
                <span className="text-[#1a2b3c]">15852938328</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex gap-4 pt-4">
              <a
                href="https://github.com"
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
          </div>

          {/* Right: Recent Posts Card */}
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <div className="glass rounded-3xl p-8 mint-glow-soft hover-glow transition-all duration-500">
              {/* Avatar */}
              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#CCFFFF] via-[#99E6E6] to-[#66CCCC] p-0.5">
                  <div className="w-full h-full rounded-2xl bg-white flex items-center justify-center overflow-hidden">
                    <img
                      src="https://api.dicebear.com/7.x/avataaars/svg?seed=zhanglif"
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <p className="text-[#1a2b3c] font-medium">努力成为全栈开发者中...</p>
                  <p className="text-[#7a8a9a] text-sm">Unity & Web Developer</p>
                </div>
              </div>

              {/* Recent Posts Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-xs text-[#7a8a9a] uppercase tracking-wider">Recent Posts</p>
                  <h3 className="text-2xl font-bold text-[#1a2b3c]">最近内容</h3>
                </div>
                <a
                  href="#blog"
                  className="flex items-center gap-2 text-[#66CCCC] hover:text-[#339999] text-sm transition-colors"
                >
                  查看全部
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {recentPosts.map((post, index) => (
                  <div
                    key={index}
                    className="group p-4 rounded-2xl bg-white/50 hover:bg-[#CCFFFF]/30 border border-[#CCFFFF]/30 hover:border-[#66CCCC]/50 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-sm text-[#7a8a9a]">{post.date}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-[#CCFFFF]/50 text-[#339999]">
                        {post.tag}
                      </span>
                    </div>
                    <h4 className="text-[#1a2b3c] font-medium group-hover:text-[#66CCCC] transition-colors mb-1">
                      {post.title}
                    </h4>
                    <p className="text-[#7a8a9a] text-sm">{post.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#f0ffff] to-transparent z-10" />
    </section>
  );
};

export default Hero;
