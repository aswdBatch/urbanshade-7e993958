import { useState, useCallback, useEffect } from 'react';

export interface VirtualDesktop {
  id: string;
  name: string;
  windowIds: string[];
  createdAt: string;
}

const DESKTOPS_KEY = 'urbanshade_virtual_desktops';
const ACTIVE_DESKTOP_KEY = 'urbanshade_active_desktop';

export const useMultipleDesktops = () => {
  const [desktops, setDesktops] = useState<VirtualDesktop[]>(() => {
    try {
      const stored = localStorage.getItem(DESKTOPS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {}
    // Default: one desktop
    return [{ id: 'desktop-1', name: 'Desktop 1', windowIds: [], createdAt: new Date().toISOString() }];
  });

  const [activeDesktopId, setActiveDesktopId] = useState<string>(() => {
    return localStorage.getItem(ACTIVE_DESKTOP_KEY) || 'desktop-1';
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(DESKTOPS_KEY, JSON.stringify(desktops));
  }, [desktops]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_DESKTOP_KEY, activeDesktopId);
  }, [activeDesktopId]);

  const activeDesktop = desktops.find(d => d.id === activeDesktopId) || desktops[0];

  const createDesktop = useCallback((name?: string) => {
    const newId = `desktop-${Date.now()}`;
    const newDesktop: VirtualDesktop = {
      id: newId,
      name: name || `Desktop ${desktops.length + 1}`,
      windowIds: [],
      createdAt: new Date().toISOString()
    };
    setDesktops(prev => [...prev, newDesktop]);
    return newId;
  }, [desktops.length]);

  const deleteDesktop = useCallback((desktopId: string) => {
    if (desktops.length <= 1) return false; // Can't delete last desktop
    
    setDesktops(prev => prev.filter(d => d.id !== desktopId));
    
    // Switch to another desktop if deleting active
    if (activeDesktopId === desktopId) {
      const remaining = desktops.filter(d => d.id !== desktopId);
      if (remaining.length > 0) {
        setActiveDesktopId(remaining[0].id);
      }
    }
    return true;
  }, [desktops, activeDesktopId]);

  const switchDesktop = useCallback((desktopId: string) => {
    if (desktops.some(d => d.id === desktopId)) {
      setActiveDesktopId(desktopId);
      return true;
    }
    return false;
  }, [desktops]);

  const renameDesktop = useCallback((desktopId: string, newName: string) => {
    setDesktops(prev => prev.map(d => 
      d.id === desktopId ? { ...d, name: newName } : d
    ));
  }, []);

  const moveWindowToDesktop = useCallback((windowId: string, targetDesktopId: string) => {
    setDesktops(prev => prev.map(d => ({
      ...d,
      windowIds: d.id === targetDesktopId 
        ? [...d.windowIds.filter(id => id !== windowId), windowId]
        : d.windowIds.filter(id => id !== windowId)
    })));
  }, []);

  const addWindowToDesktop = useCallback((windowId: string, desktopId?: string) => {
    const targetId = desktopId || activeDesktopId;
    setDesktops(prev => prev.map(d => 
      d.id === targetId && !d.windowIds.includes(windowId)
        ? { ...d, windowIds: [...d.windowIds, windowId] }
        : d
    ));
  }, [activeDesktopId]);

  const removeWindowFromDesktop = useCallback((windowId: string) => {
    setDesktops(prev => prev.map(d => ({
      ...d,
      windowIds: d.windowIds.filter(id => id !== windowId)
    })));
  }, []);

  const getWindowDesktop = useCallback((windowId: string): VirtualDesktop | null => {
    return desktops.find(d => d.windowIds.includes(windowId)) || null;
  }, [desktops]);

  const isWindowOnActiveDesktop = useCallback((windowId: string): boolean => {
    return activeDesktop.windowIds.includes(windowId) || 
           !desktops.some(d => d.windowIds.includes(windowId)); // Window not assigned to any desktop = visible everywhere
  }, [activeDesktop, desktops]);

  // Switch desktops with keyboard shortcuts
  const switchToNextDesktop = useCallback(() => {
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId);
    const nextIndex = (currentIndex + 1) % desktops.length;
    setActiveDesktopId(desktops[nextIndex].id);
  }, [desktops, activeDesktopId]);

  const switchToPreviousDesktop = useCallback(() => {
    const currentIndex = desktops.findIndex(d => d.id === activeDesktopId);
    const prevIndex = (currentIndex - 1 + desktops.length) % desktops.length;
    setActiveDesktopId(desktops[prevIndex].id);
  }, [desktops, activeDesktopId]);

  return {
    desktops,
    activeDesktop,
    activeDesktopId,
    createDesktop,
    deleteDesktop,
    switchDesktop,
    renameDesktop,
    moveWindowToDesktop,
    addWindowToDesktop,
    removeWindowFromDesktop,
    getWindowDesktop,
    isWindowOnActiveDesktop,
    switchToNextDesktop,
    switchToPreviousDesktop
  };
};
