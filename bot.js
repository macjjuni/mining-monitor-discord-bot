const {Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, Events} = require('discord.js');
const {
    getBitaxeStats,
    restartAllMiners,
    forceRestartById,
    forceRestartAll
} = require('./resource/bitaxe');
require('dotenv').config();

// --- 1. 설정 및 Mock API ---
const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID; // 개발용: 즉시 반영을 위해 특정 서버 ID 사용

const client = new Client({intents: [GatewayIntentBits.Guilds]});


const commands = [
    new SlashCommandBuilder().setName('상태').setDescription('상태 확인'),
    new SlashCommandBuilder()
        .setName('재시작')
        .setDescription('기기를 재시작합니다.')
        .addIntegerOption(option =>
            option.setName('번호')
                .setDescription('재시작할 IP 뒷자리 번호 (입력 안하면 전체 재시작)')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('강제')
                .setDescription('상태 체크를 무시하고 무조건 신호를 보냅니다.')
                .setRequired(false))
].map(command => command.toJSON());


const registerCommands = async () => {
    const rest = new REST({version: '10'}).setToken(TOKEN);
    try {
        console.log('slash command 등록(갱신) 시작...');
        await rest.put(
            Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID),
            {body: commands},
        );
        console.log('slash command 등록 완료!');
    } catch (error) {
        console.error('명령어 등록 실패:', error);
    }
};

// --- 4. 이벤트 핸들러 ---
client.once(Events.ClientReady, async c => {
    console.log(`로그인 완료: ${c.user.tag}`);
    // 봇이 켜질 때 명령어 등록 실행 (개발 편의성 위함)
    await registerCommands();
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    if (interaction.commandName === '상태') {
        await interaction.deferReply();

        try {
            // 배열로 된 결과 데이터를 받아옴
            const stats = await getBitaxeStats();

            // 1. 온라인 노드 필터링
            const onlineNodes = stats.filter(s => s.status === 'online');

            // 2. 합계/평균 계산 (데이터가 숫자이므로 바로 연산 가능)
            const totalHash = onlineNodes.reduce((acc, cur) => acc + cur.hashRate, 0);
            const totalPower = onlineNodes.reduce((acc, cur) => acc + cur.power, 0);
            const totalShares = onlineNodes.reduce((acc, cur) => acc + cur.sharesAccepted, 0);
            const avgTemp = onlineNodes.length > 0
                ? onlineNodes.reduce((acc, cur) => acc + cur.temp, 0) / onlineNodes.length
                : 0;

            // 3. 개별 리스트 메시지 생성 (여기서 포맷팅 수행)
            const listMessage = stats.map(s => {
                if (s.status === 'offline') return `🔴 **${s.url}**: 연결 실패`;

                // 포맷팅 적용
                const hashStr = s.hashRate.toFixed(3); // 소수점 3자리
                const tempStr = s.temp.toFixed(1);     // 소수점 1자리
                const powerStr = s.power.toFixed(1);   // 소수점 1자리
                const shareStr = s.sharesAccepted.toLocaleString('ko-KR'); // 3자리 콤마

                return `🟢 **${s.hostname}** | ⛏️ ${hashStr} TH/s | 🌡️ ${tempStr}°C | ⚡ ${powerStr}W | ✅ ${shareStr}`;
            });

            // 4. 최종 결과 조립
            const resultMessage = [
                ...listMessage,
                '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
                `📊 **Total** | ⛏️ ${totalHash.toFixed(3)} TH/s | 🌡️ ${avgTemp.toFixed(1)}°C (Avg) | ⚡ ${totalPower.toFixed(1)}W | ✅ ${totalShares.toLocaleString('ko-KR')}`
            ].join('\n');

            await interaction.editReply(resultMessage);
        } catch (error) {
            console.error(error)
            await interaction.editReply('❌ 오류 발생');
        }
    }


    if (interaction.commandName === '재시작') {
        await interaction.deferReply();
        const targetId = interaction.options.getInteger('번호');
        const isForce = interaction.options.getBoolean('강제') || false;

        try {
            if (targetId) {
                // 1. 특정 기기 타겟 재시작
                const success = await forceRestartById(targetId);
                await interaction.editReply(success
                    ? `✅ **${targetId}** 번 기기에 재시작 신호를 보냈습니다.`
                    : `❌ **${targetId}** 번 기기 연결 실패 (완전 먹통일 수 있음)`);
            } else if (isForce) {
                // 2. 전체 강제 재시작 (상태 체크 생략)
                const result = await forceRestartAll();
                await interaction.editReply(`⚠️ **강제 재시작 실행**: ${result.success}/${result.total} 대 전송 시도`);
            } else {
                // 3. 기존의 안전한 재시작 (온라인인 것만)
                const result = await restartAllMiners();
                await interaction.editReply(`🔄 **일반 재시작**: ${result.success}/${result.total} 대 완료`);
            }
        } catch (error) {
            await interaction.editReply('❌ 실행 중 오류가 발생했습니다.');
        }
    }
});

client.login(TOKEN);