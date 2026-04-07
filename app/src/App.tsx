import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import Stats from './sections/Stats';
import Projects from './sections/Projects';
import Blog from './sections/Blog';
import QuickLinks from './sections/QuickLinks';
import Footer from './sections/Footer';

function App() {
  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: 'linear-gradient(135deg, #f0ffff 0%, #e6ffff 50%, #f5ffff 100%)' }}>
      {/* Fixed Navigation */}
      <Navigation />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <Hero />

        {/* Stats Section */}
        <Stats />

        {/* Projects Section */}
        <Projects />

        {/* Blog Section */}
        <Blog />

        {/* Quick Links Section */}
        <QuickLinks />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default App;
