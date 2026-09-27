import axios from "axios";
import { Capacitor } from "@capacitor/core";

const PRODUCTION_API_URL = "https://kbo-info.onrender.com";
const LOCAL_API_URL = "http://localhost:5001";

export const getApiBaseUrl = () => {
  // 1. 브라우저 로컬 개발 환경 (localhost / 127.0.0.1)인 경우
  // .env 설정보다 브라우저 주소창의 localhost 접속을 최우선 처리합니다.
  if (
    typeof window !== "undefined" &&
    (window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1")
  ) {
    return LOCAL_API_URL;
  }

  // 2. 모바일 앱 (iOS/Android Capacitor 실기기 및 시뮬레이터)
  if (Capacitor.isNativePlatform()) {
    return PRODUCTION_API_URL;
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