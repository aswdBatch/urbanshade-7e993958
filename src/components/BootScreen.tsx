import { useState, useEffect, useRef } from "react";
import { isOfflineMode } from "@/integrations/supabase/client";

interface BootScreenProps {
  onComplete: () => void;
  onSafeMode?: () => void;
}

export const BootScreen = ({ onComplete, onSafeMode }: BootScreenProps) => {
  const [lines, setLines] = useState<{ text: string; type: "command" | "output" | "success" | "warn" | "error" | "system" }[]>([]);
  const [showSafeModePrompt, setShowSafeModePrompt] = useState(true);
  const [safeModeCountdown, setSafeModeCountdown] = useState(3);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [flickerOpacity, setFlickerOpacity] = useState(1);
  const terminalRef = useRef<HTMLDivElement>(null);

  // Build boot sequence dynamically based on Supabase status
  const getBootSequence = () => {
    const sequence: { text: string; type: "command" | "output" | "success" | "warn" | "error" | "system"; delay: number }[] = [
      // Port calls - 1 fail, 2 good
      { text: "> call port 21", type: "command", delay: 200 },
      { text: "Port 21 connection failed. [FAIL]", type: "error", delay: 150 },
      { text: "> call port 80", type: "command", delay: 200 },
      { text: "Port 80 [OK] - HTTP ready", type: "success", delay: 100 },
      { text: "> call port 443", type: "command", delay: 200 },
      { text: "Port 443 [OK] - HTTPS ready", type: "success", delay: 100 },
      { text: "", type: "output", delay: 50 },
      
      // Init drives
      { text: "> init drives", type: "command", delay: 250 },
      { text: "Mounting drive C:\\ [OK]", type: "success", delay: 100 },
      { text: "Mounting drive D:\\ [OK]", type: "success", delay: 100 },
      { text: "", type: "output", delay: 50 },
      
      // Init systems
      { text: "> init systems", type: "command", delay: 250 },
      { text: "Loading core modules... [OK]", type: "success", delay: 120 },
      { text: "Loading display drivers... [OK]", type: "success", delay: 100 },
      { text: "Loading network stack... [OK]", type: "success", delay: 100 },
      { text: "", type: "output", delay: 50 },
      
      // Call backup drive
      { text: "> call backup_drive", type: "command", delay: 200 },
      { text: "Backup drive connected [OK]", type: "success", delay: 100 },
      { text: "", type: "output", delay: 50 },
      
      // Call supabase - depends on actual status
      { text: "> call supabase", type: "command", delay: 300 },
    ];

    if (isOfflineMode) {
      sequence.push({ text: "Connecting to Supabase backend... [FAIL]", type: "error", delay: 200 });
      sequence.push({ text: "WARNING: Running in offline mode", type: "warn", delay: 150 });
    } else {
      sequence.push({ text: "Connecting to Supabase backend... [OK]", type: "success", delay: 150 });
    }

    sequence.push({ text: "", type: "output", delay: 50 });

    // 10x repeat "Complete. Calling system.sys..."
    for (let i = 0; i < 10; i++) {
      sequence.push({ text: "Complete. Calling system.sys...", type: "output", delay: 80 });
    }

    sequence.push({ text: "", type: "output", delay: 50 });

    // Goto login
    sequence.push({ text: "> goto login", type: "command", delay: 200 });
    sequence.push({ text: "Launching desktop environment...", type: "system", delay: 300 });

    return sequence;
  };

  const bootSequence = getBootSequence();

  // Cursor blink effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible(v => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Random flicker effect
  useEffect(() => {
    const flicker = () => {
      if (Math.random() < 0.1) {
        setFlickerOpacity(0.7 + Math.random() * 0.3);
        setTimeout(() => setFlickerOpacity(1), 50 + Math.random() * 100);
      }
    };
    const interval = setInterval(flicker, 200);
    return () => clearInterval(interval);
  }, []);

  // Safe mode countdown
  useEffect(() => {
    if (!showSafeModePrompt) return;
    
    const interval = setInterval(() => {
      setSafeModeCountdown(prev => {
        if (prev <= 1) {
          setShowSafeModePrompt(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'F8' && showSafeModePrompt) {
        setShowSafeModePrompt(false);
        onSafeMode?.();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      clearInterval(interval);
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showSafeModePrompt, onSafeMode]);

  // Boot sequence runner
  useEffect(() => {
    if (showSafeModePrompt) return;

    let currentIndex = 0;
    
    const showNextLine = () => {
      if (currentIndex < bootSequence.length) {
        const item = bootSequence[currentIndex];
        setLines(prev => [...prev, { text: item.text, type: item.type }]);
        currentIndex++;
        
        // Auto-scroll
        if (terminalRef.current) {
          terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
        
        setTimeout(showNextLine, item.delay);
      } else {
        setTimeout(() => {
          onComplete();
        }, 400);
      }
    };

    showNextLine();
  }, [onComplete, showSafeModePrompt]);

  const getLineColor = (type: string) => {
    switch (type) {
      case "command": return "text-[#00bfff]";
      case "success": return "text-[#00bfff]";
      case "warn": return "text-[#ffcc00]";
      case "error": return "text-[#ff3333]";
      case "system": return "text-[#00bfff] font-bold";
      default: return "text-[#00bfff]/70";
    }
  };

  if (showSafeModePrompt) {
    return (
      <div className="fixed inset-0 bg-black font-mono flex items-center justify-center overflow-hidden">
        {/* CRT effects */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Scanlines */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 191, 255, 0.03) 2px, rgba(0, 191, 255, 0.03) 4px)'
            }}
          />
          {/* Vignette */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%)'
            }}
          />
        </div>

        <div className="text-center space-y-4 z-10">
          <div className="text-[#00bfff] text-2xl font-bold animate-pulse tracking-widest">
            URBANSHADE OS
          </div>
          <div className="text-[#00bfff]/80 text-sm">
            Press <kbd className="px-3 py-1 bg-[#00bfff]/20 rounded text-[#00bfff] font-bold border border-[#00bfff]/40">F8</kbd> for Safe Mode
          </div>
          <div className="text-[#00bfff]/50 text-xs">
            Booting normally in {safeModeCountdown}...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="fixed inset-0 bg-black font-mono overflow-hidden"
      style={{ opacity: flickerOpacity }}
    >
      {/* CRT effects layer */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {/* Scanlines */}
        <div 
          className="absolute inset-0 opacity-[0.08]"
          style={{
            background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 191, 255, 0.1) 2px, rgba(0, 191, 255, 0.1) 4px)'
          }}
        />
        {/* Horizontal scan bar */}
        <div 
          className="absolute left-0 right-0 h-[2px] bg-[#00bfff]/20 animate-scan"
          style={{
            animation: 'scan 8s linear infinite'
          }}
        />
        {/* Vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.5) 100%)'
          }}
        />
        {/* Screen curvature effect */}
        <div 
          className="absolute inset-0 opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.8) 100%)'
          }}
        />
      </div>

      {/* Terminal content */}
      <div 
        ref={terminalRef}
        className="h-full p-6 overflow-y-auto text-xs leading-relaxed z-0"
        style={{
          textShadow: '0 0 5px rgba(0, 191, 255, 0.5), 0 0 10px rgba(0, 191, 255, 0.3)'
        }}
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={`${getLineColor(line.type)} ${line.text === "" ? "h-3" : ""}`}
          >
            {line.text}
          </div>
        ))}
        
        {/* Blinking cursor */}
        <span 
          className="text-[#00bfff] inline-block"
          style={{ 
            opacity: cursorVisible ? 1 : 0,
            textShadow: '0 0 5px rgba(0, 191, 255, 0.8)'
          }}
        >
          ▌
        </span>
      </div>

      {/* Bottom status bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-[#00bfff]/20 bg-black/80 z-20">
        <div className="flex items-center justify-between text-[10px] text-[#00bfff]/60">
          <span>URBANSHADE HADAL BLACKSITE</span>
          <span>DEPTH: 8,247m | HULL: 98.7%</span>
          <span className="font-mono">{new Date().toISOString()}</span>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: 0%; }
          100% { top: 100%; }
        }
      `}</style>
    </div>
  );
};