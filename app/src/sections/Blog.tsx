import { useRef, useState, useEffect } from 'react';
import { Calendar, Clock, ArrowRight, Tag, BookOpen } from 'lucide-react';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
}

const Blog = () => {
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

  const posts: BlogPost[] = [
    {
      id: 1,
      title: '学习递归，理解递归',
      excerpt: '说说我对于递归的理解。递归是编程中一个非常重要的概念，掌握它对于理解算法和数据结构至关重要...',
      date: '2026-04-02',
      readTime: '5 分钟',
      tags: ['算法', '编程基础'],
      featured: true,
    },
    {
      id: 2,
      title: '第一篇博客',
      excerpt: '这是博客正式开张前的第一条记录。欢迎来到我的个人空间，这里将记录我的学习历程、项目实践和生活感悟...',
      date: '2026-03-30',
      readTime: '3 分钟',
      tags: ['随笔'],
    },
    {
      id: 3,
      title: 'Unity对象池优化实践',
      excerpt: '在游戏开发中，频繁创建和销毁对象会导致性能问题。对象池模式是解决这个问题的有效方案...',
      date: '2026-03-28',
      readTime: '8 分钟',
      tags: ['Unity', '性能优化'],
    },
  ];

  const featuredPost = posts.find((p) => p.featured);
  const regularPosts = posts.filter((p) => !p.featured);

  return (
    <section id="blog" ref={sectionRef} className="py-24 relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-radial opacity-30" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div
          className={`flex items-end justify-between mb-12 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <div>
            <p className="text-[#66CCCC] text-sm font-medium tracking-wider uppercase mb-2">
              Latest Articles
            </p>
            <h2 className="text-4xl font-bold text-[#1a2b3c]">博客文章</h2>
          </div>
          <a
            href="#"
            className="hidden sm:flex items-center gap-2 text-[#7a8a9a] hover:text-[#66CCCC] transition-colors"
          >
            查看全部文章
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>

        {/* Blog Grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Featured Post */}
          {featuredPost && (
            <div
              className={`group relative overflow-hidden rounded-3xl glass hover-lift transition-all duration-700 lg:row-span-2 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: '100ms' }}
            >
              {/* Featured Badge */}
              <div className="absolute top-6 left-6 z-20">
                <span className="px-3 py-1 rounded-full bg-gradient-to-r from-[#66CCCC] to-[#99E6E6] text-[#1a6666] text-xs font-medium">
                  精选文章
                </span>
              </div>

              {/* Background Pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#CCFFFF]/30 via-transparent to-[#99E6E6]/20" />
              <div className="absolute inset-0 rounded-3xl border border-[#CCFFFF]/50 group-hover:border-[#66CCCC]/60 transition-colors duration-500" />

              <div className="relative p-8 h-full flex flex-col">
                {/* Icon */}
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#66CCCC] to-[#99E6E6] flex items-center justify-center mb-6 shadow-lg shadow-[#66CCCC]/20">
                  <BookOpen className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-[#1a2b3c] mb-4 group-hover:text-[#66CCCC] transition-colors">
                    {featuredPost.title}
                  </h3>
                  <p className="text-[#4a5a6a] leading-relaxed mb-6">
                    {featuredPost.excerpt}
                  </p>
                </div>

                {/* Meta */}
                <div className="flex items-center gap-4 text-sm text-[#7a8a9a] mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {featuredPost.date}
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {featuredPost.readTime}
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {featuredPost.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#CCFFFF]/40 text-[#339999] text-sm"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Action */}
                <button className="flex items-center gap-2 text-[#66CCCC] hover:text-[#339999] font-medium transition-colors">
                  阅读全文
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {/* Regular Posts */}
          {regularPosts.map((post, index) => (
            <div
              key={post.id}
              className={`group relative overflow-hidden rounded-3xl glass hover-lift transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: `${(index + 2) * 100}ms` }}
            >
              <div className="absolute inset-0 rounded-3xl border border-[#CCFFFF]/50 group-hover:border-[#80D4D4]/60 transition-colors duration-500" />

              <div className="relative p-6 h-full flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 text-sm text-[#7a8a9a]">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                    <span className="text-[#CCFFFF]">·</span>
                    <Clock className="w-4 h-4" />
                    {post.readTime}
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-[#1a2b3c] mb-3 group-hover:text-[#80D4D4] transition-colors">
                  {post.title}
                </h3>
                <p className="text-[#4a5a6a] text-sm leading-relaxed mb-4 flex-1">
                  {post.excerpt}
                </p>

                {/* Tags & Action */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 rounded-full bg-[#CCFFFF]/40 text-[#7a8a9a] text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="text-[#7a8a9a] hover:text-[#66CCCC] transition-colors">
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Blog;
