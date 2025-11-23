/**
 * Feature: Location Mode Hook
 * Purpose: Manage location include/exclude mode state
 */

import { useState, useCallback } from 'react';

export function useLocationMode() {
  const [mode, setMode] = useState<'include' | 'exclude'>('include');
  const [isActive, setIsActive] = useState(false);

  const reset = useCallback(() => {
    setMode('include');
    setIsActive(false);
  }, []);

  return {
    mode,
    setMode,
    isActive,
    setIsActive,
    reset,
  };
}

