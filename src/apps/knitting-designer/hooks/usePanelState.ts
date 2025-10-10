/**
 * Custom hooks for managing panel state in Pattern Wizard
 */

import { useState, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  PanelInstance, 
  PanelMetadata, 
  PanelCounts 
} from '../types/patternWizard.types';
import { 
  updatePatternData, 
  selectPatternData, 
  copyPanelPatternLayers 
} from '../../../store/knittingDesignSlice';
import { message } from 'antd';

/**
 * Hook to manage panel instances and their colorwork state
 */
export const usePanelInstances = (
  selectedPanels: string[],
  panelCounts: PanelCounts,
  panelList: PanelMetadata[]
) => {
  const dispatch = useDispatch();
  const patternData: any = useSelector(selectPatternData);
  
  // Track which panel instances have colorwork applied
  const [coloredInstances, setColoredInstances] = useState<Set<string>>(new Set());
  
  // Current instance being edited
  const [currentInstanceIndex, setCurrentInstanceIndex] = useState(0);
  
  // Generate panel instances based on selected panels and quantities
  const panelInstances = useMemo<PanelInstance[]>(() => {
    const instances: PanelInstance[] = [];
    
    selectedPanels.forEach(panelKey => {
      const count = panelCounts[panelKey] || 0;
      const panel = panelList.find(p => p.key === panelKey);
      
      if (panel && count > 0) {
        for (let i = 1; i <= count; i++) {
          const instanceId = `${panelKey}::instance-${i}`;
          instances.push({
            key: panelKey,
            instanceId,
            panelName: `${panel.panelName} #${i}`,
            isColored: coloredInstances.has(instanceId)
          });
        }
      }
    });
    
    return instances;
  }, [selectedPanels, panelCounts, panelList, coloredInstances]);
  
  // Current instance being edited
  const currentInstance = useMemo<PanelInstance | null>(() => {
    return panelInstances[currentInstanceIndex] || null;
  }, [panelInstances, currentInstanceIndex]);
  
  // Mark an instance as having colorwork applied
  const markInstanceColored = useCallback((instanceId: string) => {
    setColoredInstances(prev => new Set([...prev, instanceId]));
  }, []);
  
  // Navigate to next instance
  const goToNextInstance = useCallback(() => {
    if (currentInstanceIndex < panelInstances.length - 1) {
      setCurrentInstanceIndex(prev => prev + 1);
    }
  }, [currentInstanceIndex, panelInstances.length]);
  
  // Navigate to previous instance
  const goToPreviousInstance = useCallback(() => {
    if (currentInstanceIndex > 0) {
      setCurrentInstanceIndex(prev => prev - 1);
    }
  }, [currentInstanceIndex]);
  
  // Set specific instance by index
  const setInstanceByIndex = useCallback((index: number) => {
    if (index >= 0 && index < panelInstances.length) {
      setCurrentInstanceIndex(index);
    }
  }, [panelInstances.length]);
  
  // Copy colorwork from one instance to another
  const copyInstanceColorwork = useCallback((sourceInstanceId: string, targetInstanceId: string) => {
    dispatch(copyPanelPatternLayers({
      sourcePanelKey: sourceInstanceId,
      targetPanelKey: targetInstanceId
    }) as any);
    
    // Mark target instance as colored
    markInstanceColored(targetInstanceId);
    
    // Find instance names for success message
    const sourceInstance = panelInstances.find(i => i.instanceId === sourceInstanceId);
    const targetInstance = panelInstances.find(i => i.instanceId === targetInstanceId);
    
    if (sourceInstance && targetInstance) {
      message.success(`Copied colorwork from ${sourceInstance.panelName} to ${targetInstance.panelName}`);
    }
  }, [dispatch, panelInstances, markInstanceColored]);
  
  // Get completion stats for a specific panel type
  const getPanelTypeStats = useCallback((panelKey: string) => {
    const instances = panelInstances.filter(inst => inst.key === panelKey);
    const completedCount = instances.filter(inst => coloredInstances.has(inst.instanceId)).length;
    
    return {
      total: instances.length,
      completed: completedCount,
      allCompleted: instances.length > 0 && completedCount === instances.length
    };
  }, [panelInstances, coloredInstances]);
  
  // Reset to first instance
  const resetToFirstInstance = useCallback(() => {
    setCurrentInstanceIndex(0);
  }, []);
  
  return {
    panelInstances,
    currentInstance,
    currentInstanceIndex,
    coloredInstances,
    markInstanceColored,
    goToNextInstance,
    goToPreviousInstance,
    setInstanceByIndex,
    copyInstanceColorwork,
    getPanelTypeStats,
    resetToFirstInstance
  };
};

/**
 * Hook to manage panel selection and quantities
 */
export const usePanelSelection = (panelList: PanelMetadata[]) => {
  const dispatch = useDispatch();
  const patternData: any = useSelector(selectPatternData);
  
  // Initialize counts from Redux store
  const initialCounts: PanelCounts = (patternData?.panels?.panelsNeeded) || {};
  const [panelCounts, setPanelCounts] = useState<PanelCounts>(initialCounts);
  
  // Derive selected panels from counts (any panel with count > 0)
  const selectedPanels = useMemo<string[]>(() => {
    return Object.keys(panelCounts).filter(key => (panelCounts[key] || 0) > 0);
  }, [panelCounts]);
  
  // Update count for a specific panel
  const updatePanelCount = useCallback((panelKey: string, count: number) => {
    const newCount = Math.max(0, count); // Ensure non-negative
    const nextCounts = { ...panelCounts, [panelKey]: newCount };
    
    setPanelCounts(nextCounts);
    
    // Persist to Redux
    dispatch(updatePatternData({ 
      section: 'panels', 
      data: { panelsNeeded: nextCounts } 
    }) as any);
  }, [panelCounts, dispatch]);
  
  // Add a new panel with initial count of 1
  const addPanel = useCallback((panelKey: string) => {
    if (!panelCounts[panelKey]) {
      updatePanelCount(panelKey, 1);
    }
  }, [panelCounts, updatePanelCount]);
  
  // Remove a panel (set count to 0)
  const removePanel = useCallback((panelKey: string) => {
    updatePanelCount(panelKey, 0);
  }, [updatePanelCount]);
  
  // Get total instance count across all panels
  const totalInstanceCount = useMemo(() => {
    return Object.values(panelCounts).reduce((sum, count) => sum + (count || 0), 0);
  }, [panelCounts]);
  
  return {
    panelCounts,
    selectedPanels,
    totalInstanceCount,
    updatePanelCount,
    addPanel,
    removePanel
  };
};

/**
 * Hook to get panel shape from library/garments
 */
export const usePanelShape = (panelKey: string, panelList: PanelMetadata[]) => {
  const libraryData: any = useSelector((state: any) => state.library?.fullLibrary);
  
  return useMemo(() => {
    const [permalink, panelName] = panelKey.split('::');
    
    if (permalink === 'library') {
      // From user's library
      const libraryPanel = libraryData?.panels?.[panelName];
      if (libraryPanel?.shape) {
        return libraryPanel.shape;
      }
    } else {
      // From built-in garments
      const { garments } = require('../../../data/garments');
      const garment = garments.find((g: any) => g.permalink === permalink);
      if (garment?.shapes?.[panelName]) {
        return garment.shapes[panelName];
      }
    }
    
    return null;
  }, [panelKey, libraryData]);
};
