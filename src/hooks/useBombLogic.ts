import { useState, useEffect, useCallback } from 'react';

export const useBombLogic = (rowCount: number) => {
  const [isBombReady, setIsBombReady] = useState(false);
  const [lastBombActivationRowCount, setLastBombActivationRowCount] = useState(0);

  // Bomb activation logic
  useEffect(() => {
    if (
      rowCount > 0 &&
      rowCount % 4 === 0 &&
      !isBombReady &&
      rowCount > lastBombActivationRowCount
    ) {
      setIsBombReady(true);
      setLastBombActivationRowCount(rowCount);
    }
  }, [rowCount, isBombReady, setIsBombReady, lastBombActivationRowCount, setLastBombActivationRowCount]);

  const deactivateBombState = useCallback(() => {
    setIsBombReady(false);
  }, [setIsBombReady]);

  const resetBombState = useCallback(() => {
    setIsBombReady(false);
    setLastBombActivationRowCount(0);
  }, [setIsBombReady, setLastBombActivationRowCount]);

  return {
    isBombReady,
    deactivateBombState,
    resetBombState,
  };
};
