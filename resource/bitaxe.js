const servers = [
    "http://192.168.68.101",
    "http://192.168.68.100"
];

const fetchOne = async (baseUrl) => {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const res = await fetch(`${baseUrl}/api/system/info`, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

        const data = await res.json();

        return {
            status: 'online',
            url: baseUrl,
            hostname: data.hostname,
            // 여기서 toFixed를 쓰지 않고 숫자 그대로 반환 (계산을 위해)
            hashRate: Number(data.hashRate) / 1000, // GH/s -> TH/s
            temp: Number(data.temp),
            sharesAccepted: Number(data.sharesAccepted),
            power: Number(data.power)
        };

    } catch (error) {
        return {
            status: 'offline',
            url: baseUrl,
            hostname: 'Unknown',
            error: error.message,
            // 오프라인일 때 계산 오류 방지를 위한 기본값
            hashRate: 0,
            temp: 0,
            sharesAccepted: 0,
            power: 0
        };
    }
};

const getBitaxeStats = async () => {
    return await Promise.all(servers.map(url => fetchOne(url)));
};

module.exports = { getBitaxeStats };