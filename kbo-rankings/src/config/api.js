import axios from "axios";
import { Capacitor } from "@capacitor/core";

const PRODUCTION_API_URL = "https://kbo-info.onrender.com";
const LOCAL_API_URL = "http://localhost:5001";

/**
 * 환경에 맞는 API Base URL을 계산하여 반환합니다.
 * 
 * 1. .env에 REACT_APP_API_BASE_URL이 정의되어 있으면 최우선 적용
 * 2. Capacitor 네이티브 앱 환경(iOS / Android)인 경우:
 *    웹뷰 내부에서 localhost로 로드되더라도 반드시 실제 배포 백엔드 서버를 바라보도록 설정
 * 3. 브라우저 로컬 개발 환경 (localhost / 127.0.0.1)인 경우: 로컬 백엔드 서버(5001 포트) 사용
 * 4. 기타 웹 배포 환경: 배포 백엔드 서버 사용
 */
export const getApiBaseUrl = () => {
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, "");
  }

  // 모바일 앱 (iOS/Android Capacitor 실기기 및 시뮬레이터)
  if (Capacitor.isNativePlatform()) {
    return PRODUCTION_API_URL;
  }

  // 브라우저 로컬 개발 환경
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return LOCAL_API_URL;
  }

  return PRODUCTION_API_URL;
};

export const API_BASE_URL = getApiBaseUrl();

/**
 * 사전 설정된 axios 인스턴스
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

export default API_BASE_URL;
