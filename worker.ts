import { prisma } from './lib/prisma';
import { decrypt } from './lib/crypto';
import { createHarajClient } from './lib/harajClient';
import schedule from 'node-schedule';

const URL = `https://graphql.haraj.com.sa/?clientId=qfzMh1Jv-xS5c-HeaS-0qW7-fL2i82kKw4Otv3&version=N0.0.1`;

schedule.scheduleJob('*/5 * * * *', async () => {
  const now = new Date();
  
  let hours = now.getHours();
  let minutes = now.getMinutes();

  // Rounding to nearest 5 to match the DB "Clean Time"
  const roundedMinutes = Math.round(minutes / 5) * 5;
  
  if (roundedMinutes === 60) {
    minutes = 0;
    hours = (hours + 1) % 24;
  } else {
    minutes = roundedMinutes;
  }

  const fixedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

  console.log(`⏰ Worker Triggered. System Time: ${now.getHours()}:${now.getMinutes()}. Searching for: ${fixedTime}`);

  const users = await prisma.harajUser.findMany({
    where: { scheduleTime: fixedTime },
  });

  for (const user of users) {
    console.log(`🤖 Updating account: ${user.username}`);
    const client = createHarajClient(`job_${user.id}`, true);
    const password = decrypt(user.passwordEncrypted);

    try {
      const login = await client.post(URL, {
        operationName: 'login',
        query: `
          mutation login($username: String!, $password: String!, $oldToken: String!) {
            login(username: $username, password: $password, oldRefreshToken: $oldToken) {
              accessToken
            }
          }
        `,
        variables: { username: user.username, password, oldToken: '' },
      });

      const token = login.data?.data?.login?.accessToken;
      if (!token) continue;

      for (const postId of user.postIds) {
        const res = await client.post(
          URL,
          {
            operationName: 'republishPost',
            query: `
              mutation republishPost($id: Number!) {
                republishPost(id: $id) { status message }
              }
            `,
            variables: { id: parseInt(postId) },
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        console.log(`   - Post ${postId}: ${res.data?.data?.republishPost?.status}`);
        await new Promise(r => setTimeout(r, 5000));
      }

      await prisma.harajUser.update({
        where: { id: user.id },
        data: { lastRunDate: new Date() },
      });
    } catch (e) {
      console.error(`Error for ${user.username}:`, e);
    }
  }
});
