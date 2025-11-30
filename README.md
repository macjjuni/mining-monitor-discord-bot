# ⛏️ Bitaxe Mining Monitor Bot

로컬 네트워크(`192.168.x.x`)에 있는 **Bitaxe ASIC 채굴기**들의 상태를 디스코드에서 실시간으로 모니터링하는 봇입니다.

## ✨ 기능 (Features)
* **실시간 상태 확인**: `/상태` 명령어로 모든 기기의 해시레이트, 온도, 전력 소모량 조회
* **통계 집계**: 전체 해시레이트(Total TH/s), 총 전력(W), 평균 온도 자동 계산
* **상태 감지**: 기기가 오프라인일 경우 연결 실패 표시
* **Docker 지원**: `host` 네트워크 모드를 사용하여 컨테이너에서 로컬망 채굴기 직접 접근

## 🛠️ 기술 스택 (Tech Stack)
* **Node.js** (v18+)
* **Discord.js** (v14)
* **Docker & Docker Compose**

## ⚙️ 설정 (Configuration)

### 1. 환경 변수 설정
프로젝트 루트에 `.env` 파일을 생성하고 다음 정보를 입력하세요.

```env
DISCORD_TOKEN=your_bot_token_here
CLIENT_ID=your_application_id_here
GUILD_ID=your_server_id_here
```

### 2. 채굴기 IP 등록

bitaxe.js 파일을 열어 모니터링할 Bitaxe 기기의 IP 주소를 수정합니다.

```javascript
// bitaxe.js
const servers = [
"[http://192.168.68.104](http://192.168.68.104)",
"[http://192.168.68.100](http://192.168.68.100)",
// 추가 가능
];
```

## 🚀 실행 방법 (Deployment)
이 봇은 로컬 네트워크 접근이 필요하므로 Docker (Host Network) 방식을 권장합니다.

방법 1: Docker Compose (권장)
서버에 Docker가 설치되어 있다면 가장 간편한 방법입니다.

```bash
# 1. 실행 (빌드 및 백그라운드 실행)
docker compose up -d --build

# 2. 로그 확인
docker compose logs -f
```

방법 2: Node.js (로컬 개발)
개발 환경에서 직접 실행할 때 사용합니다.
```bash
# 1. 의존성 설치
npm install

# 2. 봇 실행
node bot.js
```

## 💬 디스코드 명령어 (Commands)
| 명령어 | 설명 |
| :--- | :--- |
| `/상태` | 연결된 모든 Bitaxe 채굴기의 상세 정보와 Total 통계를 보여줍니다. |


## 📝 License

This project is licensed under the MIT License.