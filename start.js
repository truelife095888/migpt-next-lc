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
            // 打断小爱原有回复
            await engine.speaker.abortXiaoAI();

            // 获取 AI 回复
            const { text } = await engine.askAI(msg);
            console.log(`🔊 AI 回复: ${text}`);

            // 播放 TTS
            const [cmd1, cmd2] = engine.config.ttsCmd;
            await engine.MiOT.doAction(cmd1, cmd2, text);

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
