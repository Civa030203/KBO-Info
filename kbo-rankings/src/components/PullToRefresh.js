import React, { useState, useRef, useEffect, useCallback } from "react";

/**
 * 모바일 웹뷰 및 브라우저에서 자연스럽게 동작하는 당겨서 새로고침 (Pull-to-Refresh) 컴포넌트
 */
export default function PullToRefresh({ children, onRefresh }) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const touchStartY = useRef(0);
  const isPulling = useRef(false);
  const containerRef = useRef(null);

  const TRIGGER_DISTANCE = 75; // 새로고침 발동 거리 (px)
  const MAX_DISTANCE = 110;    // 최대 당김 거리 (px)

  const handleTouchStart = (e) => {
    if (isRefreshing) return;
    // 최상단 스크롤 상태인지 확인
    const scrollTop = window.scrollY || document.documentElement.scrollTop || 0;
    if (scrollTop <= 0) {
      touchStartY.current = e.touches[0].clientY;
      isPulling.current = true;
    } else {
      isPulling.current = false;
    }
  };

  const handleTouchMove = (e) => {
    if (!isPulling.current || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const diff = currentY - touchStartY.current;

    if (diff > 0) {
      // 당기는 느낌에 탄성(damping) 적용
      const dampedDistance = Math.min(MAX_DISTANCE, diff * 0.45);
      setPullDistance(dampedDistance);
    } else {
      setPullDistance(0);
      isPulling.current = false;
    }
  };

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    setPullDistance(TRIGGER_DISTANCE);
    try {
      if (onRefresh) {
        await onRefresh();
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error("새로고침 중 오류 발생:", err);
    } finally {
      // 완료 후 스르륵 복귀
      setTimeout(() => {
        setIsRefreshing(false);
        setPullDistance(0);
      }, 400);
    }
  }, [onRefresh, TRIGGER_DISTANCE]);

  const handleTouchEnd = () => {
    if (!isPulling.current || isRefreshing) return;
    isPulling.current = false;

    if (pullDistance >= TRIGGER_DISTANCE) {
      handleRefresh();
    } else {
      setPullDistance(0);
    }
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e) => handleTouchStart(e);
    const onTouchMove = (e) => handleTouchMove(e);
    const onTouchEnd = () => handleTouchEnd();

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", onTouchEnd);

    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRefreshing, pullDistance]);

  const progress = Math.min(1, pullDistance / TRIGGER_DISTANCE);
  const isReadyToTrigger = pullDistance >= TRIGGER_DISTANCE;

  return (
    // hidden은 세로축도 스크롤 컨테이너로 만들어 자식의 sticky 고정을 깨뜨린다.
    <div ref={containerRef} className="relative min-h-screen flex flex-col w-full overflow-x-clip">
      {/* 📌 상단 인디케이터 영역 */}
      <div
        className="w-full flex items-center justify-center pointer-events-none transition-all duration-200 overflow-hidden"
        style={{
          height: `${pullDistance}px`,
          opacity: pullDistance > 10 ? 1 : 0,
        }}
      >
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/90 backdrop-blur-md border border-gray-700 text-xs text-gray-200 shadow-md">
          {isRefreshing ? (
            <>
              <svg className="animate-spin h-3.5 w-3.5 text-blue-400" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>새로고침 중...</span>
            </>
          ) : (
            <>
              <span
                className="inline-block transition-transform duration-200"
                style={{
                  transform: isReadyToTrigger ? "rotate(180deg)" : `rotate(${progress * 180}deg)`,
                }}
              >
                ↓
              </span>
              <span>{isReadyToTrigger ? "놓으면 새로고침" : "당겨서 새로고침"}</span>
            </>
          )}
        </div>
      </div>

      {/* 페이지 컨텐츠 */}
      <div className="flex-1 flex flex-col w-full">
        {children}
      </div>
    </div>
  );
}
