import time
import json
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager

def extract_soop_stream(bj_id):
    """
    크롬 브라우저 자체의 성능 로그(Performance Logs)를 활성화하여
    네트워크 패킷 내 스트리밍 API와 M3U8 주소를 추출합니다.
    """
    print(f"[정보] {bj_id} 방송국의 네트워크 패킷 모니터링을 시작합니다...")
    
    options = webdriver.ChromeOptions()
    
    # 크롬 브라우저가 주고받는 모든 네트워크 기록을 수집하도록 설정 (핵심)
    options.set_capability('goog:loggingPrefs', {'performance': 'ALL'})
    
    options.add_argument('--headless')  # 백그라운드 실행
    options.add_argument('--no-sandbox')
    options.add_argument('--disable-dev-shm-usage')
    options.add_argument('user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36')

    # 브라우저 실행
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )
    
    target_url = f"https://play.sooplive.co.kr/{bj_id}"
    
    try:
        driver.get(target_url)
        print("[정보] 페이지 로딩 중... 스트리밍 데이터를 수집하고 있습니다 (약 10초 대기)")
        time.sleep(10)  # 플레이어 재생 및 비동기 API 통신 완수를 위해 대기
        
        # 브라우저 성능 로그 가져오기
        logs = driver.get_log('performance')
        found_urls = []
        
        print("\n--- 캡처된 스트리밍 및 영상 관련 네트워크 링크 ---")
        for entry in logs:
            log_data = json.loads(entry['message'])['message']
            
            # 네트워크 요청 보낸 이벤트 필터링
            if log_data['method'] == 'Network.requestWillBeSent':
                req_url = log_data['params']['request']['url']
                
                # SOOP의 방송 정보 API 쿼리나 m3u8 동영상 스트리밍 주소 매칭
                if 'broadinfo' in req_url or 'live-str' in req_url or '.m3u8' in req_url:
                    print(f"🔗 발견된 주소: {req_url}")
                    found_urls.append(req_url)
                    
        if not found_urls:
            print("[알림] 조건에 맞는 스트리밍 관련 API 패킷이나 M3U8 주소를 찾지 못했습니다.")
            print("[팁] 해당 BJ가 현재 실제로 '라이브 방송 중'인지 확인해 주세요.")
            
    except Exception as e:
        print(f"[에러 발생] {e}")
    finally:
        driver.quit()
        print("[정보] 브라우저 세션을 안전하게 종료했습니다.")

if __name__ == "__main__":
    # 테스트용 BJ ID (현재 실제로 방송 중인 BJ 아이디로 바꾸어 테스트하시면 더 정확합니다)
    TEST_BJ_ID = "kboglobal1" 
    extract_soop_stream(TEST_BJ_ID)