import { useState } from "react";
import { Lock, Terminal as TerminalIcon } from "lucide-react";

interface LoginScreenProps {
  onLogin: () => void;
}

export const LoginScreen = ({ onLogin }: LoginScreenProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!username || !password) {
      setError("Please enter username and password");
      return;
    }

    setLoading(true);

    // Timeout after 10 seconds
    const timeoutId = setTimeout(() => {
      setError("Authentication timed out. Please try again.");
      setLoading(false);
    }, 10000);

    // Check against stored admin credentials
    setTimeout(() => {
      clearTimeout(timeoutId);
      const adminData = localStorage.getItem("urbanshade_admin");
      
      if (adminData) {
        const admin = JSON.parse(adminData);
        if (username === admin.username && password === admin.password) {
          onLogin();
        } else {
          setError("Invalid credentials");
          setLoading(false);
        }
      } else {
        setError("System error: No administrator account found");
        setLoading(false);
      }
    }, 1500);
  };

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: 'linear-gradient(hsl(var(--primary) / 0.1) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />
      </div>

      <div className="relative z-10 w-full max-w-md p-8 animate-fade-in">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center mb-6 animate-scale-in">
            <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-lg shadow-primary/10">
              <TerminalIcon className="w-14 h-14 text-primary" />
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-primary via-cyan-400 to-primary bg-clip-text text-transparent animate-fade-in" style={{ animationDelay: '100ms' }}>
            URBANSHADE
          </h1>
          <p className="text-sm text-muted-foreground font-medium animate-fade-in mb-3" style={{ animationDelay: '200ms' }}>
            Secure Operating System v2.7
          </p>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-mono text-muted-foreground">Depth: 8,247m • Pressure: Extreme</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4 animate-fade-in" style={{ animationDelay: '400ms' }}>
          <div className="bg-card/50 backdrop-blur-sm border border-border/50 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
                <Lock className="w-4 h-4 text-primary" />
              </div>
              <span className="font-bold text-sm text-foreground">Authentication Required</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                placeholder="Enter your username"
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground text-sm focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none transition-all"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm animate-fade-in flex items-start gap-2">
                <span className="text-base">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 rounded-xl bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                  Authenticating...
                </span>
              ) : (
                "Sign In"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-muted-foreground/60 space-y-1.5 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <div>© 2025 UrbanShade Corporation</div>
          <div className="flex items-center justify-center gap-2 text-destructive/80">
            <span className="text-base">⚠️</span>
            <span>Unauthorized access is prohibited</span>
          </div>
          <div className="text-muted-foreground/40 pt-2">This is a simulated operating system</div>
        </div>
      </div>
    </div>
  );
};
