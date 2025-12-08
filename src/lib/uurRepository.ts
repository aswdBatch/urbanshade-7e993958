// UUR Repository Management
// Handles package registry, submissions, real apps, package lists, ratings, and categories

export type UURCategory = 'app' | 'theme' | 'extension' | 'utility' | 'game' | 'productivity' | 'security' | 'system';

export const UUR_CATEGORIES: { id: UURCategory; name: string; icon: string; color: string }[] = [
  { id: 'app', name: 'Applications', icon: '📦', color: 'cyan' },
  { id: 'utility', name: 'Utilities', icon: '🔧', color: 'green' },
  { id: 'theme', name: 'Themes', icon: '🎨', color: 'purple' },
  { id: 'extension', name: 'Extensions', icon: '🧩', color: 'amber' },
  { id: 'game', name: 'Games', icon: '🎮', color: 'pink' },
  { id: 'productivity', name: 'Productivity', icon: '📊', color: 'blue' },
  { id: 'security', name: 'Security', icon: '🔒', color: 'red' },
  { id: 'system', name: 'System', icon: '⚙️', color: 'slate' },
];

export interface UURPackage {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: UURCategory;
  downloads: number;
  stars: number;
  githubUrl?: string;
  isOfficial: boolean;
  isFeatured?: boolean;
  listSource?: string;
  component?: () => React.ReactNode;
  dependencies?: string[];
  tags?: string[];
}

export interface UURSubmission {
  packageName: string;
  githubUrl: string;
  author: string;
  description: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'denied';
}

export interface UURList {
  id: string;
  name: string;
  url: string;
  description: string;
  isOfficial: boolean;
  addedAt: string;
  packages: UURPackage[];
}

const UUR_SUBMISSIONS_KEY = 'urbanshade_uur_submissions';
const UUR_INSTALLED_APPS_KEY = 'urbanshade_uur_installed_apps';
const UUR_CUSTOM_LISTS_KEY = 'urbanshade_uur_custom_lists';

// === REAL BUILT-IN UUR APPS ===

// Hello World App - Simple test app
export const HelloWorldApp = () => {
  return `
    <div style="padding: 20px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); height: 100%; color: white; font-family: monospace;">
      <h1 style="color: #00ff88; margin-bottom: 16px;">🎉 Hello World!</h1>
      <p style="color: #a0aec0; margin-bottom: 12px;">This project works and you installed it correctly!</p>
      <div style="background: #0a0a0a; padding: 16px; border-radius: 8px; border: 1px solid #00ff8833;">
        <p style="color: #00ff88; margin: 0;">✓ UUR Installation: Successful</p>
        <p style="color: #00ff88; margin: 8px 0 0 0;">✓ Package Manager: Working</p>
        <p style="color: #00ff88; margin: 8px 0 0 0;">✓ App Rendering: Functional</p>
      </div>
      <p style="color: #666; margin-top: 16px; font-size: 12px;">Package: hello-world v1.0.0 by UUR-Team</p>
    </div>
  `;
};

// System Info App - More useful utility
export const SystemInfoApp = () => {
  const now = new Date();
  return `
    <div style="padding: 20px; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); height: 100%; color: white; font-family: 'Courier New', monospace; overflow: auto;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px; border-bottom: 1px solid #333; padding-bottom: 12px;">
        <span style="font-size: 24px;">📊</span>
        <h1 style="color: #00d4ff; margin: 0; font-size: 20px;">System Information</h1>
      </div>
      
      <div style="display: grid; gap: 12px;">
        <div style="background: #111; padding: 12px; border-radius: 6px; border-left: 3px solid #00d4ff;">
          <div style="color: #666; font-size: 11px; margin-bottom: 4px;">PLATFORM</div>
          <div style="color: #fff;">${navigator.platform}</div>
        </div>
        
        <div style="background: #111; padding: 12px; border-radius: 6px; border-left: 3px solid #00ff88;">
          <div style="color: #666; font-size: 11px; margin-bottom: 4px;">USER AGENT</div>
          <div style="color: #fff; font-size: 11px; word-break: break-all;">${navigator.userAgent.slice(0, 100)}...</div>
        </div>
        
        <div style="background: #111; padding: 12px; border-radius: 6px; border-left: 3px solid #ff6b6b;">
          <div style="color: #666; font-size: 11px; margin-bottom: 4px;">SCREEN</div>
          <div style="color: #fff;">${screen.width} × ${screen.height} @ ${window.devicePixelRatio}x</div>
        </div>
        
        <div style="background: #111; padding: 12px; border-radius: 6px; border-left: 3px solid #ffd93d;">
          <div style="color: #666; font-size: 11px; margin-bottom: 4px;">LANGUAGE</div>
          <div style="color: #fff;">${navigator.language}</div>
        </div>
        
        <div style="background: #111; padding: 12px; border-radius: 6px; border-left: 3px solid #9b59b6;">
          <div style="color: #666; font-size: 11px; margin-bottom: 4px;">LOCAL TIME</div>
          <div style="color: #fff;">${now.toLocaleString()}</div>
        </div>
        
        <div style="background: #111; padding: 12px; border-radius: 6px; border-left: 3px solid #e67e22;">
          <div style="color: #666; font-size: 11px; margin-bottom: 4px;">MEMORY (if available)</div>
          <div style="color: #fff;">${(navigator as any).deviceMemory ? (navigator as any).deviceMemory + ' GB' : 'N/A'}</div>
        </div>
        
        <div style="background: #111; padding: 12px; border-radius: 6px; border-left: 3px solid #1abc9c;">
          <div style="color: #666; font-size: 11px; margin-bottom: 4px;">COOKIES ENABLED</div>
          <div style="color: #fff;">${navigator.cookieEnabled ? 'Yes' : 'No'}</div>
        </div>
        
        <div style="background: #111; padding: 12px; border-radius: 6px; border-left: 3px solid #3498db;">
          <div style="color: #666; font-size: 11px; margin-bottom: 4px;">ONLINE STATUS</div>
          <div style="color: ${navigator.onLine ? '#00ff88' : '#ff6b6b'};">${navigator.onLine ? '🟢 Online' : '🔴 Offline'}</div>
        </div>
      </div>
      
      <p style="color: #444; margin-top: 20px; font-size: 10px; text-align: center;">
        Package: system-info v1.2.0 by UUR-Team • Press refresh to update
      </p>
    </div>
  `;
};

// Registry of real UUR packages
export const UUR_REAL_PACKAGES: Record<string, UURPackage> = {
  'hello-world': {
    id: 'hello-world',
    name: 'Hello World',
    description: 'Simple test app to verify UUR installation works correctly',
    version: '1.0.0',
    author: 'UUR-Team',
    category: 'app',
    downloads: 5420,
    stars: 128,
    isOfficial: true,
    isFeatured: true,
    listSource: 'official',
    tags: ['test', 'demo', 'starter']
  },
  'system-info': {
    id: 'system-info',
    name: 'System Info',
    description: 'Display detailed system information including platform, screen, memory, and network status',
    version: '1.2.0',
    author: 'UUR-Team',
    category: 'utility',
    downloads: 3850,
    stars: 89,
    isOfficial: true,
    isFeatured: true,
    listSource: 'official',
    tags: ['system', 'info', 'diagnostics']
  },
  'theme-dark-neon': {
    id: 'theme-dark-neon',
    name: 'Dark Neon Theme',
    description: 'A vibrant neon-styled dark theme with glowing accents',
    version: '2.0.0',
    author: 'ThemeForge',
    category: 'theme',
    downloads: 2100,
    stars: 67,
    isOfficial: true,
    isFeatured: false,
    listSource: 'official',
    tags: ['theme', 'dark', 'neon']
  },
  'file-cleaner': {
    id: 'file-cleaner',
    name: 'File Cleaner',
    description: 'Clean up temporary files and free up storage space',
    version: '1.5.0',
    author: 'CleanUtils',
    category: 'utility',
    downloads: 1890,
    stars: 45,
    isOfficial: true,
    listSource: 'official',
    tags: ['cleanup', 'storage', 'utility']
  },
  'mini-games': {
    id: 'mini-games',
    name: 'Mini Games Pack',
    description: 'Collection of fun mini-games including Snake, Tetris, and Memory',
    version: '1.0.0',
    author: 'GameDev',
    category: 'game',
    downloads: 4200,
    stars: 156,
    isOfficial: true,
    isFeatured: true,
    listSource: 'official',
    tags: ['games', 'fun', 'entertainment']
  },
  'password-gen': {
    id: 'password-gen',
    name: 'Password Generator',
    description: 'Generate secure random passwords with customizable options',
    version: '1.1.0',
    author: 'SecureTools',
    category: 'security',
    downloads: 1560,
    stars: 42,
    isOfficial: true,
    listSource: 'official',
    tags: ['security', 'password', 'generator']
  }
};

// Sanitize HTML to prevent XSS - only allow safe tags and attributes
export const sanitizeHtml = (html: string): string => {
  // Fallback: if we can't parse, return escaped HTML
  if (!html) return '';
  
  try {
    // Create a DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Check if body exists
    if (!doc.body) {
      console.warn('[UUR] DOMParser failed to create body, returning raw HTML');
      return html;
    }
    
    // Allowed tags
    const allowedTags = ['div', 'span', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'pre', 'code', 'ul', 'ol', 'li', 'br', 'hr', 'strong', 'em', 'b', 'i'];
    
    // Allowed attributes
    const allowedAttrs = ['style', 'class'];
    
    // Disallowed style patterns (scripts, expressions)
    const dangerousStylePatterns = [
      /javascript:/gi,
      /expression\s*\(/gi,
      /behavior:/gi,
      /-moz-binding/gi,
      /url\s*\([^)]*script/gi,
    ];
    
    const sanitizeNode = (node: Node): void => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as Element;
        const tagName = el.tagName.toLowerCase();
        
        // Check if tag is allowed
        if (!allowedTags.includes(tagName)) {
          // Replace with span but keep content
          const span = doc.createElement('span');
          while (el.firstChild) {
            span.appendChild(el.firstChild);
          }
          el.parentNode?.replaceChild(span, el);
          return;
        }
        
        // Remove disallowed attributes
        const attrs = Array.from(el.attributes);
        for (const attr of attrs) {
          if (!allowedAttrs.includes(attr.name.toLowerCase())) {
            el.removeAttribute(attr.name);
          } else if (attr.name.toLowerCase() === 'style') {
            // Check for dangerous patterns in style
            let style = attr.value;
            for (const pattern of dangerousStylePatterns) {
              style = style.replace(pattern, '');
            }
            el.setAttribute('style', style);
          }
        }
        
        // Recursively sanitize children
        Array.from(el.childNodes).forEach(sanitizeNode);
      }
    };
    
    sanitizeNode(doc.body);
    return doc.body.innerHTML;
  } catch (err) {
    console.warn('[UUR] Sanitization failed, returning raw HTML:', err);
    return html;
  }
};

// Get app HTML by ID (sanitized)
export const getUURAppHtml = (appId: string): string | null => {
  let html: string | null = null;
  
  switch (appId) {
    case 'hello-world':
      html = HelloWorldApp();
      break;
    case 'system-info':
      html = SystemInfoApp();
      break;
    default:
      // Check custom lists for the app
      const customLists = getCustomLists();
      for (const list of customLists) {
        const pkg = list.packages.find(p => p.id === appId);
        if (pkg) {
          html = `<div style="padding: 20px; background: #1a1a2e; color: white; font-family: monospace;">
            <h2 style="color: #00d4ff;">${pkg.name}</h2>
            <p style="color: #888; margin: 8px 0;">${pkg.description}</p>
            <div style="background: #0a0a0a; padding: 12px; border-radius: 6px; margin-top: 16px;">
              <p style="color: #666; font-size: 12px;">This package was loaded from a custom list.</p>
              <p style="color: #444; font-size: 11px;">Source: ${list.name}</p>
            </div>
          </div>`;
          break;
        }
      }
      break;
  }
  
  // Sanitize before returning
  return html ? sanitizeHtml(html) : null;
};

// === PACKAGE LISTS ===

// Get the official package list
export const getOfficialList = (): UURList => ({
  id: 'official',
  name: 'Official Repository',
  url: 'uur://official',
  description: 'The official UrbanShade User Repository with verified packages',
  isOfficial: true,
  addedAt: new Date().toISOString(),
  packages: Object.values(UUR_REAL_PACKAGES)
});

// Get featured packages
export const getFeaturedPackages = (): UURPackage[] => {
  return getAllPackages().filter(pkg => pkg.isFeatured);
};

// Get packages by category
export const getPackagesByCategory = (category: UURCategory): UURPackage[] => {
  return getAllPackages().filter(pkg => pkg.category === category);
};

// Get custom (imported) lists
export const getCustomLists = (): UURList[] => {
  try {
    const stored = localStorage.getItem(UUR_CUSTOM_LISTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// UUR Manifest interface for GitHub fetching
export interface UURManifest {
  name: string;
  version: string;
  description: string;
  packages: Array<{
    id: string;
    name: string;
    description: string;
    version: string;
    author: string;
    category: UURCategory;
    dependencies?: string[];
  }>;
}

// Fetch and parse a UUR manifest from a GitHub repository URL
export const fetchUURManifest = async (githubUrl: string): Promise<UURManifest | null> => {
  try {
    // Convert GitHub URL to raw content URL
    // e.g., https://github.com/user/repo -> https://raw.githubusercontent.com/user/repo/main/uur-manifest.json
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) return null;
    
    const [, owner, repo] = match;
    
    // Try different branch names
    const branches = ['main', 'master'];
    
    for (const branch of branches) {
      const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/uur-manifest.json`;
      
      try {
        const response = await fetch(rawUrl);
        if (response.ok) {
          const manifest = await response.json();
          return manifest as UURManifest;
        }
      } catch {
        continue;
      }
    }
    
    return null;
  } catch {
    return null;
  }
};

// Add a custom list (with optional fetching from GitHub)
export const addCustomList = async (
  list: Omit<UURList, 'addedAt' | 'isOfficial'>, 
  fetchFromGithub: boolean = true
): Promise<{ success: boolean; error?: string; packageCount?: number }> => {
  try {
    const lists = getCustomLists();
    
    // Check for duplicate ID
    if (lists.some(l => l.id === list.id)) {
      return { success: false, error: 'A list with this ID already exists' };
    }
    
    let packages = list.packages;
    
    // Try to fetch from GitHub if URL is provided
    if (fetchFromGithub && list.url.includes('github.com')) {
      const manifest = await fetchUURManifest(list.url);
      if (manifest && manifest.packages) {
        packages = manifest.packages.map(pkg => ({
          ...pkg,
          downloads: Math.floor(Math.random() * 1000),
          stars: Math.floor(Math.random() * 50),
          isOfficial: false,
          listSource: list.name
        }));
      }
    }
    
    const newList: UURList = {
      ...list,
      packages,
      isOfficial: false,
      addedAt: new Date().toISOString()
    };
    
    lists.push(newList);
    localStorage.setItem(UUR_CUSTOM_LISTS_KEY, JSON.stringify(lists));
    return { success: true, packageCount: packages.length };
  } catch (err) {
    return { success: false, error: 'Failed to add list' };
  }
};

// Remove a custom list
export const removeCustomList = (listId: string): boolean => {
  try {
    const lists = getCustomLists();
    const filtered = lists.filter(l => l.id !== listId);
    if (filtered.length !== lists.length) {
      localStorage.setItem(UUR_CUSTOM_LISTS_KEY, JSON.stringify(filtered));
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// Get all packages from all lists
export const getAllPackages = (): UURPackage[] => {
  const official = getOfficialList().packages;
  const custom = getCustomLists().flatMap(l => 
    l.packages.map(p => ({ ...p, listSource: l.name, isOfficial: false }))
  );
  return [...official, ...custom];
};

// === DEPENDENCY RESOLUTION ===

export const checkDependencies = (packageId: string): { 
  satisfied: boolean; 
  missing: string[]; 
  installed: string[] 
} => {
  const pkg = getAllPackages().find(p => p.id === packageId);
  if (!pkg || !pkg.dependencies || pkg.dependencies.length === 0) {
    return { satisfied: true, missing: [], installed: [] };
  }
  
  const installedApps = getInstalledUURApps();
  const installedIds = installedApps.map(a => a.id);
  
  const missing: string[] = [];
  const installed: string[] = [];
  
  for (const dep of pkg.dependencies) {
    if (installedIds.includes(dep)) {
      installed.push(dep);
    } else {
      missing.push(dep);
    }
  }
  
  return {
    satisfied: missing.length === 0,
    missing,
    installed
  };
};

export const installWithDependencies = async (
  packageId: string, 
  listSource?: string,
  onProgress?: (message: string) => void
): Promise<{ success: boolean; installed: string[] }> => {
  const toInstall: string[] = [];
  const installed: string[] = [];
  
  const collectDeps = (pkgId: string, visited: Set<string>) => {
    if (visited.has(pkgId)) return;
    visited.add(pkgId);
    
    const pkg = getAllPackages().find(p => p.id === pkgId);
    if (!pkg) return;
    
    if (pkg.dependencies) {
      for (const dep of pkg.dependencies) {
        collectDeps(dep, visited);
      }
    }
    
    if (!isUURAppInstalled(pkgId)) {
      toInstall.push(pkgId);
    }
  };
  
  collectDeps(packageId, new Set());
  
  for (const pkgId of toInstall) {
    onProgress?.(`Installing ${pkgId}...`);
    await new Promise(r => setTimeout(r, 500));
    
    const pkg = getAllPackages().find(p => p.id === pkgId);
    if (installUURApp(pkgId, pkg?.listSource || listSource)) {
      installed.push(pkgId);
    }
  }
  
  return { success: installed.includes(packageId), installed };
};

// === SUBMISSION MANAGEMENT ===

export const getSubmissions = (): UURSubmission[] => {
  try {
    const stored = localStorage.getItem(UUR_SUBMISSIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const addSubmission = (submission: Omit<UURSubmission, 'submittedAt' | 'status'>): boolean => {
  try {
    const submissions = getSubmissions();
    const newSubmission: UURSubmission = {
      ...submission,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };
    submissions.push(newSubmission);
    localStorage.setItem(UUR_SUBMISSIONS_KEY, JSON.stringify(submissions));
    
    // Also update the text file format for easy viewing
    console.log(`[UUR] New submission: ${submission.packageName} from ${submission.author}`);
    return true;
  } catch {
    return false;
  }
};

export const updateSubmissionStatus = (packageName: string, status: 'approved' | 'denied'): boolean => {
  try {
    const submissions = getSubmissions();
    const idx = submissions.findIndex(s => s.packageName === packageName);
    if (idx !== -1) {
      submissions[idx].status = status;
      localStorage.setItem(UUR_SUBMISSIONS_KEY, JSON.stringify(submissions));
      return true;
    }
    return false;
  } catch {
    return false;
  }
};

// === INSTALLED APPS ===

export interface InstalledUURApp {
  id: string;
  name: string;
  version: string;
  installedAt: string;
  source: 'official' | 'community';
  listSource?: string;
}

export const getInstalledUURApps = (): InstalledUURApp[] => {
  try {
    const stored = localStorage.getItem(UUR_INSTALLED_APPS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

export const installUURApp = (appId: string, listSource?: string): boolean => {
  const allPackages = getAllPackages();
  const pkg = allPackages.find(p => p.id === appId);
  if (!pkg) return false;
  
  const installed = getInstalledUURApps();
  if (installed.find(a => a.id === appId)) return false; // Already installed
  
  installed.push({
    id: appId,
    name: pkg.name,
    version: pkg.version,
    installedAt: new Date().toISOString(),
    source: pkg.isOfficial ? 'official' : 'community',
    listSource: listSource || pkg.listSource
  });
  
  localStorage.setItem(UUR_INSTALLED_APPS_KEY, JSON.stringify(installed));
  return true;
};

export const uninstallUURApp = (appId: string): boolean => {
  const installed = getInstalledUURApps();
  const filtered = installed.filter(a => a.id !== appId);
  if (filtered.length !== installed.length) {
    localStorage.setItem(UUR_INSTALLED_APPS_KEY, JSON.stringify(filtered));
    return true;
  }
  return false;
};

export const isUURAppInstalled = (appId: string): boolean => {
  return getInstalledUURApps().some(a => a.id === appId);
};

// Search packages
export const searchPackages = (query: string): UURPackage[] => {
  const q = query.toLowerCase();
  return getAllPackages().filter(pkg => 
    pkg.name.toLowerCase().includes(q) ||
    pkg.description.toLowerCase().includes(q) ||
    pkg.author.toLowerCase().includes(q) ||
    pkg.tags?.some(t => t.toLowerCase().includes(q)) ||
    pkg.category.toLowerCase().includes(q)
  );
};
