# ⛏️ Bitaxe Mining Monitor Bot (v2.0)

로컬 네트워크(`192.168.x.x`) 내의 **Bitaxe ASIC 채굴기**들을 자동으로 스캔하고, 디스코드에서 통합 관리 및 제어할 수 있는 봇입니다.

## ✨ 주요 기능 (Key Features)

* **자동 범위 스캔**: 설정된 IP 대역(`RANGE_START` ~ `RANGE_END`)을 자동으로 탐색하여 기기 상태를 수집합니다.
* **실시간 상태 확인 (`/상태`)**:
    * **개별 기기**: 호스트명, 해시레이트(TH/s), 온도(°C), 전력(W), Accepted Shares 정보를 실시간으로 표시합니다.
    * **통계 집계**: 온라인인 모든 기기의 총 해시레이트, 평균 온도, 총 전력 소모량을 자동 계산하여 하단에 요약합니다.
* **스마트 원격 제어 (`/재시작`)**:
    * **일반 모드**: 옵션 없이 실행 시 현재 온라인 상태인 기기들만 선별하여 안전하게 재시작합니다.
    * **특정 기기 지정**: `번호` 옵션에 IP 뒷자리를 입력하여 특정 기기만 핀포인트로 재시작합니다.
    * **강제 모드 (`force`)**: 기기가 응답이 없는 먹통 상태일 때, 상태 체크를 무시하고 해당 범위 전체에 재시작 패킷을 전송합니다.

## ⚙️ 환경 설정 (Configuration)

### 1. 환경 변수 (`.env`)
프로젝트 루트에 `.env` 파일을 생성하고 디스코드 봇 정보를 입력하세요.

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_server_id_here
```

### 2. 네트워크 스캔 설정
코드 내에서 본인의 공유기 환경에 맞는 IP 대역을 설정합니다.

```javascript
const SUBNET_PREFIX = "[http://192.168.68](http://192.168.68)"; // 본인의 서브넷 주소
const RANGE_START = 100;                 // 스캔 시작 번호
const RANGE_END = 110;                   // 스캔 종료 번호
```

## 🚀 실행 방법 (Deployment)
방법 1: Docker Compose (권장)
로컬 네트워크 장치와 통신하기 위해 network_mode: host 설정이 필수적입니다.

```
# 빌드 및 백그라운드 실행
docker compose up -d --build

# 실시간 로그 확인
docker compose logs -f
```

## 📝 License
This project is licensed under the MIT License.