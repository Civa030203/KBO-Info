import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import PullToRefresh from "./PullToRefresh";
import { fetchVideoMap } from "../utils/videoMapService";

/**
 * 모든 화면에 공통으로 적용되는 레이아웃 래퍼 컴포넌트
 * - iOS 모바일(Capacitor) 환경의 상태바/노치(Safe Area) 및 하단 홈 바 영역 겹침 방지
 * - 모바일 당겨서 새로고침(Pull-to-Refresh) 지원
 * - 상단 고정 새로고침 아이콘 버튼 제공 (클릭 시 최신 videoMap 갱신 및 화면 리로드)
 */
export default function Layout() {
  const [isRotating, setIsRotating] = useState(false);

  // 공통 새로고침 로직
  const handleRefresh = async () => {
    setIsRotating(true);
    try {
      // 1. 최신 videoMap이 있다면 서버에서 1회 갱신 (로컬 캐시 덮어쓰기)
      await fetchVideoMap(true);
    } catch (e) {
      console.warn("videoMap 갱신 실패:", e);
    }

    // 2. 전체 페이지 리로드 (현재 화면의 모든 API 및 상태 최신화)
    setTimeout(() => {
      window.location.reload();
    }, 250);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col pt-safe pb-safe pl-safe pr-safe relative">
      {/* 📌 상단 우측 세련된 유리모피즘 새로고침 버튼 */}
      <button
        onClick={handleRefresh}
        disabled={isRotating}
        aria-label="새로고침"
        className="fixed top-[calc(env(safe-area-inset-top,0px)+14px)] right-4 z-40 p-2.5 rounded-full bg-gray-900/80 hover:bg-gray-800 text-gray-300 hover:text-white border border-gray-700/60 shadow-lg backdrop-blur-md transition-all active:scale-95 flex items-center justify-center"
        title="화면 새로고침 및 최신 중계 링크 반영"
      >
        <svg
          className={`w-4 h-4 transition-transform duration-500 ${isRotating ? "animate-spin text-blue-400" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* 📌 당겨서 새로고침 래퍼 */}
      <PullToRefresh onRefresh={handleRefresh}>
        <Outlet />
      </PullToRefresh>
    </div>
  );
}
