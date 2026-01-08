import 'dotenv/config';
import axios from 'axios';
import { HttpsProxyAgent } from 'https-proxy-agent';

const CLIENT_ID = 'qfzMh1Jv-xS5c-HeaS-0qW7-fL2i82kKw4Otv3';
const VERSION = 'N0.0.1 , 2025-12-30 15/';

export function createHarajClient(sessionId: string, isGraphQL = true) {
  const host = process.env.HARAJ_PROXY_HOST!;
  const port = process.env.HARAJ_PROXY_PORT!;
  const user = process.env.HARAJ_PROXY_USER!;
  const pass = process.env.HARAJ_PROXY_PASS!;

  const proxyUser = `${user}-sessid-${sessionId}-sessTime-10`;
  const proxyUrl = `http://${proxyUser}:${pass}@${host}:${port}`;

  const agent = new HttpsProxyAgent(proxyUrl);

  return axios.create({
    baseURL: isGraphQL
      ? `https://graphql.haraj.com.sa/?clientId=${CLIENT_ID}&version=${encodeURIComponent(VERSION)}`
      : '', // empty baseURL allows fetching full URLs like CDN images,
    timeout: 30000,
    httpAgent: agent,
    httpsAgent: agent,
    withCredentials: true,
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
