import React from "react";
import { Outlet } from "react-router-dom";

/**
 * 모든 화면에 공통으로 적용되는 레이아웃 래퍼 컴포넌트
 * iOS 모바일(Capacitor) 환경의 상태바/노치(Safe Area) 및 하단 홈 바 영역 겹침을 방지합니다.
 */
export default function Layout() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 flex flex-col pt-safe pb-safe pl-safe pr-safe">
      <Outlet />
    </div>
  );
}
