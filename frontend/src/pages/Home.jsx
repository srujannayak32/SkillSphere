import { Link } from 'react-router-dom'; // ✅ Correct import for navigation
import Navbar from '../components/Navbar'; // Make sure this file exists

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 text-white">
      <Navbar />

      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
            Welcome to SkillSphere
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Connect. Learn. Grow. Transform your skills through collaboration.
          </p>
          <div className="flex justify-center gap-6">
            <Link
              to="/auth/login"
              className="bg-emerald-500 hover:bg-emerald-600 px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
            >
              Get Started
            </Link>
            <Link
              to="/auth/signup"
              className="border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500/10 px-8 py-3 rounded-lg font-semibold transition-all duration-300"
            >
              Join Community
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <FeatureCard
            title="Collaborative Learning"
            description="Join skill sprints and work on real-world projects with peers"
            icon="👩💻"
          />
          <FeatureCard
            title="Expert Mentorship"
            description="Get guidance from industry professionals"
            icon="🎓"
          />
          <FeatureCard
            title="Skill Recognition"
            description="Earn badges and showcase your achievements"
            icon="🏅"
          />
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-700 pt-8 text-center">
          <div className="flex justify-center gap-6 mb-4">
            <Link to="/privacy" className="text-gray-400 hover:text-white">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-400 hover:text-white">
              Terms of Service
            </Link>
          </div>
          <p className="text-gray-500">© 2024 SkillSphere. All rights reserved.</p>
        </footer>
      </main>
    </div>
  );
}

// FeatureCard component
const FeatureCard = ({ title, description, icon }) => (
  <div className="bg-white/5 p-6 rounded-xl hover:bg-white/10 transition-all duration-300 group">
    <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-bold mb-2">{title}</h3>
    <p className="text-gray-400">{description}</p>
  </div>
);
