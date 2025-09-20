import 'dotenv/config';

export default {
  speaker: {
    userId: process.env.MI_USERID,
    password: process.env.MI_PASSWORD,
    did: process.env.MI_DID,
    passToken: process.env.MI_PASSTOKEN,
    timeout: 30000, // 增加超时时间到30秒
    retryTimes: 3,   // 重试次数
    enableInterrupt: true, // 启用打断功能
  },
  openai: {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    baseURL: process.env.OPENAI_BASEURL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_APIKEY,
    timeout: 30000,  // 增加AI请求超时时间
  },
  prompt: {
    system: '你是一个智能助手，请根据用户的问题给出回答。',
  },
  callAIKeywords: ['AI', '小爱', '智能'],
  ttsCmd: [parseInt(process.env.TTS_CMD1 || '5'), parseInt(process.env.TTS_CMD2 || '3')],
};
