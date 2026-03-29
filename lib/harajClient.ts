import 'dotenv/config';
import axios from 'axios';


export function createHarajClient(sessionId: string) {

  return axios.create({
    baseURL:'https://graphql.haraj.com.sa/',
    timeout: 30000,
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
