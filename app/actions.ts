'use server';

import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { createHarajClient } from '@/lib/harajClient';

const CLIENT_ID = 'qfzMh1Jv-xS5c-HeaS-0qW7-fL2i82kKw4Otv3';
const VERSION = 'N0.0.1 , 2025-12-30 15/';
const HARAJ_BASE_URL = `https://graphql.haraj.com.sa/?clientId=${CLIENT_ID}&version=${encodeURIComponent(VERSION)}`;

/**
 * Authenticates user and retrieves their active ads
 */
export async function getHarajAccountData(formData: FormData) {
  const username = (formData.get('username') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();
  const client = createHarajClient(`fetch_${username}`);

  try {
    // 1. Perform Login
    const loginRes = await client.post(HARAJ_BASE_URL, {
      operationName: 'login',
      query: `mutation login($username: String!, $password: String!, $oldToken: String!) {
        login(username: $username, password: $password, oldRefreshToken: $oldToken) {
          accessToken
        }
      }`,
      variables: { username, password, oldToken: '' }
    });

    const token = loginRes.data?.data?.login?.accessToken;
    if (!token) return { error: loginRes.data?.data?.login?.message || 'Invalid Credentials' };

    // 2. Fetch User Ads
    const postsRes = await client.post('', {
      operationName: 'FetchAds',
      query: `query FetchAds($authorUsername: String!, $page: Int!) {
        posts(authorUsername: $authorUsername, page: $page, limit: 40) {
          items { id title thumbURL }
        }
      }`,
      variables: { authorUsername: username, page: 0 }
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return { 
      success: true, 
      posts: postsRes.data?.data?.posts?.items || [],
      username,
      password 
    };
  } catch (err) {
    return { error: 'Connection to Haraj failed. Check proxy settings.' };
  }
}

/**
 * Saves bot configuration and rounds schedule time to the nearest 5-minute interval
 */
export async function saveHarajBotConfig(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const postIds = (formData.get('postIds') as string).split(',').filter(Boolean);
  const rawTime = formData.get('time') as string;

  // Round time to nearest 5 minutes for consistency
  let [h, m] = rawTime.split(':').map(Number);
  const roundedM = Math.round(m / 5) * 5;
  
  if (roundedM === 60) {
    m = 0;
    h = (h + 1) % 24;
  } else {
    m = roundedM;
  }

  const cleanTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;

  try {
    await prisma.harajUser.upsert({
      where: { username },
      update: {
        passwordEncrypted: encrypt(password),
        postIds,
        scheduleTime: cleanTime, 
      },
      create: {
        username,
        passwordEncrypted: encrypt(password),
        postIds,
        scheduleTime: cleanTime, 
      }
    });
    return { success: true };
  } catch (e) {
    console.error("Database Error:", e);
    return { error: 'Critical error saving configuration.' };
  }
}