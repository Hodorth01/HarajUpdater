'use server';

import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { createHarajClient } from '@/lib/harajClient';

/**
 * STEP 1: Login and fetch ads to show the user
 */
export async function getHarajAccountData(formData: FormData) {
  const username = (formData.get('username') as string)?.trim();
  const password = (formData.get('password') as string)?.trim();

  const client = createHarajClient(`fetch_${username}`, true);

  try {
    const loginRes = await client.post('', {
      operationName: 'login',
      query: `mutation login($username: String!, $password: String!, $oldToken: String!) {
          login(username: $username, password: $password, oldRefreshToken: $oldToken) {
            accessToken
            message
          }
      }`,
      variables: { username, password, oldToken: '' }
    });

    const token = loginRes.data?.data?.login?.accessToken;
    if (!token) return { error: loginRes.data?.data?.login?.message || 'Invalid Credentials' };

    const postsRes = await client.post('', {
      operationName: 'FetchAds',
      query: `query FetchAds($authorUsername: String!, $page: Int!) {
          posts(authorUsername: $authorUsername, page: $page, limit: 40) {
            items {
              id
              title
              thumbURL
            }
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
    return { error: 'Connection to Haraj failed. Check proxy.' };
  }
}

/**
 * STEP 2: Save the selected ads and time to DB (With Rounding)
 */
export async function saveHarajBotConfig(formData: FormData) {
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const postIds = (formData.get('postIds') as string).split(',').filter(Boolean);
  const rawTime = formData.get('time') as string; // Format: "HH:mm"

  // --- ROUNDING LOGIC FOR CLEAN DATA ---
  let [h, m] = rawTime.split(':').map(Number);
  
  // Round to nearest 5 minutes
  const roundedM = Math.round(m / 5) * 5;
  
  if (roundedM === 60) {
    m = 0;
    h = (h + 1) % 24;
  } else {
    m = roundedM;
  }

 
  const cleanTime = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;

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
    console.error("DB Save Error:", e);
    return { error: 'Failed to save to database.' };
  }
}