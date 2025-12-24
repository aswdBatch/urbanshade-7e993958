import { useState } from "react";
import { Lock, Terminal as TerminalIcon, User, UserCircle, Shield } from "lucide-react";
import { ShutdownOptionsDialog } from "./ShutdownOptionsDialog";

interface UserSelectionScreenProps {
  onLogin: (isGuest?: boolean) => void;
  onShutdown?: () => void;
  onRestart?: () => void;
}

export const UserSelectionScreen = ({ onLogin, onShutdown, onRestart }: UserSelectionScreenProps) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showShutdownOptions, setShowShutdownOptions] = useState(false);

  // Get admin user with error handling
  const adminData = localStorage.getItem("urbanshade_admin");
  let admin = null;
  
  try {
    if (adminData) {
      admin = JSON.parse(adminData);
      // Validate required fields
      if (!admin.id || !admin.name) {
        console.error("Invalid admin data structure");
        admin = null;
      }
    }
  } catch (e) {
    console.error("Failed to parse admin data:", e);
    admin = null;
  }

  // Get additional accounts
  const accountsData = localStorage.getItem("urbanshade_accounts");
  let additionalAccounts: any[] = [];
  
  try {
    if (accountsData) {
      additionalAccounts = JSON.parse(accountsData);
    }
  } catch (e) {
    console.error("Failed to parse accounts data:", e);
  }

  // Combine admin and additional accounts
  const users = admin ? [admin, ...additionalAccounts] : additionalAccounts;

  const handleUserSelect = (userId: string) => {
    const user = users.find(u => u.id === userId);
    
    // If user has no password, log them in immediately
    if (user && (!user.password || user.password.length === 0)) {
      setLoading(true);
      localStorage.setItem("urbanshade_current_user", JSON.stringify(user));
      setTimeout(() => {
        onLogin(false);
      }, 500);
      return;
    }
    
    setSelectedUser(userId);
    setPassword("");
    setError("");
  };

  const handleGuestLogin = () => {
    setLoading(true);
    // Store guest user
    localStorage.setItem("urbanshade_current_user", JSON.stringify({
      id: "guest",
      name: "Guest",
      username: "Guest",
      role: "Guest",
      clearance: 1,
      isGuest: true
    }));
    setTimeout(() => {
      onLogin(true);
    }, 1000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const user = users.find(u => u.id === selectedUser);
    if (!user) {
      setError("User not found");
      return;
    }

    // Check if user has a password
    const hasPassword = user.password && user.password.length > 0;

    // If user has no password, allow login without password
    if (!hasPassword) {
      setLoading(true);
      localStorage.setItem("urbanshade_current_user", JSON.stringify(user));
      setTimeout(() => {
        onLogin(false);
      }, 1000);
      return;
    }

    // If user has password, require it
    if (!password) {
      setError("Please enter password");
      return;
    }

    setLoading(true);

    // Timeout after 10 seconds
    const timeoutId = setTimeout(() => {
      setError("Authentication timed out. Please try again.");
      setLoading(false);
      setPassword("");
    }, 10000);

    setTimeout(() => {
      clearTimeout(timeoutId);
      if (password === user.password) {
        // Store current logged in user
        localStorage.setItem("urbanshade_current_user", JSON.stringify(user));
        onLogin(false);
      } else {
        setError("Incorrect password");
        setLoading(false);
        setPassword("");
      }
    }, 1000);
  };

  const handleBack = () => {
    setSelectedUser(null);
    setPassword("");
    setError("");
  };

  const selectedUserData = users.find(u => u.id === selectedUser);
  const selectedUserHasPassword = selectedUserData?.password && selectedUserData.password.length > 0;

  return (
    <div className="h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 relative overflow-hidden">
      {/* Ambient effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      {/* Animated lines */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent animate-pulse"></div>
      </div>

      <div className="relative z-10 w-full max-w-2xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
              <TerminalIcon className="w-16 h-16 text-cyan-400" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-2 text-cyan-400">URBANSHADE</h1>
          <p className="text-sm text-cyan-600 font-mono">
            SECURE OPERATING SYSTEM v2.7
          </p>
          <div className="mt-4 text-xs text-slate-600 font-mono">
            [CLASSIFIED FACILITY] • DEPTH: 8,247m • PRESSURE: EXTREME
          </div>
        </div>

        {!selectedUser ? (
          /* User Selection */
          <div className="space-y-4">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 backdrop-blur">
              <div className="flex items-center gap-2 mb-4 text-cyan-400">
                <Lock className="w-5 h-5" />
                <span className="font-bold text-sm">SELECT USER</span>
              </div>

              <div className="space-y-3">
                {users.length === 0 ? (
                  <div className="p-6 rounded-lg bg-red-500/10 border border-red-500/30 text-center space-y-3">
                    <div className="text-red-400 font-bold">SYSTEM ERROR</div>
                    <div className="text-sm text-slate-400">
                      No user accounts found. Please reinstall the system.
                    </div>
                    <button
                      onClick={() => {
                        localStorage.removeItem("urbanshade_admin");
                        window.location.reload();
                      }}
                      className="px-4 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 text-sm hover:bg-cyan-500/30 transition-colors"
                    >
                      REINSTALL SYSTEM
                    </button>
                  </div>
                ) : (
                  <>
                    {users.map((user) => (
                      <button
                        key={user.id}
                        onClick={() => handleUserSelect(user.id)}
                        className="w-full p-4 rounded-lg bg-slate-900/50 border border-cyan-500/20 hover:border-cyan-500/50 hover:bg-slate-800/50 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors border border-cyan-500/30">
                            {user.id === admin?.id ? (
                              <Shield className="w-7 h-7 text-cyan-400" />
                            ) : (
                              <User className="w-7 h-7 text-cyan-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-lg text-white">{user.name}</div>
                            <div className="text-sm text-slate-400">{user.role}</div>
                            <div className="text-xs text-cyan-600 mt-1">Clearance Level {user.clearance}</div>
                          </div>
                          <div className="text-2xl text-slate-600 group-hover:text-cyan-400 transition-colors">›</div>
                        </div>
                      </button>
                    ))}

                    {/* Guest Login */}
                    <button
                      onClick={handleGuestLogin}
                      disabled={loading}
                      className="w-full p-4 rounded-lg bg-slate-900/30 border border-slate-600/30 hover:border-cyan-500/30 hover:bg-slate-800/30 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-slate-700/50 flex items-center justify-center group-hover:bg-slate-700 transition-colors border border-slate-600/30">
                          <UserCircle className="w-7 h-7 text-slate-400 group-hover:text-cyan-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-lg text-slate-300 group-hover:text-white">Guest</div>
                          <div className="text-sm text-slate-500">Limited access mode</div>
                          <div className="text-xs text-slate-600 mt-1">Clearance Level 1</div>
                        </div>
                        <div className="text-2xl text-slate-600 group-hover:text-cyan-400 transition-colors">›</div>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Power Options */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowShutdownOptions(true)}
                className="text-xs text-slate-500 hover:text-cyan-400 transition-colors"
              >
                Power Options
              </button>
            </div>

            <div className="text-center text-xs text-slate-600 font-mono">
              © 2025 Urbanshade Corporation
            </div>
          </div>
        ) : (
          /* Password Input */
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 space-y-6 backdrop-blur">
              {/* Selected User Info */}
              <div className="flex items-center gap-4 pb-4 border-b border-cyan-500/10">
                <div className="w-16 h-16 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                  {selectedUserData?.id === admin?.id ? (
                    <Shield className="w-8 h-8 text-cyan-400" />
                  ) : (
                    <User className="w-8 h-8 text-cyan-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-lg text-white">{selectedUserData?.name}</div>
                  <div className="text-sm text-slate-400">{selectedUserData?.role}</div>
                </div>
              </div>

              {selectedUserHasPassword ? (
                <div>
                  <label className="block text-xs text-cyan-600 mb-2 font-mono">
                    PASSWORD
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-cyan-300 font-mono text-sm focus:border-cyan-400 focus:outline-none transition-colors"
                    placeholder="Enter password"
                    disabled={loading}
                    autoFocus
                  />
                </div>
              ) : (
                <div className="text-center py-4 text-slate-400 text-sm">
                  No password required. Click login to continue.
                </div>
              )}

              {error && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                  ⚠ ERROR: {error}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg border border-slate-600/30 text-slate-300 hover:bg-slate-700/30 transition-colors disabled:opacity-50"
                >
                  BACK
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-3 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 font-bold hover:bg-cyan-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "AUTHENTICATING..." : "LOGIN"}
                </button>
              </div>
            </div>

            <div className="text-center text-xs text-slate-600 font-mono space-y-1">
              <div>© 2025 Urbanshade Corporation</div>
              <div className="text-red-500/70">⚠ UNAUTHORIZED ACCESS IS PROHIBITED</div>
            </div>
          </form>
        )}
      </div>

      {/* Shutdown Options Dialog */}
      {showShutdownOptions && (
        <ShutdownOptionsDialog
          onClose={() => setShowShutdownOptions(false)}
          onShutdown={() => onShutdown?.()}
          onSignOut={() => {}}
          onLock={() => {}}
          onRestart={() => onRestart?.()}
        />
      )}
    </div>
  );
};
