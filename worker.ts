import { prisma } from './lib/prisma';
import { decrypt } from './lib/crypto'; // Make sure to export decrypt from your crypto file
import { createHarajClient } from './lib/harajClient';
import schedule from 'node-schedule';

const CLIENT_ID = 'qfzMh1Jv-xS5c-HeaS-0qW7-fL2i82kKw4Otv3';
const VERSION = 'N0.0.1 , 2025-12-30 15/';
const URL = `https://graphql.haraj.com.sa/?clientId=${CLIENT_ID}&version=${encodeURIComponent(VERSION)}`;

console.log("🤖 Haraj Background Worker is standing by...");

// Run every minute to check the schedule
schedule.scheduleJob('* * * * *', async () => {
    const now = new Date();
    const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                        now.getMinutes().toString().padStart(2, '0');

    try {
        const users = await prisma.harajUser.findMany({
            where: { scheduleTime: currentTime }
        });

        if (users.length === 0) return;
        for (const user of users) {
        console.log(`[${currentTime}] Starting update for ${user.username}`);

        const client = createHarajClient(`user_${user.id}`); // Sticky IP لكل مستخدم
        const password = decrypt(user.passwordEncrypted);

        // LOGIN
        const loginRes = await client.post(URL, {
            operationName: "login",
            query: `mutation login($username: String!, $password: String!, $oldToken: String!) {
            login(username: $username, password: $password, oldRefreshToken: $oldToken) {
                accessToken
            }
            }`,
            variables: {
            username: user.username,
            password,
            oldToken: ''
            }
        }, {
            headers: {
            lastrequestid: `${Date.now()}:12345:17656728439974861111691665`,
            }
        });

        const token = loginRes.data?.data?.login?.accessToken;
        if (!token) {
            console.log(`❌ Failed to login ${user.username}`);
            continue;
        }

        // UPDATE POSTS
        for (const postId of user.postIds) {
            const updateRes = await client.post(URL, {
            operationName: "updatePost",
            query: `mutation updatePost($token: String!, $id: Int!) {
                updatePost(token: $token, id: $id) {
                status
                notValidReason
                }
            }`,
            variables: {
                token,
                id: parseInt(postId)
            }
            }, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
            });

            const result = updateRes.data?.data?.updatePost;
            const ok =
            result?.status === 1 ||
            result?.status === 200 ||
            result?.status === true ||
            String(result?.status).toLowerCase() === 'true';

            if (!ok) {
            console.log(`❌ Post ${postId}: ${result?.notValidReason}`);
            } else {
            console.log(`✅ Post ${postId}: Success`);
            }
        }

        await prisma.harajUser.update({
            where: { id: user.id },
            data: { lastRunDate: new Date() }
        });
        }

    } catch (err) {
        console.error("Worker Error:", err);
    }
});