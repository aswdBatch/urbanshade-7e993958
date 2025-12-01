import { useState } from "react";
import { Link } from "react-router-dom";
import { 
  ArrowLeft, Terminal as TerminalIcon, AlertTriangle, Sparkles, 
  Monitor, Palette, Shield, Zap, Eye, RotateCw, Skull,
  Shuffle, Volume2, Lock, Code, Settings
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Admin = () => {
  const [glitchMode, setGlitchMode] = useState(false);
  const [rainbowMode, setRainbowMode] = useState(false);
  const [funMode, setFunMode] = useState(false);
  
  // Custom crash builder
  const [customCrashType, setCustomCrashType] = useState<"kernel" | "virus" | "bluescreen" | "memory" | "corruption" | "overload">("kernel");
  const [customCrashTitle, setCustomCrashTitle] = useState("CUSTOM SYSTEM ERROR");
  const [customCrashMessage, setCustomCrashMessage] = useState("This is a custom crash message.\nYou can write anything here.\n\nMultiple lines supported!");

  const handleGlitchMode = () => {
    setGlitchMode(!glitchMode);
    toast.success(glitchMode ? "Glitch mode disabled" : "Glitch mode enabled");
    if (!glitchMode) {
      document.body.classList.add("animate-pulse");
    } else {
      document.body.classList.remove("animate-pulse");
    }
  };

  const handleRainbowMode = () => {
    setRainbowMode(!rainbowMode);
    toast.success(rainbowMode ? "Rainbow mode disabled" : "🌈 RAINBOW MODE ACTIVATED");
  };

  const handleFunMode = () => {
    setFunMode(!funMode);
    toast.success(funMode ? "Fun mode disabled" : "🎉 FUN MODE ACTIVATED!");
    if (!funMode) {
      document.body.style.transform = "rotate(0.5deg)";
    } else {
      document.body.style.transform = "";
    }
  };

  const handleFlashScreen = () => {
    document.body.style.background = "#fff";
    setTimeout(() => {
      document.body.style.background = "";
    }, 100);
    toast.success("⚡ Flash bang!");
  };

  const handleGlitchText = () => {
    const elements = document.querySelectorAll('div, p, span, button');
    elements.forEach(el => {
      if (el.textContent && Math.random() > 0.7) {
        const original = el.textContent;
        el.textContent = original.split('').map(c => Math.random() > 0.5 ? String.fromCharCode(Math.random() * 93 + 33) : c).join('');
        setTimeout(() => {
          el.textContent = original;
        }, 2000);
      }
    });
    toast.success("📝 Text corruption initiated");
  };

  const handleZoomMode = () => {
    const current = document.body.style.zoom;
    if (current === "1.5") {
      document.body.style.zoom = "1";
      toast.success("🔍 Zoom reset");
    } else {
      document.body.style.zoom = "1.5";
      toast.success("🔍 Zoomed in!");
    }
  };

  const handleGrayscale = () => {
    const current = document.body.style.filter;
    if (current.includes("grayscale")) {
      document.body.style.filter = current.replace("grayscale(1)", "");
      toast.success("🎨 Colors restored");
    } else {
      document.body.style.filter = (current || "") + " grayscale(1)";
      toast.success("⚫ Grayscale enabled");
    }
  };

  const handleBlur = () => {
    const current = document.body.style.filter;
    if (current.includes("blur")) {
      document.body.style.filter = current.replace(/blur\([^)]*\)/g, "");
      toast.success("👁️ Focus restored");
    } else {
      document.body.style.filter = (current || "") + " blur(3px)";
      toast.success("🌫️ Blur effect applied");
    }
  };

  const handlePixelate = () => {
    document.body.style.imageRendering = document.body.style.imageRendering === "pixelated" ? "" : "pixelated";
    toast.success("🎮 Retro mode toggled");
  };

  const handleMatrixMode = () => {
    toast.success("Entering the Matrix... 01010101");
    document.body.style.fontFamily = "monospace";
    setTimeout(() => {
      document.body.style.fontFamily = "";
    }, 5000);
  };

  const handleShakeScreen = () => {
    toast.success("🎢 Hold on tight!");
    document.body.style.animation = "shake 0.5s";
    setTimeout(() => {
      document.body.style.animation = "";
    }, 500);
  };

  const handleInvertColors = () => {
    toast.success("Inverting reality...");
    document.body.style.filter = document.body.style.filter === "invert(1)" ? "" : "invert(1)";
  };

  const handleRotateScreen = () => {
    const current = document.body.style.transform;
    if (current.includes("rotate")) {
      document.body.style.transform = "";
      toast.success("Back to normal... or is it?");
    } else {
      document.body.style.transform = "rotate(180deg)";
      toast.success("🙃 Everything is upside down now!");
    }
  };

  const handleSlowMotion = () => {
    toast.success("⏱️ Entering slow motion mode...");
    document.body.style.transition = "all 2s ease";
    setTimeout(() => {
      document.body.style.transition = "";
    }, 5000);
  };

  const handleRandomChaos = () => {
    const chaosActions = [
      handleShakeScreen,
      handleMatrixMode,
      handleGlitchMode,
      handleRainbowMode,
    ];
    const randomAction = chaosActions[Math.floor(Math.random() * chaosActions.length)];
    randomAction();
    toast.error("🎲 Random chaos initiated!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <TerminalIcon className="w-8 h-8 text-primary animate-pulse" />
            <div>
              <h1 className="text-2xl font-bold text-primary">SYSTEM ADMINISTRATOR</h1>
              <p className="text-xs text-muted-foreground">Level 5 Clearance • Unrestricted Access</p>
            </div>
          </div>
          <Link 
            to="/" 
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/20 border border-primary/30 text-primary hover:bg-primary/30 transition-colors text-sm font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Desktop
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Banner */}
        <Card className="mb-8 border-primary/30 bg-gradient-to-r from-primary/10 to-blue-500/10">
          <CardHeader>
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-yellow-500" />
              <div>
                <CardTitle className="text-primary">Administrator Mode Active</CardTitle>
                <CardDescription>
                  Full system control enabled. All actions are logged.
                </CardDescription>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Main Control Panel */}
        <Tabs defaultValue="visual" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-black/40">
            <TabsTrigger value="visual" className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Visual
            </TabsTrigger>
            <TabsTrigger value="system" className="flex items-center gap-2">
              <Monitor className="w-4 h-4" />
              System
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="crash" className="flex items-center gap-2">
              <Skull className="w-4 h-4" />
              Crash
            </TabsTrigger>
            <TabsTrigger value="chaos" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Chaos
            </TabsTrigger>
          </TabsList>

          {/* Visual Effects Tab */}
          <TabsContent value="visual" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Palette className="w-5 h-5 text-primary" />
                    Color Effects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleRainbowMode}
                    variant={rainbowMode ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    🌈 Rainbow Mode
                  </Button>
                  <Button
                    onClick={handleInvertColors}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    🔄 Invert Colors
                  </Button>
                  <Button
                    onClick={handleGrayscale}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    ⚫ Grayscale
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 text-primary" />
                    Visual Filters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleBlur}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    🌫️ Blur Effect
                  </Button>
                  <Button
                    onClick={handlePixelate}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    🎮 Pixelate
                  </Button>
                  <Button
                    onClick={handleGlitchMode}
                    variant={glitchMode ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    ⚡ Glitch Mode
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Special Effects
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleMatrixMode}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    💚 Matrix Mode
                  </Button>
                  <Button
                    onClick={handleFlashScreen}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    ⚡ Flash Bang
                  </Button>
                  <Button
                    onClick={handleGlitchText}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    📝 Corrupt Text
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* System Modifications Tab */}
          <TabsContent value="system" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <RotateCw className="w-5 h-5 text-primary" />
                    Orientation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleFunMode}
                    variant={funMode ? "default" : "outline"}
                    className="w-full justify-start"
                  >
                    📐 Tilt Mode
                  </Button>
                  <Button
                    onClick={handleRotateScreen}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    🙃 Rotate 180°
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Zap className="w-5 h-5 text-primary" />
                    Motion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleShakeScreen}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    🎢 Shake Screen
                  </Button>
                  <Button
                    onClick={handleSlowMotion}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    ⏱️ Slow Motion
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Monitor className="w-5 h-5 text-primary" />
                    Display
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleZoomMode}
                    variant="outline"
                    className="w-full justify-start"
                  >
                    🔍 Zoom 1.5x
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Controls Tab */}
          <TabsContent value="security" className="space-y-6">
            <Card className="border-red-500/30 bg-red-500/5">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                  <div>
                    <CardTitle className="text-red-500">Security Controls</CardTitle>
                    <CardDescription>
                      Dangerous operations - use with caution
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => {
                      const current = localStorage.getItem('bios_security_enabled') !== 'false';
                      localStorage.setItem('bios_security_enabled', String(!current));
                      toast.success(!current ? "✓ Security Enabled" : "⚠ Security DISABLED", {
                        description: !current ? "All security features restored" : "System is now vulnerable"
                      });
                    }}
                    variant="outline"
                    className="border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10"
                  >
                    <Shield className="w-4 h-4 mr-2" />
                    Toggle System Security
                  </Button>
                  
                  <Button
                    onClick={() => {
                      localStorage.removeItem('urbanshade_admin');
                      localStorage.removeItem('urbanshade_accounts');
                      toast.warning("🔓 Authentication Disabled");
                    }}
                    variant="outline"
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Disable Authentication
                  </Button>
                  
                  <Button
                    onClick={() => {
                      localStorage.setItem('bios_password', '');
                      toast.success("BIOS password removed");
                    }}
                    variant="outline"
                    className="border-orange-500/50 text-orange-500 hover:bg-orange-500/10"
                  >
                    <Code className="w-4 h-4 mr-2" />
                    Clear BIOS Password
                  </Button>
                  
                  <Button
                    onClick={() => {
                      localStorage.clear();
                      toast.error("🗑️ All data cleared!", {
                        description: "Reload the page to reset the system"
                      });
                    }}
                    variant="outline"
                    className="border-red-500/50 text-red-500 hover:bg-red-500/10"
                  >
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    Factory Reset
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Crash Builder Tab */}
          <TabsContent value="crash" className="space-y-6">
            <Card className="border-red-500/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-500">
                  <Skull className="w-6 h-6" />
                  Custom Crash Builder
                </CardTitle>
                <CardDescription>
                  Create custom system crashes (triggers on main OS, not this page)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Crash Type</label>
                  <Select value={customCrashType} onValueChange={(value: any) => setCustomCrashType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kernel">Kernel Panic</SelectItem>
                      <SelectItem value="virus">Virus Infection</SelectItem>
                      <SelectItem value="bluescreen">Blue Screen</SelectItem>
                      <SelectItem value="memory">Memory Error</SelectItem>
                      <SelectItem value="corruption">Data Corruption</SelectItem>
                      <SelectItem value="overload">System Overload</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Crash Title</label>
                  <input
                    type="text"
                    value={customCrashTitle}
                    onChange={(e) => setCustomCrashTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-black/40 border border-white/10 rounded-lg"
                    placeholder="ERROR TITLE"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold">Crash Message</label>
                  <Textarea
                    value={customCrashMessage}
                    onChange={(e) => setCustomCrashMessage(e.target.value)}
                    className="min-h-[120px] bg-black/40 border-white/10"
                    placeholder="Enter crash message..."
                  />
                </div>

                <Button
                  onClick={() => {
                    localStorage.setItem('admin_trigger_crash', JSON.stringify({
                      type: customCrashType,
                      title: customCrashTitle,
                      message: customCrashMessage
                    }));
                    toast.success("Crash queued! Return to desktop to trigger it.");
                  }}
                  variant="destructive"
                  className="w-full"
                >
                  <Skull className="w-4 h-4 mr-2" />
                  Queue Custom Crash
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Chaos Tab */}
          <TabsContent value="chaos" className="space-y-6">
            <Card className="border-purple-500/30 bg-purple-500/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-400">
                  <Shuffle className="w-6 h-6" />
                  Chaos Mode
                </CardTitle>
                <CardDescription>
                  For when you really want to break things
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={handleRandomChaos}
                  variant="outline"
                  className="w-full border-purple-500/50 text-purple-400 hover:bg-purple-500/10"
                  size="lg"
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  ACTIVATE RANDOM CHAOS
                </Button>
              </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button
                    onClick={() => toast.success("🔓 ADMIN ACCESS CONFIRMED")}
                    variant="outline"
                    className="w-full text-sm"
                    size="sm"
                  >
                    Secret Function
                  </Button>
                  <Button
                    onClick={() => {
                      toast.error("🚨 INITIATING SYSTEM PURGE...", {
                        description: "Just kidding! But imagine..."
                      });
                    }}
                    variant="outline"
                    className="w-full text-sm"
                    size="sm"
                  >
                    Fake Nuke Button
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-white/10 py-6">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-muted-foreground">
            Administrator Panel • URBANSHADE OS v2.2.0
          </p>
          <p className="text-xs text-red-400 mt-2">
            ⚠️ All actions are logged • Misuse will result in immediate termination
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Admin;