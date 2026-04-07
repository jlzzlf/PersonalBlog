import { useEffect, useState, useRef } from 'react';
import { FileText, Calendar, Clock, Type } from 'lucide-react';

interface StatItemProps {
  icon: React.ElementType;
  label: string;
  value: string;
  suffix?: string;
  color: string;
  delay: number;
}

const StatItem = ({ icon: Icon, label, value, suffix = '', color, delay }: StatItemProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const numericValue = parseInt(value) || 0;

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      const duration = 2000;
      const steps = 60;
      const increment = numericValue / steps;
      let current = 0;

      const counter = setInterval(() => {
        current += increment;
        if (current >= numericValue) {
          setCount(numericValue);
          clearInterval(counter);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => clearInterval(counter);
    }, delay);

    return () => clearTimeout(timer);
  }, [isVisible, numericValue, delay]);

  return (
    <div
      ref={ref}
      className={`group relative p-6 rounded-2xl glass hover-lift transition-all duration-500 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {/* Glow Effect */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${color} opacity-0 group-hover:opacity-15 transition-opacity duration-500`}
      />

      <div className="relative flex items-center gap-4">
        <div
          className={`w-14 h-14 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-lg`}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <p className="text-[#7a8a9a] text-sm">{label}</p>
          <p className="text-3xl font-bold text-[#1a2b3c]">
            {label === '最后更新' ? value : count}
            <span className="text-lg text-[#66CCCC] ml-1">{suffix}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

const Stats = () => {
  const stats = [
    { icon: FileText, label: '文章总数', value: '5', suffix: '', color: 'from-[#66CCCC] to-[#99E6E6]' },
    { icon: Calendar, label: '建站天数', value: '4', suffix: '天', color: 'from-[#80D4D4] to-[#A8E6E6]' },
    { icon: Clock, label: '最后更新', value: '今天', suffix: '', color: 'from-[#5CB8B8] to-[#7ECFCF]' },
    { icon: Type, label: '全站字数', value: '2', suffix: 'k', color: 'from-[#4DA6A6] to-[#6BBFBF]' },
  ];

  return (
    <section className="py-20 relative">
      {/* Background Accent */}
      <div className="absolute inset-0 bg-gradient-radial opacity-50" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-[#66CCCC] text-sm font-medium tracking-wider uppercase mb-2">
            Site Statistics
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-[#1a2b3c]">
            站点数据
          </h2>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <StatItem
              key={stat.label}
              {...stat}
              delay={index * 100}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Stats;
