import 'dotenv/config';
import express from 'express';
import { MiGPT } from '@mi-gpt/next';
import config from './config.js';

const PORT = process.env.PORT || 3000;
const app = express();

// 健康检查端点
app.get('/', (req, res) => res.send('MiGPT-Next 服务运行中'));
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/kaithheathcheck', (req, res) => res.json({ status: 'ok' })); // Leapcell 健康检查

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🌐 服务已启动，监听端口 ${PORT}`);
});

async function main() {
  try {
    console.log('🚀 正在初始化 MiGPT...');

    await MiGPT.start({
      ...config,
      async onMessage(engine, msg) {
        try {
          if (engine.config.callAIKeywords.some((e) => msg.text.startsWith(e))) {
            console.log(`📝 收到触发词: ${msg.text}`);

            // 立即打断小爱原有回复 - 强制打断
            console.log('⏹️ 正在强制打断小爱回复...');

            // 多重打断策略
            try {
              await engine.speaker.abortXiaoAI();
              console.log('✅ 第一次打断完成');
            } catch (abortError) {
              console.log('⚠️ 第一次打断失败，尝试其他方法');
            }

            // 等待确保打断成功
            await new Promise(resolve => setTimeout(resolve, 800));

            // 再次确保打断
            try {
              await engine.speaker.abortXiaoAI();
              console.log('✅ 二次打断确认');
            } catch (abortError2) {
              console.log('⚠️ 二次打断失败，继续执行');
            }

            // 获取 AI 回复
            console.log('🤖 正在获取 AI 回复...');
            const { text } = await engine.askAI(msg);
            console.log(`🔊 AI 回复: ${text}`);

            // 播放 TTS - 添加更多日志和错误处理
            console.log('🎵 正在播放 TTS...');
            const [cmd1, cmd2] = engine.config.ttsCmd;
            console.log(`🎵 TTS 命令: ${cmd1}, ${cmd2}`);

            try {
              await engine.MiOT.doAction(cmd1, cmd2, text);
              console.log('✅ TTS 播放成功');
            } catch (ttsError) {
              console.error('❌ TTS 播放失败:', ttsError.message);

              // 尝试备用方法1: 使用 speaker.speak
              try {
                console.log('🔄 尝试备用 TTS 方法1...');
                await engine.speaker.speak(text);
                console.log('✅ 备用方法1播放成功');
              } catch (speakError) {
                console.error('❌ 备用方法1失败:', speakError.message);

                // 尝试备用方法2: 使用不同的TTS命令
                try {
                  console.log('🔄 尝试备用 TTS 方法2...');
                  await engine.MiOT.doAction(5, 1, text); // 使用不同的命令组合
                  console.log('✅ 备用方法2播放成功');
                } catch (altTtsError) {
                  console.error('❌ 所有TTS方法都失败了:', altTtsError.message);
                }
              }
            }

            return { handled: true };
          }
        } catch (msgError) {
          console.error('❌ 消息处理失败:', msgError.message);
          return { handled: false };
        }
      },
    });

    console.log('✅ MiGPT 启动成功');
  } catch (err) {
    console.error('❌ MiGPT 启动失败:', err.message);

    // 如果是网络错误，不要退出进程，让服务继续运行
    if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
      console.log('⚠️ 网络连接问题，服务将继续运行，稍后会重试连接');

      // 定时重试连接
      setTimeout(() => {
        console.log('🔄 重试连接...');
        main();
      }, 60000); // 60秒后重试

      return;
    }

    // 其他错误，退出进程
    process.exit(1);
  }
}

// 延迟启动 MiGPT，确保 HTTP 服务先运行
setTimeout(() => {
  main();
}, 3000);
