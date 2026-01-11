import 'dotenv/config';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';


export function createHarajClient(sessionId: string) {
  const host = process.env.HARAJ_PROXY_HOST!;
  const port = process.env.HARAJ_PROXY_PORT!;
  const user = process.env.HARAJ_PROXY_USER!;
  const pass = process.env.HARAJ_PROXY_PASS!;

  const proxyUser = `${user}-sessid-${sessionId}-sessTime-10`;
  const proxyUrl = `http://${proxyUser}:${pass}@${host}:${port}`;

  const agent = new HttpsProxyAgent(proxyUrl);

  return axios.create({
    baseURL:'https://graphql.haraj.com.sa/',
    timeout: 30000,
    httpAgent: agent,
    httpsAgent: agent,
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Linux; Android 13; SM-S918B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      'Accept-Language': 'ar-SA,ar;q=0.9',
      'Content-Type': 'application/json',
      'Origin': 'https://haraj.com.sa',
      'Referer': 'https://haraj.com.sa/',
    },
  });
}
