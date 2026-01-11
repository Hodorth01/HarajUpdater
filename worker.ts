import { prisma } from './lib/prisma';
import { decrypt } from './lib/crypto';
import { createHarajClient } from './lib/harajClient';
import schedule from 'node-schedule';

const CLIENT_ID = 'qfzMh1Jv-xS5c-HeaS-0qW7-fL2i82kKw4Otv3';
const VERSION = 'N0.0.1 , 2025-12-30 15/';
const HARAJ_GQL_URL = `https://graphql.haraj.com.sa/?clientId=${CLIENT_ID}&version=${encodeURIComponent(VERSION)}`;

/**
 * Background worker: executed every 5 minutes
 */
schedule.scheduleJob('*/5 * * * *', async () => {
  const now = new Date();
  let hours = now.getHours();
  let minutes = now.getMinutes();

  // Rounding minutes to the nearest 5-minute block
  const roundedM = Math.round(minutes / 5) * 5;
  if (roundedM === 60) {
    minutes = 0;
    hours = (hours + 1) % 24;
  } else {
    minutes = roundedM;
  }

  const searchTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;

  try {
    const users = await prisma.harajUser.findMany({
      where: { scheduleTime: searchTime },
    });

    if (users.length === 0) return;

    for (const user of users) {
      console.log(`🤖 Processing: ${user.username}`);
      
      const client = createHarajClient(`user_${user.id}`);
      const password = decrypt(user.passwordEncrypted);

      try {
        // 1. Authentication
        const loginRes = await client.post(HARAJ_GQL_URL, {
          operationName: "login",
          query: `mutation login($username: String!, $password: String!, $oldToken: String!) {
            login(username: $username, password: $password, oldRefreshToken: $oldToken) {
              accessToken
            }
          }`,
          variables: { username: user.username, password, oldToken: '' }
        }, {
          headers: { lastrequestid: `${Date.now()}:worker:automation` }
        });

        const token = loginRes.data?.data?.login?.accessToken;
        if (!token) {
          console.error(`❌ Login failed for ${user.username}`);
          continue;
        }

        // 2. Post Updates
        for (const postId of user.postIds) {
          const res = await client.post('', {
            operationName: 'updatePost',
            query: `mutation updatePost($token: String!, $id: Int!) {
              updatePost(token: $token, id: $id) {
                status
                notValidReason
              }
            }`,
            variables: { token, id: parseInt(postId) }
          }, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          const updateStatus = res.data?.data?.updatePost
          const isSuccess = updateStatus.status == true 
          console.log(`${isSuccess ? '✅' : '❌'} Post ${postId}: ${isSuccess ? 'Updated' : updateStatus?.notValidReason || 'Failed'}`);

          // Throttle requests
          await new Promise(r => setTimeout(r, 3000));
        }

        // 3. Update execution timestamp
        await prisma.harajUser.update({
          where: { id: user.id },
          data: { lastRunDate: new Date() },
        });

      } catch (userErr: any) {
        console.error(`Error processing ${user.username}:`, userErr.message);
      }
    }
  } catch (dbErr) {
    console.error("Worker Database Error:", dbErr);
  }
});