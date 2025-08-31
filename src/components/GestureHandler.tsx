import React, { useRef, useEffect, useCallback } from 'react';

interface GestureHandlerProps {
  children: React.ReactNode;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onTap?: () => void;
  threshold?: number;
}

export const GestureHandler: React.FC<GestureHandlerProps> = ({
  children,
  onSwipeUp,
  onSwipeDown,
  onSwipeLeft,
  onSwipeRight,
  onTap,
  threshold = 50,
}) => {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const touchEndRef = useRef<{ x: number; y: number } | null>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    touchStartRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
    touchEndRef.current = null;
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    touchEndRef.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    };
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (!touchStartRef.current || !touchEndRef.current) {
      return;
    }

    const startX = touchStartRef.current.x;
    const startY = touchStartRef.current.y;
    const endX = touchEndRef.current.x;
    const endY = touchEndRef.current.y;

    const diffX = startX - endX;
    const diffY = startY - endY;

    // Check if it's a tap (very little movement)
    if (Math.abs(diffX) < 10 && Math.abs(diffY) < 10) {
      if (onTap) onTap();
      return;
    }

    // Check if swipe is horizontal or vertical
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (diffX > threshold && onSwipeLeft) {
        onSwipeLeft();
      } else if (diffX < -threshold && onSwipeRight) {
        onSwipeRight();
      }
    } else {
      // Vertical swipe
      if (diffY > threshold && onSwipeUp) {
        onSwipeUp();
      } else if (diffY < -threshold && onSwipeDown) {
        onSwipeDown();
      }
    }

    // Reset touch points
    touchStartRef.current = null;
    touchEndRef.current = null;
  }, [onSwipeUp, onSwipeDown, onSwipeLeft, onSwipeRight, onTap, threshold]);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: true });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return (
    <div ref={elementRef} className="w-full h-full">
      {children}
    </div>
  );
};