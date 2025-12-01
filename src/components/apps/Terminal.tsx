import { useState, useRef, useEffect } from "react";
import { Terminal as TerminalIcon } from "lucide-react";

interface CommandHistory {
  input: string;
  output: string;
}

interface TerminalProps {
  onCrash?: (crashType: "kernel" | "virus" | "bluescreen" | "memory" | "corruption" | "overload") => void;
}

export const Terminal = ({ onCrash }: TerminalProps = {}) => {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<CommandHistory[]>([
    { input: "", output: "URBANSHADE SECURE TERMINAL v3.2.1\nType 'help' for available commands.\n" }
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [history]);

  const commands: Record<string, string> = {
  help: `Available commands:
  help          - Show this help message
  status        - Display system status
  users         - List active users
  logs          - Show recent system logs
  network       - Network diagnostics
  processes     - List running processes
  files         - Quick file access
  security      - Security status
  pressure      - Check pressure readings
  specimens     - List contained specimens
  zones         - Show zone information
  cameras       - Security camera status
  personnel     - Personnel directory
  incidents     - Recent incident reports
  comms         - Communication channels
  power         - Power grid status
  hull          - Hull integrity check
  temperature   - Temperature readings
  backup        - Backup system status
  uptime        - System uptime
  version       - OS version info
  about         - System information
  ping          - Test network connectivity
  diagnostics   - Run system diagnostics
  emergency     - Emergency protocol info
  lockdown      - Lockdown status
  manifest      - Mission manifest
  scan          - Scan for anomalies
  whoami        - Display current user
  date          - Display current date/time
  echo          - Echo text
  history       - Show command history
  depth         - Facility depth info
  reality       - Reality check
  
  [HIDDEN COMMANDS]
  admin         - Administrator menu (Level 5)
  secret        - ???
  glitch        - ???
  crash         - System crash simulator
  
  clear         - Clear terminal`,
    
    status: `SYSTEM STATUS REPORT
━━━━━━━━━━━━━━━━━━━━━━━━━━
Status: OPERATIONAL
Uptime: 47 days, 13 hours
Core Temperature: 42°C
Pressure: 8,247 PSI (NORMAL)
Security Level: MAXIMUM`,

    users: `ACTIVE USERS
━━━━━━━━━━━━━━━━━━━━━━━━━━
[ADMIN] Aswd          - Terminal 01
[USER]  Dr_Chen       - Terminal 03
[USER]  Tech_Morgan   - Terminal 12
[USER]  Security_045  - Terminal 07`,

    logs: `RECENT SYSTEM LOGS
━━━━━━━━━━━━━━━━━━━━━━━━━━
[16:32:18] System boot successful
[16:20:45] WARNING: Pressure anomaly Zone 4
[16:18:22] User 'Dr_Chen' accessed Archive
[16:15:08] System Monitor started
[16:10:30] Failed login from terminal T-07`,

    network: `NETWORK DIAGNOSTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Main Server:     ONLINE (2ms)
Backup Server:   ONLINE (3ms)
Terminal Array:  11/12 ACTIVE
Sensor Network:  OPERATIONAL
Comms Relay:     STABLE`,

    processes: `RUNNING PROCESSES
━━━━━━━━━━━━━━━━━━━━━━━━━━
PID    NAME              CPU    MEM
001    urbcore.dll       12%    2.4GB
002    security.sys      8%     1.2GB
003    pressure_mon      15%    890MB
004    network_srv       5%     450MB
005    file_handler      3%     320MB`,

    files: `QUICK FILE ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━
/system          - Core system files
/archive         - Research archives
/user            - User directories
/logs            - System logs
Use File Explorer for detailed access`,

    security: `SECURITY STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Threat Level:    GREEN
Failed Logins:   1 (last 24h)
Active Alerts:   0
Firewall:        ACTIVE
Encryption:      AES-256 ENABLED
Last Scan:       2 minutes ago`,

    pressure: `PRESSURE READINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Zone 1:  8,245 PSI  [NORMAL]
Zone 2:  8,251 PSI  [NORMAL]
Zone 3:  8,240 PSI  [NORMAL]
Zone 4:  8,289 PSI  [WARNING]
Zone 5:  8,247 PSI  [NORMAL]
Zone 6:  8,252 PSI  [NORMAL]
Zone 7:  8,243 PSI  [NORMAL]`,

    specimens: `CONTAINED SPECIMENS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Z-13  "Pressure"      EXTREME    SECURE
Z-08  "Eyefestation"  HIGH       SECURE
Z-96  "Pandemonium"   EXTREME    SECURE
Z-90  "Wall Dweller"  MEDIUM     SECURE
Z-283 "Angler"        HIGH       SECURE

All specimens contained. Monitoring active.`,

    zones: `FACILITY ZONES
━━━━━━━━━━━━━━━━━━━━━━━━━━
Zone 1: Control Room       [OPERATIONAL]
Zone 2: Research Labs      [OPERATIONAL]
Zone 3: Server Bay         [OPERATIONAL]
Zone 4: Containment Area   [WARNING]
Zone 5: Engineering        [OPERATIONAL]
Zone 6: Medical Bay        [OPERATIONAL]
Zone 7: Storage            [OPERATIONAL]`,

    cameras: `SECURITY CAMERAS
━━━━━━━━━━━━━━━━━━━━━━━━━━
CAM-01: Main Entrance      ONLINE
CAM-02: Control Room       ONLINE
CAM-03: Research Lab A     ONLINE
CAM-04: Containment Z-13   WARNING
CAM-05: Server Bay         ONLINE
CAM-07: Terminal T-07      OFFLINE
CAM-08: Medical Bay        ONLINE
CAM-09: Engineering        ONLINE

7/9 cameras operational`,

    personnel: `PERSONNEL ON DUTY
━━━━━━━━━━━━━━━━━━━━━━━━━━
Aswd              ADMIN      Level-5
Dr. Chen          RESEARCH   Level-4
Tech Morgan       ENGINEER   Level-3
Officer Blake     SECURITY   Level-3
Dr. Martinez      MEDICAL    Level-4

5 personnel currently active`,

    incidents: `RECENT INCIDENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━
INC-2024-047  CRITICAL  Pressure Anomaly Zone 4
INC-2024-046  HIGH      Unauthorized Access T-07
INC-2024-045  MEDIUM    Power Fluctuation
INC-2024-044  LOW       Temperature Spike

2 incidents under investigation`,

    comms: `COMMUNICATION CHANNELS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Emergency Freq:    CH-01   CLEAR
Operations:        CH-02   CLEAR
Research Division: CH-03   CLEAR
Engineering:       CH-04   CLEAR
Security:          CH-05   CLEAR

All channels operational`,

    power: `POWER GRID STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Primary Reactor:   98% capacity
Backup Generator:  STANDBY
Emergency Power:   READY
Grid Load:         67%
Battery Reserve:   100%

All systems nominal`,

    hull: `HULL INTEGRITY CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━
Overall Integrity: 98.7%
Section A:         99.2%
Section B:         98.4%
Section C:         98.9%
Critical Points:   ALL SECURE

Hull status: NOMINAL`,

    temperature: `TEMPERATURE READINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Control Room:    4.2°C  [NORMAL]
Research Labs:   4.0°C  [NORMAL]
Server Bay:      4.5°C  [NORMAL]
Containment:     4.1°C  [NORMAL]
Engineering:     4.3°C  [NORMAL]
Medical Bay:     4.0°C  [NORMAL]

All zones within tolerance`,

    backup: `BACKUP SYSTEM STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Last Backup:       2 hours ago
Next Scheduled:    02:00 tomorrow
Data Integrity:    100%
Storage Used:      67%
Backup Location:   Secure vault

All backups current`,

    uptime: `SYSTEM UPTIME
━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Uptime:    47 days, 13 hours
Last Boot:         2024-01-28 08:00
Avg. Uptime:       99.7%
Total Reboots:     3 (this year)

System stability: EXCELLENT`,

    version: `VERSION INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━
OS Version:        3.2.1
Build:             8247
Kernel:            URBCORE v5.8.2
Architecture:      x64
Last Updated:      2024-03-10

System is up to date`,

    about: `URBANSHADE OPERATING SYSTEM
━━━━━━━━━━━━━━━━━━━━━━━━━━
Version:     3.2.1 (Build 8247)
Architecture: 64-bit
Kernel:      URBCORE v5.8.2
Location:    [CLASSIFIED]
Depth:       [CLASSIFIED]
Pressure:    8,247 PSI
Temperature: 4°C

© 2024 Urbanshade Corporation`,

    ping: `PING 10.0.0.1 (Main Server)
━━━━━━━━━━━━━━━━━━━━━━━━━━
64 bytes from 10.0.0.1: icmp_seq=1 ttl=64 time=2ms
64 bytes from 10.0.0.1: icmp_seq=2 ttl=64 time=2ms
64 bytes from 10.0.0.1: icmp_seq=3 ttl=64 time=3ms
64 bytes from 10.0.0.1: icmp_seq=4 ttl=64 time=2ms

--- 10.0.0.1 ping statistics ---
4 packets transmitted, 4 received, 0% packet loss
rtt min/avg/max = 2/2.25/3 ms`,

    diagnostics: `RUNNING FULL SYSTEM DIAGNOSTICS
━━━━━━━━━━━━━━━━━━━━━━━━━━
[✓] Core systems        PASS
[✓] Network             PASS
[✓] Security            PASS
[!] Pressure sensors    WARNING
[✓] Temperature         PASS
[✓] Power grid          PASS
[✓] Hull integrity      PASS
[✓] Backup systems      PASS

Overall Status: 7/8 tests passed
Zone 4 pressure anomaly detected`,

    emergency: `EMERGENCY PROTOCOLS
━━━━━━━━━━━━━━━━━━━━━━━━━━
EP-01: Hull Breach      Type 'activate EP-01'
EP-02: Fire             Type 'activate EP-02'
EP-03: Containment      Type 'activate EP-03'
EP-04: Power Failure    Type 'activate EP-04'
EP-05: Evacuation       Type 'activate EP-05'

Current Alert Level: GREEN
No emergency protocols active`,

    lockdown: `LOCKDOWN STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━
Facility Status:    NORMAL
Security Level:     MAXIMUM
Access Control:     ACTIVE
Emergency Seals:    ARMED
Containment Doors:  SECURE

Zone 4: PARTIAL LOCKDOWN
Reason: Pressure anomaly investigation`,

    manifest: `MISSION MANIFEST - CLASSIFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━
Mission ID:      UR-8247-DELTA
Start Date:      [REDACTED]
Objective:       Deep sea specimen research
Personnel:       12 (5 active)
Specimens:       5 contained
Status:          IN PROGRESS

Access Level 5 required for full details`,

    scan: `SCANNING FOR ANOMALIES
━━━━━━━━━━━━━━━━━━━━━━━━━━
Scanning Zone 1... Clear
Scanning Zone 2... Clear
Scanning Zone 3... Clear
Scanning Zone 4... [ANOMALY DETECTED]
Scanning Zone 5... Clear
Scanning Zone 6... Clear
Scanning Zone 7... Clear

1 anomaly detected in Zone 4
Recommend investigation`,

    whoami: `CURRENT USER INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━
Username:        aswd
Access Level:    ADMINISTRATOR (Level 5)
Session Start:   ${new Date().toLocaleString()}
Terminal:        TERMINAL-01
Location:        Control Room
Privileges:      FULL ACCESS`,

    date: `SYSTEM DATE/TIME
━━━━━━━━━━━━━━━━━━━━━━━━━━
Local Time:      ${new Date().toLocaleString()}
UTC Time:        ${new Date().toUTCString()}
Timezone:        UTC+0
System Uptime:   47 days, 13 hours`,

    echo: `ECHO - Echo back text
━━━━━━━━━━━━━━━━━━━━━━━━━━
Usage: echo [text]
Example: echo Hello World

Note: This is a demonstration.
Full echo functionality requires parameters.`,

  secret: `ADMIN PANEL ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━

Opening admin control panel...

[LEVEL 5 CLEARANCE VERIFIED]

Welcome, Administrator.`,

  glitch: `█▀▀ █░░ █ ▀█▀ █▀▀ █░█
█▄█ █▄▄ █ ░█░ █▄▄ █▀█

[SYSTEM ERROR]
[REALITY.DLL NOT FOUND]
[PERCEPTION.EXE HAS STOPPED RESPONDING]

S̴̢͖̈́Ỹ̶̘S̷͓̈́T̶̰̒E̶̹͝M̷͍̽ ̶̰̓C̶͙̔Ò̷̜R̵̰̆R̴͓̅U̸̦͝P̸̝͝T̷͖̏I̴̗͠O̶̬̓N̶̰̆ ̷̝̓D̷̰̈́E̸̖͝T̶̡̾E̷̻͒C̷̰̈T̷̰́E̶̱͝D̶͚̑

Press any key to wake up...
Just kidding. You're already awake.
Or are you?`,

  history: `COMMAND HISTORY
━━━━━━━━━━━━━━━━━━━━━━━━━━
1. status
2. help
3. logs
4. network
5. whoami
6. files
7. processes
8. security
9. pressure
10. specimens

Type 'clear' to clear history`,

  admin: `ADMINISTRATOR COMMANDS
━━━━━━━━━━━━━━━━━━━━━━━━━━
These commands require Level 5 clearance.

Available commands:
- syscontrol     System control panel
- deepdive       Access deep system logs
- override       Override security protocols
- blackbox       Access classified archives
- godmode        [REDACTED]

Current user clearance: LEVEL 5
Access: GRANTED

Use these commands responsibly.`,

  syscontrol: `SYSTEM CONTROL PANEL
━━━━━━━━━━━━━━━━━━━━━━━━━━
[ADMIN ACCESS REQUIRED]

Core Systems:
  Power Grid:        ONLINE
  Life Support:      OPERATIONAL
  Containment:       SECURE
  Communications:    ACTIVE

Emergency Controls:
  Lockdown:          READY
  Evacuation:        STANDBY
  Self-Destruct:     [DISABLED]

All systems under your control.`,

  deepdive: `DEEP SYSTEM LOGS - CLASSIFIED
━━━━━━━━━━━━━━━━━━━━━━━━━━
[03:47:18] [DELETED] Message from Dr. Chen
[03:12:55] [ALERT] Unusual acoustic pattern detected
[02:44:22] [WARNING] Specimen Z-13 containment stress
[02:15:08] [INFO] Director Morrison accessed ██████
[01:58:33] [CRITICAL] ████████ PROTOCOL ACTIVATED
[01:22:10] [ERROR] Camera feed corruption in Zone 4
[00:45:18] [WARNING] Pressure reading anomaly
[00:12:05] [INFO] Night shift personnel count: 3

Type 'blackbox' for archived classified data`,

  blackbox: `CLASSIFIED ARCHIVES ACCESS
━━━━━━━━━━━━━━━━━━━━━━━━━━
[LEVEL 5 CLEARANCE VERIFIED]

PROJECT BLACKBOX
Mission: ██████████████
Status: IN PROGRESS
Depth: ████ meters
Specimens: █ contained, █ pending
Personnel: ██ total, █ active

Warning: Some information has been
redacted for operational security.

"It was never about the fish."
- Director Morrison, 2023

Access log: Recorded`,

  godmode: `
🔓 GODMODE ACTIVATED
━━━━━━━━━━━━━━━━━━━━━━━━━━

You have discovered the hidden command.

Congratulations, Administrator.

Reality is what we make it.
Truth is what we decide.
The facility runs on more than power.

But you already knew that, didn't you?

Type 'help' to return to normal operations.
Or don't.

It doesn't really matter anymore.

[CONNECTION TO REALITY: STABLE]
`,

  depth: `FACILITY DEPTH INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━
Current Depth:    [CLASSIFIED] meters
Surface Distance: [CLASSIFIED] km
Water Pressure:   8,247 PSI
Ocean Floor:      Below us
Trench Bottom:    ████ meters deeper

You are very, very far down.
Nothing but darkness below.
Nothing but water above.

Welcome to the abyss.`,

  reality: `REALITY CHECK
━━━━━━━━━━━━━━━━━━━━━━━━━━
Running reality verification...

✓ Gravity: NORMAL
✓ Time: LINEAR
✓ Physics: CONSISTENT
✗ Perception: ████████
✗ Memory: INCONSISTENT
✓ Consciousness: PROBABLY

Status: You are probably real.
Probably.

Type 'help' if you feel uncertain.`,

  crash: `SYSTEM CRASH SIMULATOR
━━━━━━━━━━━━━━━━━━━━━━━━━━
Available crash types:

  crash kernel      - Kernel panic
  crash bluescreen  - Blue screen of death
  crash memory      - Memory corruption
  crash corruption  - File system corruption
  crash overload    - System overload
  crash virus       - Malware infection

⚠ WARNING: These will trigger actual system crashes!
Use for testing purposes only.`
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = input.trim().toLowerCase();
    
    let output = "";
    if (cmd === "clear") {
      setHistory([{ input: "", output: "URBANSHADE SECURE TERMINAL v3.2.1\nType 'help' for available commands.\n" }]);
      setInput("");
      return;
    } else if (cmd === "") {
      output = "";
    } else if (cmd === "secret") {
      output = commands.secret;
      setHistory(prev => [...prev, { input: cmd, output }]);
      setInput("");
      setTimeout(() => {
        window.open('/admin', '_blank');
      }, 1000);
      return;
    } else if (cmd.startsWith("crash ")) {
      const crashType = cmd.replace("crash ", "").trim();
      const validTypes = ["kernel", "bluescreen", "memory", "corruption", "overload", "virus"];
      
      if (validTypes.includes(crashType)) {
        output = `Initiating ${crashType} crash sequence...\n\n⚠ SYSTEM WILL CRASH IN 3 SECONDS ⚠`;
        setHistory(prev => [...prev, { input: cmd, output }]);
        setInput("");
        
        setTimeout(() => {
          onCrash?.(crashType as any);
        }, 3000);
        return;
      } else {
        output = `Invalid crash type. Type 'crash' to see available types.`;
      }
    } else if (commands[cmd]) {
      output = commands[cmd];
    } else {
      output = `Command not found: ${cmd}\nType 'help' for available commands.`;
    }

    setHistory(prev => [...prev, { input: cmd, output }]);
    setInput("");
  };

  return (
    <div className="flex flex-col h-full bg-black/40 font-mono text-sm">
      {/* Header */}
      <div className="px-4 py-2 border-b border-primary/20 bg-black/60 flex items-center gap-2">
        <TerminalIcon className="w-4 h-4 text-primary" />
        <span className="text-primary font-bold">TERMINAL</span>
      </div>

      {/* Terminal Output */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-2"
        onClick={() => inputRef.current?.focus()}
      >
        {history.map((item, idx) => (
          <div key={idx}>
            {item.input && (
              <div className="flex gap-2 text-primary">
                <span>$</span>
                <span>{item.input}</span>
              </div>
            )}
            {item.output && (
              <pre className="text-foreground whitespace-pre-wrap mt-1 mb-3">
                {item.output}
              </pre>
            )}
          </div>
        ))}

        {/* Current Input Line */}
        <form onSubmit={handleSubmit} className="flex gap-2 text-primary">
          <span>$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-transparent outline-none text-primary"
            autoFocus
            spellCheck={false}
          />
        </form>
      </div>
    </div>
  );
};
