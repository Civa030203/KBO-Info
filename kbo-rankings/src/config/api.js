import axios from "axios";
import { Capacitor } from "@capacitor/core";

const PRODUCTION_API_URL = "https://kbo-info.onrender.com";
const LOCAL_API_URL = "http://localhost:5001";

export const getApiBaseUrl = () => {
  // 1. 모바일 앱 (iOS/Android Capacitor 네이티브 환경)
  // Capacitor iOS/Android는 웹뷰 내부에서 capacitor://localhost 등을 사용하므로
  // 브라우저 localhost 검사보다 반드시 먼저 처리해야 합니다.
  if (Capacitor.isNativePlatform()) {
    if (process.env.REACT_APP_API_BASE_URL) {
      return process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, "");
    }
    return PRODUCTION_API_URL;
  }

  // 2. 순수 웹 브라우저의 로컬 개발 환경 (localhost / 127.0.0.1)인 경우
  // 웹 개발 시 로컬 백엔드 서버(http://localhost:5001)를 우선 연결합니다.
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return LOCAL_API_URL;
  }

  // 3. 환경변수가 지정되어 있다면 적용
  if (process.env.REACT_APP_API_BASE_URL) {
    return process.env.REACT_APP_API_BASE_URL.replace(/\/+$/, "");
  }

  return PRODUCTION_API_URL;
};

// 동적으로 현재 호출 시점의 API URL을 가져오는 Getter 함수로 내보내기
export const API_BASE_URL = getApiBaseUrl();

export const apiClient = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 10000,
});

export default API_BASE_URL;