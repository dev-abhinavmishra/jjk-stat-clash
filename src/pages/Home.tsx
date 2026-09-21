import React, { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import {
  Swords,
  Users,
  Cpu,
  Trophy,
  FileText,
  Github,
  Twitter,
  MessageSquare,
  Dices,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { ChangelogModal } from '../components/Changelog';
import { HowToPlayTutorial } from '../components/HowToPlayTutorial';
import { APP_VERSION } from '../utils/gameSettings';
import { BarrierRings, LightningArcs, CursedEmbers, ShockRing } from '../components/TransitionFX';

export default function Home() {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isChangelogOpen, setIsChangelogOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const clashVideoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isTransitioning && clashVideoRef.current) {
      const video = clashVideoRef.current;
      video.currentTime = 0;
      video.play().catch(() => {
        // Retry once after a small delay
        setTimeout(() => video.play().catch(() => {}), 100);
      });
    }
  }, [isTransitioning]);

  const handleStart = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      navigate('/play');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-red-500/30 relative overflow-hidden flex flex-col">
      <Helmet>
        <title>
          JJK Stat Clash | Build Your Ultimate Sorcerer - Free Jujutsu Kaisen Draft Game
        </title>
        <meta
          name="description"
          content="Draft your ultimate Jujutsu Kaisen sorcerer. Create legendary synergies, battle against bots or friends, and see who reigns supreme in the Culling Games. Free online multiplayer stat-clash game."
        />
        <meta
          name="keywords"
          content="JJK Stat Clash, Jujutsu Kaisen game, JJK draft, anime game, stat clash, multiplayer game, Gojo vs Sukuna, cursed technique, domain expansion, free browser game"
        />
        <meta name="author" content="Jujutsu Intelligence Systems" />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://jjk-stat-clash.vercel.app" />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://jjk-stat-clash.vercel.app" />
        <meta property="og:title" content="JJK Stat Clash | Build Your Ultimate Sorcerer" />
        <meta
          property="og:description"
          content="Draft your ultimate Jujutsu Kaisen sorcerer. Create legendary synergies, battle against bots or friends, and see who reigns supreme in the Culling Games."
        />
        <meta property="og:image" content="https://jjk-stat-clash.vercel.app/og-image.jpg" />
        <meta property="og:site_name" content="JJK Stat Clash" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://jjk-stat-clash.vercel.app" />
        <meta name="twitter:title" content="JJK Stat Clash | Build Your Ultimate Sorcerer" />
        <meta
          name="twitter:description"
          content="Draft your ultimate Jujutsu Kaisen sorcerer. Create legendary synergies, battle against bots or friends."
        />
        <meta name="twitter:image" content="https://jjk-stat-clash.vercel.app/og-image.jpg" />

        {/* JSON-LD Structured Data */}
        <script type="application/ld+json">
          {`
          {
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "JJK Stat Clash",
            "description": "Draft your ultimate Jujutsu Kaisen sorcerer. Create legendary synergies, battle against bots or friends, and see who reigns supreme in the Culling Games.",
            "url": "https://jjk-stat-clash.vercel.app",
            "applicationCategory": "Game",
            "operatingSystem": "Web Browser",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "ratingCount": "1000"
            },
            "genre": ["Strategy", "Anime", "Multiplayer"],
            "keywords": "Jujutsu Kaisen, anime game, stat clash, multiplayer, Gojo, Sukuna, cursed technique"
          }
          `}
        </script>
      </Helmet>

      {/* Animated Background (compressed video) */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <video
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='960' height='436'%3E%3Crect fill='%23050505' width='100%25' height='100%25'/%3E%3C/svg%3E"
          className="absolute min-w-full min-h-full object-cover opacity-50 grayscale-[0.3] contrast-[1.1]"
        >
          <source src="/hero-compressed.mp4" type="video/mp4" />
        </video>

        {/* Refined Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-[#050505] opacity-80"></div>
        <div className="absolute inset-0 bg-[#050505]/20 backdrop-blur-[1px]"></div>

        {/* Subtle Cursed Energy Particles */}
        <div className="absolute inset-0 z-0">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-[2px] h-[2px] bg-red-500/30 rounded-full"
              initial={{
                x: Math.random() * 100 + '%',
                y: '110%',
                opacity: 0,
              }}
              animate={{
                y: '-10%',
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 6 + Math.random() * 8,
                repeat: Infinity,
                delay: Math.random() * 10,
                ease: 'linear',
              }}
            />
          ))}
        </div>
      </div>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 relative z-10 w-full max-w-7xl mx-auto">
        <motion.div
          initial={{ scale: 1.1, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-[160px] font-black font-display uppercase tracking-[-0.06em] text-center leading-[0.85] mb-12 relative cursor-pointer"
          onClick={handleStart}
        >
          <span className="relative z-10 block text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]">
            JJK STAT
          </span>
          <span
            className="text-transparent bg-clip-text bg-gradient-to-b from-red-500 via-red-600 to-red-950 drop-shadow-[0_0_60px_rgba(220,38,38,0.8)] relative z-10 block mt-2"
            style={{ WebkitTextStroke: '1px rgba(255,255,255,0.1)' }}
          >
            CLASH
          </span>
          {/* Subtle Outer Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-red-600/5 blur-[120px] rounded-full -z-10"></div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 1 }}
          className="flex flex-col items-center gap-12"
        >
          <p className="text-zinc-300 font-mono tracking-[0.4em] uppercase text-[10px] md:text-xs text-center max-w-2xl mx-auto leading-relaxed bg-black/40 border border-white/5 py-4 px-10 rounded-sm backdrop-blur-md shadow-2xl">
            領域展開 • 伏魔御廚子 • 無下限呪術
          </p>

          <button onClick={handleStart} className="group relative">
            <div className="absolute -inset-4 bg-red-600/20 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            <div className="px-12 md:px-20 py-6 md:py-7 bg-zinc-950/80 border border-white/10 group-hover:border-red-500/50 text-white font-black text-xl md:text-2xl uppercase tracking-[0.3em] relative overflow-hidden transition-all backdrop-blur-md hover:shadow-[0_0_50px_rgba(220,38,38,0.3)] flex items-center justify-center gap-4 md:gap-6 group-active:scale-95">
              <div className="absolute inset-0 bg-gradient-to-r from-red-600/0 via-red-600/10 to-red-600/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <Swords
                size={28}
                className="group-hover:rotate-12 transition-transform duration-500 text-red-500"
              />
              <span className="relative z-10">Start Playing</span>
            </div>
          </button>
        </motion.div>

        {/* Feature Showcase Grid */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 w-full mt-16 md:mt-24"
        >
          {/* Online Multiplayer Card */}
          <div className="bg-zinc-900/30 border border-purple-500/10 p-6 md:p-8 rounded-2xl backdrop-blur-xl hover:border-purple-500/40 transition-all group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-600/10 blur-[50px] rounded-full group-hover:bg-purple-600/20 transition-all"></div>
            <Users className="text-purple-500 mb-4 md:mb-6 w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 group-hover:rotate-6 transition-transform" />
            <h3 className="text-lg md:text-xl font-black font-display uppercase tracking-wider mb-3 text-white">
              Online Clash
            </h3>
            <p className="text-[9px] md:text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest">
              Global matchmaking via PartyKit. Experience zero-latency synchronization in the
              ultimate sorcerer showdown.
            </p>
            <div className="mt-4 md:mt-6 flex items-center gap-2 text-[8px] font-black text-purple-400 uppercase tracking-[0.2em]">
              Live Lobby System • Global Rank
            </div>
          </div>

          {/* Cursed Lottery Card */}
          <div className="bg-zinc-900/30 border border-yellow-500/10 p-6 md:p-8 rounded-2xl backdrop-blur-xl hover:border-yellow-500/40 transition-all group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-600/10 blur-[50px] rounded-full group-hover:bg-yellow-600/20 transition-all"></div>
            <Dices className="text-yellow-500 mb-4 md:mb-6 w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 group-hover:-rotate-6 transition-transform" />
            <h3 className="text-lg md:text-xl font-black font-display uppercase tracking-wider mb-3 text-white">
              Cursed Lottery
            </h3>
            <p className="text-[9px] md:text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest">
              A high-stakes gamble mode. Burn your rolls to secure legendary entities or fall to the
              RNG of the Culling Games.
            </p>
            <div className="mt-4 md:mt-6 flex items-center gap-2 text-[8px] font-black text-yellow-400 uppercase tracking-[0.2em]">
              High Stakes • Random Draft
            </div>
          </div>

          {/* Simulated Combat Card */}
          <div className="bg-zinc-900/30 border border-blue-500/10 p-6 md:p-8 rounded-2xl backdrop-blur-xl hover:border-blue-500/40 transition-all group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600/10 blur-[50px] rounded-full group-hover:bg-blue-600/20 transition-all"></div>
            <Cpu className="text-blue-500 mb-4 md:mb-6 w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg md:text-xl font-black font-display uppercase tracking-wider mb-3 text-white">
              Elite AI
            </h3>
            <p className="text-[9px] md:text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest">
              Hone your skills against our Special Grade AI. Three difficulty tiers designed to test
              even the strongest sorcerers.
            </p>
            <div className="mt-4 md:mt-6 flex items-center gap-2 text-[8px] font-black text-blue-400 uppercase tracking-[0.2em]">
              3 Tiers • Adaptive Logic
            </div>
          </div>

          {/* Secret Bonds Card */}
          <div className="bg-zinc-900/30 border border-red-500/10 p-6 md:p-8 rounded-2xl backdrop-blur-xl hover:border-red-500/40 transition-all group relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-600/10 blur-[50px] rounded-full group-hover:bg-red-600/20 transition-all"></div>
            <Zap className="text-red-500 mb-4 md:mb-6 w-8 h-8 md:w-10 md:h-10 group-hover:scale-110 transition-transform" />
            <h3 className="text-lg md:text-xl font-black font-display uppercase tracking-wider mb-3 text-white">
              Forbidden Ties
            </h3>
            <p className="text-[9px] md:text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest">
              Discover hidden character synergies. Complete legendary pairings like 'The Honored
              One' to unlock devastating power.
            </p>
            <div className="mt-4 md:mt-6 flex items-center gap-2 text-[8px] font-black text-red-400 uppercase tracking-[0.2em]">
              40+ Synergies • Secret Stats
            </div>
          </div>
        </motion.div>

        {/* Marketing CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-32 w-full max-w-4xl bg-gradient-to-r from-red-950/20 via-zinc-900/50 to-red-950/20 border border-white/5 rounded-[3rem] p-12 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.1)_0%,transparent_70%)] pointer-events-none"></div>
          <h2 className="text-3xl font-black font-display uppercase tracking-widest text-white mb-6">
            Master the Cursed Energy
          </h2>
          <p className="text-sm text-zinc-400 font-mono uppercase tracking-[0.2em] mb-10 max-w-2xl mx-auto">
            The most comprehensive stat-clash experience for Jujutsu Kaisen fans. Built by
            sorcerers, for sorcerers.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <div className="px-6 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              100+ Entities
            </div>
            <div className="px-6 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Deep Lore Stats
            </div>
            <div className="px-6 py-2 bg-zinc-950 border border-zinc-800 rounded-full text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
              Series Win Tracking
            </div>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 w-full py-8 border-t border-white/5 bg-black/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start">
            <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.4em] mb-2">
              Build: Production {APP_VERSION}
            </p>
            <p className="text-xs text-zinc-600 font-mono uppercase">
              © 2026 Jujutsu Intelligence Systems
            </p>
          </div>

          <div className="flex items-center gap-8">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="flex items-center gap-2 text-zinc-400 hover:text-blue-500 transition-all font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-4 py-2 border border-zinc-800 rounded-sm"
            >
              <HelpCircle size={14} />
              How to Play
            </button>
            <button
              onClick={() => setIsChangelogOpen(true)}
              className="flex items-center gap-2 text-zinc-400 hover:text-red-500 transition-all font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-4 py-2 border border-zinc-800 rounded-sm relative"
            >
              <FileText size={14} />
              Changelogs
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[7px] font-black font-mono uppercase tracking-widest px-1.5 py-0.5 rounded-full animate-pulse">
                NEW
              </span>
            </button>
            <button
              onClick={() => navigate('/leaderboard')}
              className="flex items-center gap-2 text-zinc-400 hover:text-yellow-500 transition-all font-mono text-[10px] uppercase tracking-widest bg-zinc-900/50 px-4 py-2 border border-zinc-800 rounded-sm"
            >
              <Trophy size={14} />
              Leaderboard
            </button>
            <div className="flex items-center gap-4 border-l border-zinc-800 pl-8">
              <Twitter
                size={16}
                className="text-zinc-500 hover:text-white cursor-pointer transition-colors"
              />
              <Github
                size={16}
                className="text-zinc-500 hover:text-white cursor-pointer transition-colors"
              />
              <MessageSquare
                size={16}
                className="text-zinc-500 hover:text-white cursor-pointer transition-colors"
              />
            </div>
          </div>
        </div>
      </footer>

      <ChangelogModal isOpen={isChangelogOpen} onClose={() => setIsChangelogOpen(false)} />
      <HowToPlayTutorial isOpen={isHowToPlayOpen} onClose={() => setIsHowToPlayOpen(false)} />

      {/* Domain Expansion Transition Overlay */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden"
          >
            {/* Base black layer - video sits on top */}
            <div className="absolute inset-0 z-0 bg-black" />

            {/* Clash Animation Layer (visible immediately) */}
            <div className="absolute inset-0 z-[5] flex items-center justify-center overflow-hidden">
              <video
                ref={clashVideoRef}
                muted
                playsInline
                preload="auto"
                className="w-[120%] h-[120%] object-cover mix-blend-screen opacity-70"
              >
                <source src="/clash-compressed.mp4" type="video/mp4" />
              </video>
            </div>

            {/* Cinematic Camera Shake Layer */}
            <motion.div
              animate={{
                x: [0, -12, 12, -8, 8, -4, 4, 0],
                y: [0, 8, -8, 12, -12, 6, -6, 0],
              }}
              transition={{ duration: 0.3, repeat: 8, ease: 'easeInOut' }}
              className="absolute inset-0 z-10 flex items-center justify-center"
            >
              {/* Shatter Effect - Large Glass Panels */}
              {[...Array(12)].map((_, i) => {
                const angle = i * 30 + Math.random() * 10;
                const distance = 300 + Math.random() * 600;
                const size = 80 + Math.random() * 120;
                return (
                  <motion.div
                    key={i}
                    initial={{ scale: 0, opacity: 0, rotate: angle, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1.5, 3.5],
                      opacity: [0, 1, 0.8, 0],
                      x: [0, Math.cos((angle * Math.PI) / 180) * distance],
                      y: [0, Math.sin((angle * Math.PI) / 180) * distance],
                      rotate: [angle, angle + 180 + Math.random() * 180],
                    }}
                    transition={{
                      duration: 0.6 + Math.random() * 0.4,
                      delay: 0.05 * i,
                      ease: [0.25, 0.46, 0.45, 0.94],
                    }}
                    className="absolute w-[var(--size)] h-[var(--size)] border border-white/30"
                    style={{
                      width: size,
                      height: size,
                      clipPath: `polygon(${50 + (Math.random() * 20 - 10)}% 0%, ${100 - Math.random() * 20}% ${30 + Math.random() * 20}%, ${80 + Math.random() * 20}% ${80 + Math.random() * 20}%, ${20 + Math.random() * 20}% ${100 - Math.random() * 20}%, ${0 + Math.random() * 20}% ${40 + Math.random() * 20}%)`,
                      background: `radial-gradient(circle at ${50 + Math.random() * 40 - 20}% ${50 + Math.random() * 40 - 20}%, rgba(255,255,255,0.15), rgba(255,255,255,0.02))`,
                      backdropFilter: 'blur(4px)',
                      boxShadow:
                        '0 0 20px rgba(255,255,255,0.1), inset 0 0 20px rgba(255,255,255,0.05)',
                    }}
                  />
                );
              })}

              {/* Small debris particles */}
              {[...Array(30)].map((_, i) => {
                const angle = Math.random() * 360;
                const dist = 100 + Math.random() * 400;
                return (
                  <motion.div
                    key={`debris-${i}`}
                    initial={{ scale: 0, opacity: 0, x: 0, y: 0 }}
                    animate={{
                      scale: [0, 1, 0],
                      opacity: [0, 1, 0],
                      x: Math.cos((angle * Math.PI) / 180) * dist,
                      y: Math.sin((angle * Math.PI) / 180) * dist,
                    }}
                    transition={{
                      duration: 0.5 + Math.random() * 0.5,
                      delay: Math.random() * 0.3,
                      ease: 'easeOut',
                    }}
                    className="absolute w-[3px] h-[3px] bg-white/60 rounded-full"
                  />
                );
              })}

              {/* Central Flash Burst */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 3, 5], opacity: [0, 1, 0] }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className="absolute w-32 h-32 bg-white/20 rounded-full z-20"
                style={{
                  boxShadow: '0 0 100px rgba(255,255,255,0.3), 0 0 200px rgba(255,255,255,0.1)',
                }}
              />

              {/* Expanding domain barrier rings behind the burst */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.4, 1], opacity: [0, 0.85, 0.5] }}
                transition={{ duration: 0.9, delay: 0.25, ease: 'easeOut' }}
                className="absolute inset-0 z-[25] flex items-center justify-center"
              >
                <BarrierRings size={360} color="rgba(220,38,38,0.35)" spinDuration={12} />
              </motion.div>

              {/* Domain shockwaves */}
              <ShockRing delay={0.2} color="rgba(255,255,255,0.6)" maxScale={7} />
              <ShockRing delay={0.45} color="rgba(220,38,38,0.6)" maxScale={9} />

              {/* Cursed lightning crawling over the domain */}
              <div className="absolute inset-0 z-[35] pointer-events-none">
                <LightningArcs count={6} color="#ef4444" delay={1.1} />
                <LightningArcs count={5} color="#ffffff" delay={1.7} />
              </div>

              {/* Slash Layer */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: [0, 2.5, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 0.4, ease: 'circInOut' }}
                className="absolute w-full h-[4px] bg-white z-30"
                style={{
                  boxShadow: '0 0 80px rgba(255,255,255,0.8), 0 0 150px rgba(255,255,255,0.4)',
                }}
              />

              {/* Second Slash - diagonal */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: [0, 2, 0], opacity: [0, 0.7, 0] }}
                transition={{ duration: 0.35, delay: 0.15, ease: 'circInOut' }}
                className="absolute w-full h-[3px] bg-white/70 z-30"
                style={{ transform: 'rotate(25deg)', boxShadow: '0 0 60px rgba(255,255,255,0.5)' }}
              />

              {/* Domain Expansion Text */}
              <motion.div
                initial={{ opacity: 0, scale: 0.3, filter: 'blur(15px)' }}
                animate={{
                  opacity: [0, 1, 1, 0],
                  scale: [0.3, 1, 1.1, 2.5],
                  filter: ['blur(15px)', 'blur(0px)', 'blur(0px)', 'blur(30px)'],
                }}
                transition={{ duration: 2.2, delay: 0.15, times: [0, 0.2, 0.7, 1] }}
                className="relative z-40 flex flex-col items-center select-none pointer-events-none"
              >
                <span className="text-8xl md:text-[200px] font-black font-display text-white tracking-[0.15em] drop-shadow-[0_0_40px_rgba(255,255,255,0.8)]">
                  領域
                </span>
                <span className="text-8xl md:text-[200px] font-black font-display text-red-500 tracking-[0.15em] drop-shadow-[0_0_60px_rgba(220,38,38,0.9)] -mt-8 md:-mt-12">
                  展開
                </span>
              </motion.div>

              {/* Embers rising through the domain */}
              <div className="absolute inset-0 z-[38] pointer-events-none">
                <CursedEmbers count={22} maxDelay={1.2} />
              </div>
            </motion.div>

            {/* Final Flash to White */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0, 1] }}
              transition={{ duration: 2.5, times: [0, 0.88, 1] }}
              className="absolute inset-0 bg-white z-50"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
