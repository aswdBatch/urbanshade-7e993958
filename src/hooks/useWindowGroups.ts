import { useState, useCallback, useEffect } from 'react';

export interface WindowGroup {
  id: string;
  name: string;
  windowIds: string[];
  color: string;
  createdAt: string;
}

const GROUPS_KEY = 'urbanshade_window_groups';

const GROUP_COLORS = [
  '#00d4ff', // cyan
  '#00ff88', // green
  '#ff6b6b', // red
  '#ffd93d', // yellow
  '#9b59b6', // purple
  '#e67e22', // orange
  '#3498db', // blue
  '#1abc9c', // teal
];

export const useWindowGroups = () => {
  const [groups, setGroups] = useState<WindowGroup[]>(() => {
    try {
      const stored = localStorage.getItem(GROUPS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem(GROUPS_KEY, JSON.stringify(groups));
  }, [groups]);

  const createGroup = useCallback((name: string, windowIds: string[] = []): string => {
    const newId = `group-${Date.now()}`;
    const colorIndex = groups.length % GROUP_COLORS.length;
    
    const newGroup: WindowGroup = {
      id: newId,
      name,
      windowIds,
      color: GROUP_COLORS[colorIndex],
      createdAt: new Date().toISOString()
    };
    
    setGroups(prev => [...prev, newGroup]);
    return newId;
  }, [groups.length]);

  const deleteGroup = useCallback((groupId: string) => {
    setGroups(prev => prev.filter(g => g.id !== groupId));
  }, []);

  const renameGroup = useCallback((groupId: string, newName: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, name: newName } : g
    ));
  }, []);

  const setGroupColor = useCallback((groupId: string, color: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId ? { ...g, color } : g
    ));
  }, []);

  const addWindowToGroup = useCallback((windowId: string, groupId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId && !g.windowIds.includes(windowId)
        ? { ...g, windowIds: [...g.windowIds, windowId] }
        : g
    ));
  }, []);

  const removeWindowFromGroup = useCallback((windowId: string, groupId: string) => {
    setGroups(prev => prev.map(g => 
      g.id === groupId 
        ? { ...g, windowIds: g.windowIds.filter(id => id !== windowId) }
        : g
    ));
  }, []);

  const removeWindowFromAllGroups = useCallback((windowId: string) => {
    setGroups(prev => prev.map(g => ({
      ...g,
      windowIds: g.windowIds.filter(id => id !== windowId)
    })));
  }, []);

  const getWindowGroup = useCallback((windowId: string): WindowGroup | null => {
    return groups.find(g => g.windowIds.includes(windowId)) || null;
  }, [groups]);

  const getGroupWindows = useCallback((groupId: string): string[] => {
    const group = groups.find(g => g.id === groupId);
    return group?.windowIds || [];
  }, [groups]);

  const minimizeGroup = useCallback((groupId: string, onMinimize: (windowId: string) => void) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      group.windowIds.forEach(onMinimize);
    }
  }, [groups]);

  const restoreGroup = useCallback((groupId: string, onRestore: (windowId: string) => void) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      group.windowIds.forEach(onRestore);
    }
  }, [groups]);

  const closeGroup = useCallback((groupId: string, onClose: (windowId: string) => void) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      group.windowIds.forEach(onClose);
      deleteGroup(groupId);
    }
  }, [groups, deleteGroup]);

  return {
    groups,
    createGroup,
    deleteGroup,
    renameGroup,
    setGroupColor,
    addWindowToGroup,
    removeWindowFromGroup,
    removeWindowFromAllGroups,
    getWindowGroup,
    getGroupWindows,
    minimizeGroup,
    restoreGroup,
    closeGroup,
    availableColors: GROUP_COLORS
  };
};
