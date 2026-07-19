import setuptools  # Python 3.12 환경의 pkg_resources 에러 방지용 최상단 배치
import time
import json
from seleniumwire import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def extract_soop_stream(bj_id):
    """
    지정한 BJ ID의 방송 페이지로 진입하여 
    네트워크 패킷 중 스트리밍 정보(HLS/M3U8)가 담긴 API 응답을 찾아냅니다.
    """
    print(f"[정보] {bj_id} 방송국의 네트워크 패킷 모니터링을 시작합니다...")
    
    # 1. 셀레니움 와이어 및 크롬 드라이버 설정
    options = webdriver.ChromeOptions()
    options.add_argument('--headless')  # 백그라운드 실행 (창을 띄우고 싶다면 이 줄을 주석 처리)
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    
    # SOOP 방송국 주소 구성
    target_url = f"https://ch.soop.net/{bj_id}"
    
    try:
        driver.get(target_url)
        print("[정보] 페이지 로딩 중... 스트리밍 API 요청을 캡처하는 중입니다 (약 10초 소요)")
        time.sleep(10)  # 영상 플레이어 및 내부 API가 완전히 호출될 때까지 대기
        
        # 2. 브라우저가 주고받은 모든 네트워크 요청 순회
        for request in driver.requests:
            if request.response:
                # SOOP에서 방송 스트림 정보를 가져오는 핵심 API 엔드포인트 키워드 타겟팅
                # (일반적으로 'station', 'stream', 'live' 관련 내부 쿼리나 응답을 추적합니다)
                if 'broadinfo' in request.url or 'live-str' in request.url:
                    print(f"\n[발견] 타겟 API 캡처 성공: {request.url}")
                    
                    # 응답 바디 데이터 복호화 및 파싱
                    try:
                        response_body = request.response.body
                        # 바이트 데이터를 문자열로 디코딩
                        data = json.loads(response_body.decode('utf-8'))
                        
                        # 예시: 응답 JSON 구조 확인용 출력 (필요 시 주석 해제)
                        # print(json.dumps(data, indent=2, ensure-ascii=False))
                        
                        print("[성공] 스트리밍 데이터 응답 패킷을 확보했습니다.")
                        return data
                    except Exception as e:
                        print(f"[경고] 패킷 데이터 파싱 실패: {e}")
                        
        print("[실패] 스트리밍 주소가 포함된 특정 API 패킷을 찾지 못했습니다.")
        return None

    finally:
        driver.quit()
        print("[정보] 브라우저 세션을 종료했습니다.")

# --- 실행 테스트 ---
if __name__ == "__main__":
    # 테스트하고 싶은 SOOP BJ의 고유 ID를 입력하세요.
    # 예: 공식 방송 또는 라이브 중인 BJ ID
    TEST_BJ_ID = "afreecatv" 
    
    result = extract_soop_stream(TEST_BJ_ID)
    if result:
        print("\n--- 획득한 API 데이터 데이터 구조 ---")
        # 구조를 파악한 뒤 여기서 M3U8 또는 플레이어 소스 URL을 추출하여 videoMap.js 등에 연동할 수 있습니다.
        print(list(result.keys()))