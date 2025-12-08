import { ArrowLeft, Terminal, Rocket, Folder, Map, Keyboard, HelpCircle, Zap, Waves, Shield, Bug } from "lucide-react";
import { Link } from "react-router-dom";
import { BookOpen, Terminal, Shield, Cpu, Map, ArrowLeft, Keyboard, HelpCircle, Bug, Zap, Package } from "lucide-react";
import { DocSearch } from "@/components/DocSearch";

const docSections = [
  {
    title: "Getting Started",
    description: "Learn the basics of UrbanShade OS and how to navigate the facility systems.",
    icon: BookOpen,
    link: "/docs/getting-started",
    color: "from-green-500/20 to-emerald-500/20",
    borderColor: "border-green-500/30"
  },
  {
    title: "Applications",
    description: "Complete guide to all built-in applications and their features.",
    icon: Cpu,
    link: "/docs/applications",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-500/30"
  },
  {
    title: "Facility Guide",
    description: "Understanding zones, containment protocols, and facility operations.",
    icon: Map,
    link: "/docs/facility",
    color: "from-purple-500/20 to-pink-500/20",
    borderColor: "border-purple-500/30"
  },
  {
    title: "Terminal Guide",
    description: "Master the command line with our comprehensive terminal reference.",
    icon: Terminal,
    link: "/docs/terminal",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-500/30"
  },
  {
    title: "New Features",
    description: "UUR categories, ratings, window groups, multiple desktops, crash recovery & more.",
    icon: Zap,
    link: "/docs/features",
    color: "from-cyan-500/20 to-blue-500/20",
    borderColor: "border-cyan-500/30"
  },
  {
    title: "Advanced Features",
    description: "BIOS, Recovery Mode, Admin Panel, and other power user features.",
    icon: Shield,
    link: "/docs/advanced",
    color: "from-red-500/20 to-rose-500/20",
    borderColor: "border-red-500/30"
  },
  {
    title: "UUR Repository",
    description: "How to browse, install, rate, and submit packages to UUR.",
    icon: Package,
    link: "/docs/uur",
    color: "from-teal-500/20 to-emerald-500/20",
    borderColor: "border-teal-500/30"
  },
  {
    title: "Keyboard Shortcuts",
    description: "Quick reference for all keyboard shortcuts and hotkeys.",
    icon: Keyboard,
    link: "/docs/shortcuts",
    color: "from-indigo-500/20 to-violet-500/20",
    borderColor: "border-indigo-500/30"
  },
  {
    title: "DEF-DEV Console",
    description: "Developer documentation for the debugging and administration console.",
    icon: Bug,
    link: "/docs/def-dev",
    color: "from-amber-500/20 to-yellow-500/20",
    borderColor: "border-amber-500/30"
  },
  {
    title: "Troubleshooting",
    description: "Common issues, error codes, and how to resolve them.",
    icon: HelpCircle,
    link: "/docs/troubleshooting",
    color: "from-gray-500/20 to-slate-500/20",
    borderColor: "border-gray-500/30"
  }
];

const Docs = () => {
  const sections = [
    {
      icon: Rocket,
      title: "Getting Started",
      description: "New to the facility? Start here! Learn the ropes before something inevitably goes wrong. Spoiler: Something always goes wrong.",
      link: "/docs/getting-started",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/30"
    },
    {
      icon: Folder,
      title: "Core Applications",
      description: "Your digital toolbox: File Explorer, Notepad, Calculator, and other apps you'll pretend to use productively. (We see your Solitaire tab.)",
      link: "/docs/applications",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30"
    },
    {
      icon: Map,
      title: "Facility Applications",
      description: "The fun stuff! Security cameras, containment monitors, and other apps for managing your totally-not-haunted underwater base. Ghosts sold separately.",
      link: "/docs/facility",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30"
    },
    {
      icon: Terminal,
      title: "Terminal Guide",
      description: "Feel like a movie hacker with our command line interface. Comes with authentic typing sounds (just kidding, you have to make those yourself).",
      link: "/docs/terminal",
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/30"
    },
    {
      icon: Shield,
      title: "Admin Panel",
      description: "The control panel for chaos enthusiasts. Warning: May cause uncontrollable laughter, confusion, and questioning reality. Side effects include power trips.",
      link: "/docs/admin-panel",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/30"
    },
    {
      icon: Zap,
      title: "Advanced Features",
      description: "BIOS, Recovery Mode, and other ways to pretend you're a systems engineer. No actual engineering degree required. Coffee addiction helps.",
      link: "/docs/advanced",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      borderColor: "border-yellow-500/30"
    },
    {
      icon: Keyboard,
      title: "Keyboard Shortcuts",
      description: "Learn all the key combos because real pros don't use mice. Impress absolutely no one at parties with your ALT+F4 knowledge!",
      link: "/docs/shortcuts",
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/30"
    },
    {
      icon: HelpCircle,
      title: "Troubleshooting",
      description: "When things go wrong (and they will). From 'I forgot my password' to 'Why is everything upside down and rainbow colored?'. We've seen it all.",
      link: "/docs/troubleshooting",
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30"
    },
    {
      icon: Bug,
      title: "DEF-DEV Console",
      description: "Developer documentation. Real-time logging, action monitoring, storage inspection, and system debugging. For developers only.",
      link: "/docs/def-dev",
      color: "text-amber-400",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <h1 className="text-xl font-bold text-primary">URBANSHADE Documentation</h1>
          <div className="flex items-center gap-3">
            <DocSearch />
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to App
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12 space-y-16">
        {/* Hero */}
        <section className="text-center space-y-6">
          <div className="relative inline-block">
            <Waves className="w-20 h-20 mx-auto text-primary animate-pulse" />
            <div className="absolute -inset-4 bg-primary/20 blur-xl rounded-full -z-10" />
          </div>
          
          <h2 className="text-5xl font-bold">
            Welcome to <span className="text-primary">URBANSHADE OS</span>
          </h2>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The only operating system designed for managing fictional underwater research facilities. 
            Now with 100% fewer actual containment breaches than the real thing! (We hope. We think. Probably.) 🐙
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              🌊 Depth: 8,247m Below Sea Level
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              🔬 100% Fictional (Sadly)
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              🎮 0% Actual OS Functionality
            </span>
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">
              ☕ Powered by Too Much Coffee
            </span>
          </div>
        </section>

        {/* What is this */}
        <section className="p-8 rounded-xl bg-gradient-to-br from-primary/20 via-blue-500/10 to-purple-500/20 border-2 border-primary/40 shadow-xl">
          <h3 className="text-3xl font-bold mb-6 text-primary">So, what exactly is this thing?</h3>
          <div className="space-y-4 text-muted-foreground leading-relaxed">
            <p className="text-lg">
              <strong className="text-foreground">URBANSHADE OS</strong> is a web-based simulation of a 
              retro-futuristic operating system, lovingly ripped off— err, <em>inspired by</em> the game Pressure. 
              It's like playing pretend, but with more terminal commands, fewer real consequences, and significantly 
              more underwater-themed existential dread.
            </p>
            <p>
              Everything here runs in your browser. Your "files" aren't real files (sorry, they can't help with your taxes). 
              Your "passwords" are stored in localStorage (please, <strong className="text-yellow-400">PLEASE</strong> don't use real passwords). 
              The containment units contain nothing but your imagination and maybe some JSON data. 
              And the crushing pressure of the deep ocean? That's just JavaScript trying to parse your code.
            </p>
            <p className="text-primary font-semibold text-lg border-l-4 border-primary pl-4 bg-black/30 py-3 rounded">
              <strong>TL;DR:</strong> It's a fun, interactive experience that lets you roleplay as an underwater 
              facility operator. Click things, explore, break stuff, fix stuff, and try not to trigger too many 
              simulated emergencies. The monsters aren't real, the stress is optional, but the entertainment is guaranteed! 🐙✨
            </p>
            <p className="text-sm text-muted-foreground italic">
              (Legal disclaimer: Any resemblance to real underwater research stations containing anomalous entities 
              is purely coincidental and definitely not a government cover-up. Any claims otherwise will be investigated 
              by entities that definitely don't exist.)
            </p>
          </div>
        </section>

        {/* Documentation Sections */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold text-center">Choose Your Adventure</h3>
          <p className="text-center text-muted-foreground">
            Pick a topic and dive in. Get it? Dive? Because we're underwater? ...okay that joke's getting old. 
            Just pick something already. 🤿
          </p>
          
          <div className="grid gap-4 md:grid-cols-2">
            {sections.map((section, index) => (
              <Link
                key={index}
                to={section.link}
                className={`p-6 rounded-xl ${section.bgColor} border ${section.borderColor} hover:scale-[1.02] transition-all group`}
              >
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-lg bg-black/40 flex items-center justify-center flex-shrink-0`}>
                    <section.icon className={`w-6 h-6 ${section.color}`} />
                  </div>
                  <div className="space-y-1">
                    <h4 className={`font-bold text-lg ${section.color} group-hover:underline`}>
                      {section.title}
                    </h4>
                    <p className="text-sm text-muted-foreground">
                      {section.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Quick Tips */}
        <section className="space-y-6">
          <h3 className="text-2xl font-bold">Quick Tips for New Recruits</h3>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="p-4 rounded-lg bg-black/40 border border-white/10 text-center">
              <div className="text-3xl mb-2">🔑</div>
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-2 py-0.5 bg-black/60 rounded border border-white/20 text-xs">DEL</kbd> during 
                boot to access BIOS. On Chromebook? Just type "del" like a normal person.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-black/40 border border-white/10 text-center">
              <div className="text-3xl mb-2">🔄</div>
              <p className="text-sm text-muted-foreground">
                Press <kbd className="px-2 py-0.5 bg-black/60 rounded border border-white/20 text-xs">F2</kbd> during 
                boot for Recovery Mode. Because sometimes things go REALLY wrong.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-black/40 border border-white/10 text-center">
              <div className="text-3xl mb-2">🤫</div>
              <p className="text-sm text-muted-foreground">
                Type <code className="px-2 py-0.5 bg-black/60 rounded border border-white/20 text-xs">secret</code> in 
                Terminal for admin access. Shh, it's a secret. (Not really, everyone knows.)
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="text-center pt-8 border-t border-white/10 space-y-4">
          <p className="text-sm text-muted-foreground">
            URBANSHADE OS Documentation • v2.2.0 • © 2024 Urbanshade Corporation  
          </p>
          <p className="text-xs text-muted-foreground max-w-2xl mx-auto">
            This is a fictional simulation for entertainment purposes. No actual deep-sea facilities 
            were harmed in the making of this software. Any resemblance to real underwater research 
            stations containing anomalous entities is purely coincidental and definitely not a government cover-up. 🐙
          </p>
          <p className="text-xs text-yellow-400 italic">
            (If you're reading this from an actual underwater facility, please send help. And snacks. 
            Preferably waterproof snacks. Do those exist? Asking for a friend.)
          </p>
          <Link to="/" className="inline-block text-primary hover:underline text-sm font-semibold">
            ← Return to Simulation (Escape the Docs)
          </Link>
        </footer>
      </main>
    </div>
  );
};

export default Docs;
