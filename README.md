# MM Bot - 디스코드 봇

로컬 서버에서 데이터를 조회하여 디스코드로 응답을 보내는 봇입니다.

## 설치 방법

1. 의존성 설치:
```bash
npm install
```

2. 환경 변수 설정:
```bash
cp .env.example .env
```

`.env` 파일을 열어서 다음 정보를 입력하세요:
- `DISCORD_TOKEN`: 디스코드 봇 토큰
- `CLIENT_ID`: 디스코드 클라이언트 ID
- `LOCAL_SERVER_URL`: 로컬 서버 URL (기본값: http://localhost:3000)
- `USE_MOCK_DATA`: 테스트 모드 (선택사항, `true`로 설정하면 항상 샘플 데이터 반환)

## 실행 방법

```bash
npm start
```

## 사용 방법

### 슬래시 커맨드

- `/조회 [endpoint]`: 로컬 서버에서 데이터를 조회합니다
  - 예: `/조회` 또는 `/조회 /api/users`
- `/핑`: 봇의 응답 시간을 확인합니다

### 메시지 명령어

- `!데이터`: 기본 엔드포인트(`/api/data`)에서 데이터를 조회합니다

## 로컬 서버 예시

로컬 서버가 다음과 같은 엔드포인트를 제공한다고 가정합니다:

```javascript
// 예시: Express 서버
app.get('/api/data', (req, res) => {
    res.json({
        message: 'Hello from local server!',
        timestamp: new Date().toISOString(),
        data: { /* your data */ }
    });
});
```

## 주의사항

- 로컬 서버가 실행 중이어야 합니다
- `.env` 파일에 올바른 토큰과 클라이언트 ID가 설정되어 있어야 합니다
- 디스코드 봇이 서버에 초대되어 있어야 합니다

