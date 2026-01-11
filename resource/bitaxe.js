// [설정] 네트워크 대역 및 스캔 범위
const SUBNET_PREFIX = "http://192.168.68";
const RANGE_START = 100; // 스캔 시작 번호 (예: 100)
const RANGE_END = 110;   // 스캔 끝 번호 (예: 110)

const ABORT_CONTROL_TIME = 700;

/**
 * 개별 IP 체크 함수 (타임아웃 500ms)
 */
const checkMiner = async (ipSuffix) => {
    const url = `${SUBNET_PREFIX}.${ipSuffix}`;
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), ABORT_CONTROL_TIME);

        const res = await fetch(`${url}/api/system/info`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) return null;

        const data = await res.json();

        return {
            status: 'online',
            url: url,
            hostname: data.hostname || `Bitaxe-${ipSuffix}`,
            hashRate: Number(data.hashRate) / 1000,
            temp: Number(data.temp),
            sharesAccepted: Number(data.sharesAccepted),
            power: Number(data.power)
        };
    } catch (e) {
        return null;
    }
};

/**
 * 지정된 범위(START ~ END)만 스캔
 */
const getBitaxeStats = async () => {
    // console.log(`🔍 스캔 범위: ${SUBNET_PREFIX}.${RANGE_START} ~ .${RANGE_END}`);

    const promises = [];
    // 시작 번호부터 끝 번호까지 루프
    for (let i = RANGE_START; i <= RANGE_END; i++) {
        promises.push(checkMiner(i));
    }

    const results = await Promise.all(promises);
    const activeMiners = results.filter(miner => miner !== null);

    if (activeMiners.length === 0) {
        return [{
            status: 'offline',
            url: 'Scan Failed',
            hostname: 'No Miners Found',
            hashRate: 0, temp: 0, sharesAccepted: 0, power: 0
        }];
    }

    return activeMiners.sort((a, b) => {
        const ipA = parseInt(a.url.split('.').pop());
        const ipB = parseInt(b.url.split('.').pop());
        return ipA - ipB;
    });
};


/**
 * 개별 마이너 재시작 요청
 */
const restartMiner = async (url) => {
    try {
        const res = await fetch(`${url}/api/system/restart`, {
            method: 'POST',
        });
        return res.ok;
    } catch (e) {
        return false;
    }
};

/**
 * 활성화된 모든 마이너 재시작
 */
const restartAllMiners = async () => {
    // 1. 먼저 현재 온라인인 마이너들을 찾습니다.
    const stats = await getBitaxeStats();
    const onlineNodes = stats.filter(s => s.status === 'online');

    if (onlineNodes.length === 0) return { success: 0, total: 0 };

    // 2. 각 온라인 노드에 재시작 명령 전송
    const results = await Promise.all(
        onlineNodes.map(node => restartMiner(node.url))
    );

    return {
        success: results.filter(r => r === true).length,
        total: onlineNodes.length
    };
};

/**
 * 특정 IP에 무조건 재시작 신호 발송
 */
const forceRestartById = async (ipSuffix) => {
    const url = `${SUBNET_PREFIX}.${ipSuffix}`;
    return await restartMiner(url);
};

/**
 * 범위 내의 모든 IP에 상태 체크 없이 재시작 신호 발송
 */
const forceRestartAll = async () => {
    const promises = [];
    for (let i = RANGE_START; i <= RANGE_END; i++) {
        const url = `${SUBNET_PREFIX}.${i}`;
        promises.push(restartMiner(url));
    }
    const results = await Promise.all(promises);
    return {
        success: results.filter(r => r === true).length,
        total: RANGE_END - RANGE_START + 1
    };
};



module.exports = {
    getBitaxeStats,
    restartAllMiners,
    forceRestartById,
    forceRestartAll
};