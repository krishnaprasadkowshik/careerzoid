import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import logo from "../assets/careerzoid-logo.png";
import heroCareer from "../assets/career-hero-ai.png";
import launchBatchImage from "../assets/launch-batch-ai.png";
import achieversImage from "../assets/achievers-referral-ai.png";
import careerMatcher from "../assets/career-matcher.png";
import resumeIntelligence from "../assets/resume-intelligence.png";
import skillGap from "../assets/skill-gap.png";
import interviewPrep from "../assets/interview-prep.png";
import opportunityHub from "../assets/opportunity-hub.png";
import certificationHub from "../assets/certification-hub.png";
import community from "../assets/community.png";

export default function LandingPageV2() {
  return (
    <div className="cz-landing min-h-screen text-white">

      {/* NAVBAR */}
      <nav className="cz-nav sticky top-0 z-50 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex justify-between items-center">

          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="CareerZoid"
              className="h-14 w-auto"
            />

            <div>
              <h1 className="cz-logo text-3xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                CareerZoid
              </h1>

              <p className="text-xs text-gray-400">
                Career Intelligence Platform
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              to="/login"
              className="cz-button-secondary px-5 py-2 rounded-xl border border-white/20 hover:bg-white/10"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="cz-button-primary px-5 py-2 rounded-xl"
            >
              Sign Up
            </Link>
          </div>

        </div>
      </nav>

      {/* HERO */}
      <section className="max-w-7xl mx-auto px-6 py-24 lg:py-28">

        <div className="grid lg:grid-cols-2 gap-16 items-center">

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
          >

            <img
              src={logo}
              alt="CareerZoid"
              className="h-24 mb-6"
            />

            <span className="cz-pill bg-purple-500/20 text-purple-300 px-4 py-2 rounded-full text-sm">
              AI Powered Career Intelligence
            </span>

            <h1 className="cz-hero-title text-6xl font-bold mt-8 leading-tight">
              Discover Careers.
              <br />
              Build Skills.
              <br />
              Get Hired.
            </h1>

            <p className="cz-hero-copy text-xl text-gray-300 mt-8">
              CareerZoid helps students and professionals
              discover careers, analyze skill gaps,
              improve resumes, prepare for interviews,
              and unlock opportunities.
            </p>

            <div className="flex gap-4 mt-10">

              <Link
                to="/signup"
                className="cz-button-primary px-8 py-4 rounded-2xl"
              >
                Start Free
              </Link>

              <Link
                to="/login"
                className="cz-button-secondary border border-white/20 px-8 py-4 rounded-2xl"
              >
                Login
              </Link>

            </div>

          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <img
              src={heroCareer}
              alt="CareerZoid"
              className="cz-hero-image w-full rounded-3xl shadow-2xl"
            />
          </motion.div>

        </div>

      </section>

      {/* LAUNCH + ACHIEVERS */}
      <section className="max-w-7xl mx-auto px-6 py-12">

        <div className="grid lg:grid-cols-2 gap-8">

          <div className="cz-illustration-panel">

            <img
              src={launchBatchImage}
              alt="Launch Batch dashboard illustration"
            />

            <div>
              <span className="cz-pill">
                Launch Batch
              </span>

              <h2>
                30-day career readiness with visible progress.
              </h2>

              <p>
                Complete guided steps for career discovery,
                skill gaps, resume improvement, LinkedIn,
                roadmap building, and interview readiness.
              </p>
            </div>

          </div>

          <div className="cz-illustration-panel">

            <img
              src={achieversImage}
              alt="Achievers Club referral illustration"
            />

            <div>
              <span className="cz-pill">
                Achievers Club
              </span>

              <h2>
                Build connections. Earn referrals. Unlock opportunities.
              </h2>

              <p>
                Eligible students can access networking,
                referral tracking, leaderboard visibility,
                community benefits, and opportunity-focused programs.
              </p>
            </div>

          </div>

        </div>

      </section>

      {/* STATS */}
      <section className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid md:grid-cols-4 gap-6">

          <div className="bg-white/5 rounded-3xl p-8 text-center">
            <h3 className="text-4xl font-bold text-purple-400">
              1000+
            </h3>
            <p className="text-gray-400">
              Skills
            </p>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 text-center">
            <h3 className="text-4xl font-bold text-blue-400">
              500+
            </h3>
            <p className="text-gray-400">
              Career Paths
            </p>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 text-center">
            <h3 className="text-4xl font-bold text-green-400">
              AI
            </h3>
            <p className="text-gray-400">
              Powered
            </p>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 text-center">
            <h3 className="text-4xl font-bold text-orange-400">
              24/7
            </h3>
            <p className="text-gray-400">
              Learning Access
            </p>
          </div>

        </div>

      </section>

      {/* FEATURES */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-5xl font-bold text-center mb-14">
          Everything You Need To Become Job Ready
        </h2>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          <FeatureCard
            image={careerMatcher}
            title="Career Matcher"
            description="AI recommends the best career paths based on your interests and strengths."
          />

          <FeatureCard
            image={resumeIntelligence}
            title="Resume Intelligence"
            description="Improve ATS score and optimize your resume professionally."
          />

          <FeatureCard
            image={skillGap}
            title="Skill Gap Analyzer"
            description="Find missing skills between your current profile and dream career."
          />

          <FeatureCard
            image={interviewPrep}
            title="Interview Preparation"
            description="Practice HR, Technical and Behavioral interview questions."
          />

          <FeatureCard
            image={opportunityHub}
            title="Opportunity Hub"
            description="Discover jobs, internships, scholarships and competitions."
          />

          <FeatureCard
            image={certificationHub}
            title="Certification Hub"
            description="Explore certifications, courses and industry-recognized programs."
          />

          <FeatureCard
            image={community}
            title="Premium Community"
            description="Exclusive networking community available for eligible CareerZoid members."
          />

          <div className="bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-3xl p-8 border border-white/10">

            <h3 className="text-2xl font-bold">
              1000+ Skills
            </h3>

            <p className="text-gray-300 mt-4">
              Explore thousands of skills across Technology,
              Business, Design, Marketing, Finance and more.
            </p>

          </div>

        </div>

      </section>

      {/* SKILLS */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-5xl font-bold text-center mb-12">
          Explore Popular Skills
        </h2>

        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4">

          {[
            "Python",
            "Java",
            "React",
            "Node.js",
            "SQL",
            "AI",
            "Data Science",
            "Machine Learning",
            "Cyber Security",
            "Cloud",
            "UI/UX",
            "DevOps",
          ].map((skill) => (
            <div
              key={skill}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center hover:bg-white/10 transition"
            >
              {skill}
            </div>
          ))}

        </div>

      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-5xl font-bold text-center mb-16">
          How CareerZoid Works
        </h2>

        <div className="grid md:grid-cols-4 gap-8">

          <div className="bg-white/5 rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">1️⃣</div>
            <h3 className="text-xl font-bold">
              Create Account
            </h3>
            <p className="text-gray-400 mt-3">
              Sign up using Email or Google.
            </p>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">2️⃣</div>
            <h3 className="text-xl font-bold">
              Discover Careers
            </h3>
            <p className="text-gray-400 mt-3">
              Use AI Career Matcher to find suitable paths.
            </p>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">3️⃣</div>
            <h3 className="text-xl font-bold">
              Build Skills
            </h3>
            <p className="text-gray-400 mt-3">
              Follow roadmaps and certifications.
            </p>
          </div>

          <div className="bg-white/5 rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">4️⃣</div>
            <h3 className="text-xl font-bold">
              Get Hired
            </h3>
            <p className="text-gray-400 mt-3">
              Prepare interviews and apply confidently.
            </p>
          </div>

        </div>

      </section>

      {/* TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-5xl font-bold text-center mb-16">
          Success Stories
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white/5 rounded-3xl p-8">
            <p className="text-gray-300">
              CareerZoid helped me discover Data Science and
              create a clear roadmap. I got my first internship.
            </p>

            <h4 className="font-bold mt-6">
              Student
            </h4>
          </div>

          <div className="bg-white/5 rounded-3xl p-8">
            <p className="text-gray-300">
              Resume Intelligence improved my resume and
              increased interview calls significantly.
            </p>

            <h4 className="font-bold mt-6">
              Job Seeker
            </h4>
          </div>

          <div className="bg-white/5 rounded-3xl p-8">
            <p className="text-gray-300">
              The Skill Gap Analyzer showed exactly what
              skills I needed to learn.
            </p>

            <h4 className="font-bold mt-6">
              Professional
            </h4>
          </div>

        </div>

      </section>

      {/* PRICING */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <h2 className="text-5xl font-bold text-center mb-6">
          Choose Your CareerZoid Plan
        </h2>

        <p className="text-center text-gray-400 mb-16">
          Start free and upgrade when you are ready to unlock more career intelligence.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* FREE */}

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8">

            <span className="text-sm text-gray-400">
              GET STARTED
            </span>

            <h3 className="text-2xl font-bold mt-2">
              Free
            </h3>

            <p className="text-5xl font-bold mt-6">
              ₹0
            </p>

            <p className="text-gray-400 mt-2">
              Forever free
            </p>

            <ul className="mt-8 space-y-3 text-gray-300">
              <li>✓ Career Explorer</li>
              <li>✓ Limited AI Usage</li>
              <li>✓ Limited Roadmaps</li>
              <li>✓ Limited Interview Prep</li>
              <li>✗ Premium Community</li>
              <li>✗ Resume Intelligence</li>
            </ul>

            <Link
              to="/signup"
              className="block text-center mt-8 px-6 py-3 rounded-2xl border border-white/20 hover:bg-white/10 transition"
            >
              Start Free
            </Link>

          </div>

          {/* PRO */}

          <div className="bg-purple-600 rounded-3xl p-8 border border-purple-400 relative overflow-hidden">

            <div className="absolute top-5 right-5 bg-white text-purple-700 text-xs font-black px-3 py-1 rounded-full">
              POPULAR
            </div>

            <span className="text-sm text-purple-200">
              FULL ACCESS
            </span>

            <h3 className="text-2xl font-bold mt-2">
              Pro
            </h3>

            <p className="text-5xl font-bold mt-6">
              ₹49
            </p>

            <p className="text-purple-200 mt-2">
              per month
            </p>

            <ul className="mt-8 space-y-3">
              <li>✓ Unlimited AI Tools</li>
              <li>✓ Resume Intelligence</li>
              <li>✓ Skill Gap Analyzer</li>
              <li>✓ AI Career Assessment</li>
              <li>✓ LinkedIn Analyzer</li>
              <li>✓ Advanced Reports</li>
              <li>✓ Interview Preparation</li>
              <li>✓ Premium Community</li>
            </ul>

            <Link
              to="/signup"
              className="block text-center mt-8 px-6 py-3 rounded-2xl bg-white text-purple-700 font-bold hover:bg-gray-100 transition"
            >
              Upgrade to Pro
            </Link>

          </div>

          {/* LAUNCH BATCH */}

          <div className="bg-gradient-to-br from-blue-600/20 to-cyan-500/10 border border-blue-400/30 rounded-3xl p-8">

            <span className="text-sm text-blue-300 font-bold">
              SPECIAL PROGRAM
            </span>

            <h3 className="text-2xl font-bold mt-2">
              Launch Batch
            </h3>

            <div className="text-4xl mt-6">
              🚀
            </div>

            <p className="text-gray-300 mt-4">
              A focused 30-day career readiness program designed
              to help you move from preparation to action.
            </p>

            <ul className="mt-8 space-y-3 text-gray-300">
              <li>✓ 30-Day Career Readiness</li>
              <li>✓ Career Discovery</li>
              <li>✓ Skill Gap Planning</li>
              <li>✓ Resume Improvement</li>
              <li>✓ LinkedIn Improvement</li>
              <li>✓ Career Roadmap</li>
              <li>✓ Interview Readiness</li>
              <li>✓ Progress Tracking</li>
            </ul>

            <Link
              to="/signup"
              className="block text-center mt-8 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 font-bold transition"
            >
              Join Launch Batch
            </Link>

          </div>

          {/* ACHIEVERS CLUB */}

          <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/10 border border-orange-400/30 rounded-3xl p-8">

            <span className="text-sm text-orange-300 font-bold">
              ELITE COMMUNITY
            </span>

            <h3 className="text-2xl font-bold mt-2">
              Achievers Club
            </h3>

            <div className="text-4xl mt-6">
              🏆
            </div>

            <p className="text-gray-300 mt-4">
              A community-focused program for students who want
              networking, referrals and career opportunities.
            </p>

            <ul className="mt-8 space-y-3 text-gray-300">
              <li>✓ Community Access</li>
              <li>✓ Networking</li>
              <li>✓ Referral Tracking</li>
              <li>✓ Leaderboard Visibility</li>
              <li>✓ Opportunity-Focused Benefits</li>
              <li>✓ Career Connections</li>
              <li>✓ Member Recognition</li>
            </ul>

            <Link
              to="/signup"
              className="block text-center mt-8 px-6 py-3 rounded-2xl bg-orange-600 hover:bg-orange-500 font-bold transition"
            >
              Explore Achievers Club
            </Link>

          </div>

        </div>

      </section>

      {/* CONTACT */}
      <section className="max-w-7xl mx-auto px-6 py-20">

        <div className="bg-white/5 border border-white/10 rounded-3xl p-10">

          <h2 className="text-4xl font-bold">
            Contact Support
          </h2>

          <p className="text-gray-300 mt-4">
            Need help? Reach out to our team.
          </p>

          <div className="mt-8 space-y-3">

            <p>
              📧 careerzoid@gmail.com
            </p>

            <p>
              📍 18-39-S3-357, Ashok Nagar,
              Tirupati, Andhra Pradesh - 517501
            </p>

          </div>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 py-10 text-center text-gray-400">

        <div className="flex flex-col items-center">

          <img
            src={logo}
            alt="CareerZoid"
            className="h-16 mb-3"
          />

          <h3 className="text-2xl font-bold text-white">
            CareerZoid
          </h3>

        </div>

        <p className="mt-3">
          Career Intelligence Platform
        </p>

        <p className="mt-6">
          © 2026 CareerZoid. All Rights Reserved.
        </p>

      </footer>

    </div>
  );
}

function FeatureCard({
  image,
  title,
  description,
}: {
  image: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden hover:scale-105 transition">

      <img
        src={image}
        alt={title}
        className="w-full h-52 object-cover"
      />

      <div className="p-6">

        <h3 className="text-xl font-bold">
          {title}
        </h3>

        <p className="text-gray-400 mt-3">
          {description}
        </p>

      </div>

    </div>
  );
}