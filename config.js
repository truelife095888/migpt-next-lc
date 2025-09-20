import 'dotenv/config';

export default {
  speaker: {
    userId: process.env.MI_USERID,
    password: process.env.MI_PASSWORD,
    did: process.env.MI_DID,
    passToken: process.env.MI_PASSTOKEN,
  },
  openai: {
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    baseURL: process.env.OPENAI_BASEURL || 'https://api.openai.com/v1',
    apiKey: process.env.OPENAI_APIKEY,
  },
  prompt: {
    system: '你是一个智能助手，请根据用户的问题给出回答。',
  },
  callAIKeywords: ['AI', '小爱', '智能'],
  ttsCmd: [parseInt(process.env.TTS_CMD1 || '5'), parseInt(process.env.TTS_CMD2 || '1')],
};
