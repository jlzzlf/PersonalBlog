import { useRef, useState, useEffect } from 'react';
import { ExternalLink, Code2, Gamepad2, Layers, ArrowRight } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string;
  status: string;
  year: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
}

const Projects = () => {
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

  const projects: Project[] = [
    {
      id: 1,
      title: '类吸血鬼幸存者小游戏',
      description: '一个用 Unity 制作的俯视角动作生存原型，重点练习批量敌人生成、自动战斗节奏和对象池优化。',
      status: '开发暂停',
      year: '2026',
      icon: Gamepad2,
      color: 'from-[#66CCCC] to-[#99E6E6]',
      gradient: 'from-[#66CCCC]/20 to-[#99E6E6]/20',
    },
  ];

  const moreProjects = [
    { name: '2D平台跳跃', icon: Layers },
    { name: '粒子特效系统', icon: Code2 },
    { name: 'AI行为树', icon: Gamepad2 },
  ];

  return (
    <section id="projects" ref={sectionRef} className="py-24 relative">
      {/* Background Elements */}
      <div className="absolute top-1/2 left-0 w-72 h-72 bg-[#99E6E6]/20 rounded-full blur-[100px] -translate-y-1/2" />
      <div className="absolute top-1/3 right-0 w-72 h-72 bg-[#CCFFFF]/20 rounded-full blur-[100px]" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div
          className={`flex items-end justify-between mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <p className="text-[#66CCCC] text-sm font-medium tracking-wider uppercase mb-2">
              Project Showcase
            </p>
            <h2 className="text-4xl font-bold text-[#1a2b3c]">项目展示</h2>
          </div>
          <a
            href="#"
            className="hidden sm:flex items-center gap-2 text-[#7a8a9a] hover:text-[#66CCCC] transition-colors"
          >
            查看全部项目
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Projects Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Project Card */}
          <div
            className={`lg:col-span-2 group relative overflow-hidden rounded-3xl glass hover-lift transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '100ms' }}
          >
            {/* Background Gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${projects[0].gradient} opacity-50`} />
            
            {/* Animated Border */}
            <div className="absolute inset-0 rounded-3xl border border-[#CCFFFF]/50 group-hover:border-[#66CCCC]/60 transition-colors duration-500" />

            <div className="relative p-8 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#CCFFFF]/50 text-[#339999] text-sm">
                    {projects[0].status} · {projects[0].year}
                  </span>
                </div>
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${projects[0].color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500`}
                >
                  <Gamepad2 className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-[#1a2b3c] mb-3 group-hover:text-[#66CCCC] transition-colors">
                  {projects[0].title}
                </h3>
                <p className="text-[#4a5a6a] leading-relaxed mb-6">
                  {projects[0].description}
                </p>
              </div>

              {/* Action */}
              <div className="flex items-center gap-4">
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-[#66CCCC] to-[#99E6E6] text-[#1a6666] font-medium hover:shadow-lg hover:shadow-[#66CCCC]/30 transition-all duration-300">
                  <ExternalLink className="w-4 h-4" />
                  查看详情
                </button>
                <button className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-[#4a5a6a] hover:text-[#1a2b3c] hover:bg-[#CCFFFF]/40 transition-all duration-300">
                  <Code2 className="w-4 h-4" />
                  源代码
                </button>
              </div>
            </div>
          </div>

          {/* More Projects Card */}
          <div
            className={`group relative overflow-hidden rounded-3xl glass hover-lift transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ transitionDelay: '200ms' }}
          >
            <div className="absolute inset-0 rounded-3xl border border-[#CCFFFF]/50 group-hover:border-[#80D4D4]/60 transition-colors duration-500" />

            <div className="relative p-8 h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#80D4D4] to-[#A8E6E6] flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs text-[#7a8a9a] uppercase tracking-wider">Projects</span>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-[#1a2b3c] mb-2">更多项目</h3>
              <p className="text-[#7a8a9a] text-sm mb-6">
                进入完整项目页，查看全部项目内容和后续更新。
              </p>

              {/* Project List */}
              <div className="flex-1 space-y-3">
                {moreProjects.map((project, index) => {
                  const ProjectIcon = project.icon;
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-[#CCFFFF]/20 hover:bg-[#CCFFFF]/40 transition-colors cursor-pointer group/item"
                    >
                      <ProjectIcon className="w-5 h-5 text-[#7a8a9a] group-hover/item:text-[#66CCCC] transition-colors" />
                      <span className="text-[#4a5a6a] group-hover/item:text-[#1a2b3c] transition-colors">
                        {project.name}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Action */}
              <button className="mt-6 w-full py-3 rounded-xl border border-[#CCFFFF]/50 text-[#7a8a9a] hover:text-[#1a2b3c] hover:border-[#66CCCC]/60 hover:bg-[#CCFFFF]/30 transition-all duration-300 flex items-center justify-center gap-2">
                查看全部项目
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Projects;
