import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Waves, Shield, Globe, Keyboard, Wifi, User, Lock, Eye, EyeOff, Settings, Check, ChevronRight, Terminal, Cloud, Monitor, HelpCircle, Mail, RefreshCw, Download, Loader2 } from "lucide-react";
import { useOnlineAccount } from "@/hooks/useOnlineAccount";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface OOBEScreenProps {
  onComplete: () => void;
}

export const OOBEScreen = ({ onComplete }: OOBEScreenProps) => {
  const [step, setStep] = useState<"welcome" | "region" | "keyboard" | "network" | "online-choice" | "online-signup" | "email-verify" | "online-signin" | "import-settings" | "account" | "password" | "privacy" | "finish">("welcome");
  const [progress, setProgress] = useState(0);
  
  // Region & Keyboard
  const [region, setRegion] = useState("Deep Sea Sector Alpha");
  const [keyboardLayout, setKeyboardLayout] = useState("US QWERTY");
  
  // Account (local)
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [accountError, setAccountError] = useState("");
  
  // Online account
  const [email, setEmail] = useState("");
  const [onlinePassword, setOnlinePassword] = useState("");
  const [onlineUsername, setOnlineUsername] = useState("");
  const [onlineError, setOnlineError] = useState("");
  const [isOnlineLoading, setIsOnlineLoading] = useState(false);
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [hasCloudSettings, setHasCloudSettings] = useState(false);
  const [isLoadingCloudSettings, setIsLoadingCloudSettings] = useState(false);
  const { signUp, signIn, isDevMode, loadCloudSettings, checkForConflict } = useOnlineAccount();
  
  // Privacy
  const [telemetry, setTelemetry] = useState(true);
  const [locationServices, setLocationServices] = useState(false);
  const [crashReports, setCrashReports] = useState(true);

  // Finishing animation
  const [finishProgress, setFinishProgress] = useState(0);
  const [finishMessages, setFinishMessages] = useState<string[]>([]);

  const regions = [
    "Deep Sea Sector Alpha",
    "Abyssal Zone Beta",
    "Trench Division Gamma",
    "Hadal Research Station",
    "Benthic Outpost Delta",
    "Twilight Zone Epsilon"
  ];

  const keyboards = [
    "US QWERTY",
    "UK QWERTY",
    "German QWERTZ",
    "French AZERTY",
    "Japanese Kana"
  ];

  const stepIndex = ["welcome", "region", "keyboard", "network", "online-choice", "online-signup", "email-verify", "online-signin", "import-settings", "account", "password", "privacy", "finish"].indexOf(step);

  useEffect(() => {
    setProgress((stepIndex / 12) * 100);
  }, [stepIndex]);

  useEffect(() => {
    if (step === "finish") {
      const messages = [
        "Initializing user profile...",
        "Configuring security protocols...",
        "Setting up containment permissions...",
        "Syncing regional settings...",
        "Calibrating depth sensors...",
        "Establishing secure connection...",
        "Finalizing system preferences...",
        "Setup complete!"
      ];
      
      let msgIndex = 0;
      const interval = setInterval(() => {
        if (msgIndex < messages.length) {
          setFinishMessages(prev => [...prev, messages[msgIndex]]);
          setFinishProgress(((msgIndex + 1) / messages.length) * 100);
          msgIndex++;
        } else {
          clearInterval(interval);
        }
      }, 400);
      
      return () => clearInterval(interval);
    }
  }, [step]);

  const handleAccountNext = () => {
    setAccountError("");
    if (!username.trim()) {
      setAccountError("Please enter a username");
      return;
    }
    if (username.trim().length < 3) {
      setAccountError("Username must be at least 3 characters");
      return;
    }
    setStep("password");
  };

  const handlePasswordNext = () => {
    setAccountError("");
    
    // Password is optional - allow empty passwords
    if (password && password.length < 4) {
      setAccountError("Password must be at least 4 characters or empty");
      return;
    }
    
    if (password !== confirmPassword) {
      setAccountError("Passwords don't match");
      return;
    }
    
    // Save account
    const accounts = JSON.parse(localStorage.getItem("urbanshade_accounts") || "[]");
    const newAccount = {
      id: Date.now().toString(),
      username: username.trim(),
      password: password, // Can be empty
      name: username.trim(),
      role: "Operator",
      clearance: 3,
      avatar: null,
      createdAt: new Date().toISOString()
    };
    accounts.push(newAccount);
    localStorage.setItem("urbanshade_accounts", JSON.stringify(accounts));
    
    setStep("privacy");
  };

  const handleOnlineSignup = async () => {
    setOnlineError("");
    
    if (!email.trim() || !email.includes("@")) {
      setOnlineError("Please enter a valid email address");
      return;
    }
    if (!onlineUsername.trim() || onlineUsername.length < 3) {
      setOnlineError("Username must be at least 3 characters");
      return;
    }
    if (!onlinePassword || onlinePassword.length < 6) {
      setOnlineError("Password must be at least 6 characters");
      return;
    }

    setIsOnlineLoading(true);
    
    const { error } = await signUp(email, onlinePassword, onlineUsername);
    
    setIsOnlineLoading(false);

    if (error) {
      setOnlineError(error.message);
      return;
    }

    // Set username for local account too
    setUsername(onlineUsername);
    setPassword("");
    
    // Save local account with online link
    const accounts = JSON.parse(localStorage.getItem("urbanshade_accounts") || "[]");
    const newAccount = {
      id: Date.now().toString(),
      username: onlineUsername.trim(),
      password: "",
      name: onlineUsername.trim(),
      role: "Operator",
      clearance: 3,
      avatar: null,
      isOnline: true,
      email: email,
      createdAt: new Date().toISOString()
    };
    accounts.push(newAccount);
    localStorage.setItem("urbanshade_accounts", JSON.stringify(accounts));
    
    toast.success("Online account created! Check your email to confirm.");
    setStep("email-verify");
  };

  // Check email verification status
  const checkEmailVerification = async () => {
    setIsCheckingVerification(true);
    setOnlineError("");
    
    try {
      const { data, error } = await signIn(email, onlinePassword);
      
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setOnlineError("Email not yet verified. Please check your inbox and spam folder.");
        } else {
          setOnlineError(error.message);
        }
        setIsCheckingVerification(false);
        return;
      }
      
      // Success - email was verified
      const displayName = data.user?.user_metadata?.username || onlineUsername || email.split("@")[0];
      setUsername(displayName);
      
      // Save local account with online link
      const accounts = JSON.parse(localStorage.getItem("urbanshade_accounts") || "[]");
      const newAccount = {
        id: Date.now().toString(),
        username: displayName,
        password: "",
        name: displayName,
        role: "Operator",
        clearance: 3,
        avatar: null,
        isOnline: true,
        email: email,
        createdAt: new Date().toISOString()
      };
      accounts.push(newAccount);
      localStorage.setItem("urbanshade_accounts", JSON.stringify(accounts));
      
      toast.success("Email verified! Account ready.");
      setStep("privacy");
    } catch (err) {
      setOnlineError("Verification check failed. Try again.");
    }
    
    setIsCheckingVerification(false);
  };

  const handleOnlineSignin = async () => {
    setOnlineError("");
    
    if (!email.trim() || !email.includes("@")) {
      setOnlineError("Please enter a valid email address");
      return;
    }
    if (!onlinePassword) {
      setOnlineError("Please enter your password");
      return;
    }

    setIsOnlineLoading(true);
    
    const { data, error } = await signIn(email, onlinePassword);
    
    setIsOnlineLoading(false);

    if (error) {
      setOnlineError(error.message);
      return;
    }

    // Get username from profile or email
    const displayName = data.user?.user_metadata?.username || email.split("@")[0];
    setUsername(displayName);
    
    // Save local account with online link
    const accounts = JSON.parse(localStorage.getItem("urbanshade_accounts") || "[]");
    const existingOnline = accounts.find((a: any) => a.email === email);
    if (!existingOnline) {
      const newAccount = {
        id: Date.now().toString(),
        username: displayName,
        password: "",
        name: displayName,
        role: "Operator",
        clearance: 3,
        avatar: null,
        isOnline: true,
        email: email,
        createdAt: new Date().toISOString()
      };
      accounts.push(newAccount);
      localStorage.setItem("urbanshade_accounts", JSON.stringify(accounts));
    }
    
    // Check if there are cloud settings to import
    const conflict = await checkForConflict();
    if (conflict?.cloudSettings) {
      setHasCloudSettings(true);
      setStep("import-settings");
    } else {
      toast.success("Signed in successfully!");
      setStep("privacy");
    }
  };

  const handleImportCloudSettings = async () => {
    setIsLoadingCloudSettings(true);
    await loadCloudSettings();
    setIsLoadingCloudSettings(false);
    toast.success("Settings imported from cloud!");
    setStep("privacy");
  };

  const handleSkipImport = () => {
    toast.success("Signed in successfully!");
    setStep("privacy");
  };

  const handleComplete = () => {
    localStorage.setItem("urbanshade_oobe_complete", "true");
    localStorage.setItem("urbanshade_settings", JSON.stringify({
      region,
      keyboardLayout,
      telemetry,
      locationServices,
      crashReports,
      theme: "dark",
      animations: true
    }));
    
    toast.success("Welcome to UrbanShade OS");
    onComplete();
  };

  const ToggleSwitch = ({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) => (
    <button
      onClick={onToggle}
      className={`w-12 h-6 rounded-full transition-all duration-200 ${enabled ? 'bg-cyan-500' : 'bg-slate-600'}`}
    >
      <div className={`w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 text-white flex flex-col overflow-hidden">
      {/* Ambient effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="h-12 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 border-b border-cyan-500/20">
        <div className="flex items-center gap-3">
          <Waves className="w-5 h-5 text-cyan-400" />
          <span className="text-cyan-400 font-bold text-sm tracking-wider">URBANSHADE SETUP</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-cyan-600">
          <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>OOBE v2.2.0</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-slate-800">
        <div 
          className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl relative z-10">
          
          {/* Welcome */}
          {step === "welcome" && (
            <div className="animate-fade-in text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Shield className="w-12 h-12 text-cyan-400" />
              </div>
              <h1 className="text-4xl font-bold text-cyan-400 mb-3">Welcome to UrbanShade</h1>
              <p className="text-cyan-600 mb-8">Let's get your terminal set up</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 mb-8 text-left">
                <p className="text-slate-300 text-sm mb-4">
                  This setup wizard will guide you through configuring your UrbanShade workstation for optimal facility operations.
                </p>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Regional & input settings
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Network configuration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Account creation
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    Privacy preferences
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setStep("region")}
                className="px-8 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg font-bold text-cyan-400 transition-all"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Region */}
          {step === "region" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Globe className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-cyan-400">Select Your Region</h1>
              </div>
              <p className="text-cyan-600 text-sm mb-6">Choose your facility sector</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden mb-6">
                {regions.map((r) => (
                  <button
                    key={r}
                    onClick={() => setRegion(r)}
                    className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between ${
                      region === r 
                        ? "bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-400" 
                        : "text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    <span>{r}</span>
                    {region === r && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("welcome")}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("keyboard")}
                  className="px-8 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold transition-all flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Keyboard */}
          {step === "keyboard" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Keyboard className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-cyan-400">Keyboard Layout</h1>
              </div>
              <p className="text-cyan-600 text-sm mb-6">Select your input configuration</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg overflow-hidden mb-6">
                {keyboards.map((k) => (
                  <button
                    key={k}
                    onClick={() => setKeyboardLayout(k)}
                    className={`w-full px-4 py-3 text-left transition-all flex items-center justify-between ${
                      keyboardLayout === k 
                        ? "bg-cyan-500/20 text-cyan-300 border-l-2 border-cyan-400" 
                        : "text-slate-300 hover:bg-slate-700/50"
                    }`}
                  >
                    <span>{k}</span>
                    {keyboardLayout === k && <Check className="w-4 h-4 text-cyan-400" />}
                  </button>
                ))}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("region")}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("network")}
                  className="px-8 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold transition-all flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Network */}
          {step === "network" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Wifi className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-cyan-400">Network Connection</h1>
              </div>
              <p className="text-cyan-600 text-sm mb-6">Connect to facility network</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4 mb-6 space-y-3">
                <div className="flex items-center justify-between py-3 px-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Wifi className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <div className="text-cyan-300 font-bold">URBANSHADE-SECURE</div>
                      <div className="text-xs text-cyan-600">Encrypted • 2.4/5GHz</div>
                    </div>
                  </div>
                  <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded">Connected</span>
                </div>
                
                <div className="flex items-center justify-between py-3 px-4 opacity-50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
                      <Wifi className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-slate-400">FACILITY-GUEST</div>
                      <div className="text-xs text-slate-600">Secured</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("keyboard")}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => isDevMode ? setStep("account") : setStep("online-choice")}
                  className="px-8 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold transition-all flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Online Account Choice - Only shown if not in Dev Mode */}
          {step === "online-choice" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Cloud className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-cyan-400">Connect Your Account</h1>
              </div>
              <p className="text-cyan-600 text-sm mb-6">Would you like to use an online account?</p>
              
              <div className="space-y-4 mb-6">
                {/* Online Account Option */}
                <button
                  onClick={() => setStep("online-signup")}
                  className="w-full p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl text-left transition-all hover:border-cyan-400 hover:bg-cyan-500/20 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <Cloud className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-cyan-300 font-bold text-lg mb-1">Use Online Account</div>
                      <div className="text-slate-400 text-sm mb-2">Sync your settings across devices. Sign in anywhere.</div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">Cloud Sync</span>
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">Backup</span>
                        <span className="text-xs bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded">Multi-device</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-cyan-600 group-hover:text-cyan-400 transition-colors" />
                  </div>
                </button>

                {/* Already have account */}
                <button
                  onClick={() => setStep("online-signin")}
                  className="w-full p-4 bg-slate-800/50 border border-slate-600/30 rounded-lg text-left transition-all hover:border-cyan-500/30 hover:bg-slate-800 text-sm"
                >
                  <span className="text-slate-400">Already have an account? </span>
                  <span className="text-cyan-400 font-semibold">Sign in</span>
                </button>

                {/* Local Account Option */}
                <button
                  onClick={() => setStep("account")}
                  className="w-full p-6 bg-slate-800/50 border border-slate-600/30 rounded-xl text-left transition-all hover:border-slate-500 group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center shrink-0">
                      <Monitor className="w-6 h-6 text-slate-400" />
                    </div>
                    <div className="flex-1">
                      <div className="text-slate-300 font-bold text-lg mb-1">Use Local Account</div>
                      <div className="text-slate-500 text-sm mb-2">Stay offline. Your data remains on this device only.</div>
                      <div className="flex gap-2 flex-wrap">
                        <span className="text-xs bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded">Offline</span>
                        <span className="text-xs bg-slate-700/50 text-slate-400 px-2 py-0.5 rounded">Private</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-slate-400 transition-colors" />
                  </div>
                </button>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("network")}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
              </div>
            </div>
          )}

          {/* Online Signup */}
          {step === "online-signup" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Cloud className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-cyan-400">Create Online Account</h1>
              </div>
              <p className="text-cyan-600 text-sm mb-6">Sign up for cloud sync</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 mb-6 space-y-4">
                <div>
                  <label className="block text-xs text-cyan-600 mb-2 font-mono">USERNAME</label>
                  <input
                    type="text"
                    value={onlineUsername}
                    onChange={(e) => setOnlineUsername(e.target.value)}
                    placeholder="Choose a username"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-cyan-600 mb-2 font-mono">EMAIL</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-xs text-cyan-600 mb-2 font-mono">PASSWORD</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={onlinePassword}
                    onChange={(e) => setOnlinePassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-slate-500 hover:text-cyan-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {onlineError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {onlineError}
                  </div>
                )}

                <p className="text-xs text-slate-500">
                  ⚠️ Note: You may need to confirm your email before signing in.
                </p>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("online-choice")}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleOnlineSignup}
                  disabled={isOnlineLoading}
                  className="px-8 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isOnlineLoading ? "Creating..." : "Create Account"} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Email Verification Step */}
          {step === "email-verify" && (
            <div className="animate-fade-in text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Mail className="w-10 h-10 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-cyan-400 mb-2">Check Your Email</h1>
              <p className="text-cyan-600 text-sm mb-6">We sent a verification link to <span className="text-cyan-400">{email}</span></p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 mb-6 text-left space-y-4">
                <p className="text-slate-300 text-sm">
                  Click the link in your email to verify your account, then click "I've Verified" below.
                </p>
                
                {onlineError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {onlineError}
                  </div>
                )}
                
                <button
                  onClick={checkEmailVerification}
                  disabled={isCheckingVerification}
                  className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isCheckingVerification ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  {isCheckingVerification ? "Checking..." : "I've Verified My Email"}
                </button>
                
                <p className="text-xs text-slate-500 text-center">
                  Didn't receive it? Check your spam folder or wait a moment and try again.
                </p>
              </div>

              <button
                onClick={() => setStep("online-signup")}
                className="text-slate-400 hover:text-white transition-colors text-sm"
              >
                ← Back to signup
              </button>
            </div>
          )}

          {/* Import Settings Step */}
          {step === "import-settings" && (
            <div className="animate-fade-in text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Download className="w-10 h-10 text-cyan-400" />
              </div>
              <h1 className="text-2xl font-bold text-cyan-400 mb-2">Import Your Settings?</h1>
              <p className="text-cyan-600 text-sm mb-6">We found settings from your cloud account</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 mb-6 space-y-4">
                <p className="text-slate-300 text-sm text-left">
                  Your online account has saved settings including desktop icons, installed apps, and theme preferences.
                </p>
                
                <button
                  onClick={handleImportCloudSettings}
                  disabled={isLoadingCloudSettings}
                  className="w-full py-3 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLoadingCloudSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  {isLoadingCloudSettings ? "Importing..." : "Import Cloud Settings"}
                </button>
                
                <button
                  onClick={handleSkipImport}
                  className="w-full py-2 text-slate-400 hover:text-white transition-colors text-sm"
                >
                  Start Fresh Instead
                </button>
              </div>
            </div>
          )}

          {/* Online Signin */}
          {step === "online-signin" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Cloud className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-cyan-400">Sign In</h1>
              </div>
              <p className="text-cyan-600 text-sm mb-6">Sign in to your online account</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 mb-6 space-y-4">
                <div>
                  <label className="block text-xs text-cyan-600 mb-2 font-mono">EMAIL</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>
                
                <div className="relative">
                  <label className="block text-xs text-cyan-600 mb-2 font-mono">PASSWORD</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={onlinePassword}
                    onChange={(e) => setOnlinePassword(e.target.value)}
                    placeholder="Your password"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-slate-500 hover:text-cyan-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                {onlineError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {onlineError}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("online-choice")}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleOnlineSignin}
                  disabled={isOnlineLoading}
                  className="px-8 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isOnlineLoading ? "Signing in..." : "Sign In"} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Account */}
          {step === "account" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <User className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-cyan-400">Create Your Account</h1>
              </div>
              <p className="text-cyan-600 text-sm mb-6">Enter your operator name</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 mb-6 space-y-4">
                <div>
                  <label className="block text-xs text-cyan-600 mb-2 font-mono">USERNAME</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter username"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                    autoFocus
                  />
                </div>
                
                {accountError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {accountError}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => isDevMode ? setStep("network") : setStep("online-choice")}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleAccountNext}
                  className="px-8 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold transition-all flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Password */}
          {step === "password" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Lock className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-cyan-400">Set Password</h1>
              </div>
              <p className="text-cyan-600 text-sm mb-6">Secure your account (optional)</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-6 mb-6 space-y-4">
                <div className="relative">
                  <label className="block text-xs text-cyan-600 mb-2 font-mono">PASSWORD</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password (or leave empty)"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-8 text-slate-500 hover:text-cyan-400"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                
                <div>
                  <label className="block text-xs text-cyan-600 mb-2 font-mono">CONFIRM PASSWORD</label>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm password"
                    className="w-full px-4 py-3 bg-slate-900/50 border border-cyan-500/30 rounded-lg text-cyan-300 placeholder-slate-500 focus:border-cyan-400 focus:outline-none transition-colors"
                  />
                </div>

                <p className="text-xs text-slate-500">Leave empty for no password (not recommended)</p>
                
                {accountError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {accountError}
                  </div>
                )}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("account")}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePasswordNext}
                  className="px-8 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold transition-all flex items-center gap-2"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Privacy */}
          {step === "privacy" && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <Settings className="w-6 h-6 text-cyan-400" />
                <h1 className="text-2xl font-bold text-cyan-400">Privacy Settings</h1>
              </div>
              <p className="text-cyan-600 text-sm mb-6">Configure data preferences</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg divide-y divide-cyan-500/10 mb-6">
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-cyan-300 font-bold text-sm">System Telemetry</div>
                    <div className="text-xs text-slate-500">Help improve UrbanShade</div>
                  </div>
                  <ToggleSwitch enabled={telemetry} onToggle={() => setTelemetry(!telemetry)} />
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-cyan-300 font-bold text-sm">Location Services</div>
                    <div className="text-xs text-slate-500">Enable depth tracking</div>
                  </div>
                  <ToggleSwitch enabled={locationServices} onToggle={() => setLocationServices(!locationServices)} />
                </div>
                
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <div className="text-cyan-300 font-bold text-sm">Crash Reports</div>
                    <div className="text-xs text-slate-500">Send diagnostic data</div>
                  </div>
                  <ToggleSwitch enabled={crashReports} onToggle={() => setCrashReports(!crashReports)} />
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setStep("password")}
                  className="px-6 py-2 text-slate-400 hover:text-white transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("finish")}
                  className="px-8 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/30 rounded-lg text-cyan-400 font-bold transition-all flex items-center gap-2"
                >
                  Finish Setup <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Finish */}
          {step === "finish" && (
            <div className="animate-fade-in text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Terminal className="w-12 h-12 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-bold text-cyan-400 mb-2">Welcome, {username}</h1>
              <p className="text-cyan-600 mb-8">Configuring your workstation...</p>
              
              <div className="bg-slate-800/50 border border-cyan-500/20 rounded-lg p-4 mb-6 text-left font-mono text-xs max-h-48 overflow-y-auto">
              {finishMessages.filter(Boolean).map((msg, i) => (
                  <div key={i} className="flex items-center gap-2 py-1">
                    <span className="text-cyan-600">&gt;</span>
                    <span className={msg?.includes("complete") ? "text-green-400" : "text-cyan-300"}>{msg}</span>
                  </div>
                ))}
                {finishProgress < 100 && <span className="text-cyan-400 animate-pulse">█</span>}
              </div>

              <div className="mb-6">
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
                    style={{ width: `${finishProgress}%` }}
                  />
                </div>
              </div>

              {finishProgress >= 100 && (
                <button
                  onClick={handleComplete}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 rounded-lg font-bold text-slate-900 transition-all animate-fade-in"
                >
                  Enter UrbanShade
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="h-10 bg-slate-900/80 backdrop-blur flex items-center justify-between px-6 text-xs text-slate-600 border-t border-cyan-500/20">
        <span>Depth: 8,247m • Pressure: 824 atm</span>
        <span>© 2024 UrbanShade Corporation</span>
      </div>
    </div>
  );
};
