import 'dotenv/config';
import express from 'express';
import { MiGPT } from '@mi-gpt/next';
import config from './config.js';

const PORT = process.env.PORT || 3000;
const app = express();
app.get('/', (req, res) => res.send('MiGPT-Next 服务运行中'));
app.listen(PORT, () => console.log(`🌐 服务已启动，监听端口 ${PORT}`));

async function main() {
  await MiGPT.start({
    ...config,
    async onMessage(engine, msg) {
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
    },
  });
}

main().catch((err) => {
  console.error('启动失败:', err);
  process.exit(1);
});
