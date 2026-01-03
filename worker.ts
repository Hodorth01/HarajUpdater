import { prisma } from './lib/prisma';
import { decrypt } from './lib/crypto'; // Make sure to export decrypt from your crypto file
import axios from 'axios';
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
            
            const password = decrypt(user.passwordEncrypted);
            
            // 1. Login to get fresh token
            const loginRes = await axios.post(URL, {
                operationName: "login",
                query: `mutation login($username: String!, $password: String!, $oldToken: String!) {
                    login(username: $username, password: $password, oldRefreshToken: $oldToken) { accessToken }
                }`,
                variables: { username: user.username, password, oldToken: '' }
            }, {
                headers: {
                    'User-Agent': 'Mozilla/5.0...',
                    'lastrequestid': `${Date.now()}:12345:17656728439974861111691665`
                }
            });

            const token = loginRes.data?.data?.login?.accessToken;
            if (!token) {
                console.log(` Failed to login user ${user.username}`);
                continue;
            }

           // 2. Update all posts for this user
            for (const postId of user.postIds) {
                const updateRes = await axios.post(URL, {
                    operationName: "updatePost",
                    query: `mutation updatePost($token: String!, $id: Int!) {
                        updatePost(token: $token, id: $id) { 
                            status 
                            notValidReason
                        }
                    }`,
                    variables: { token, id: parseInt(postId) }
                }, {
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                        'Content-Type': 'application/json'
                    }
                });

                const result = updateRes.data?.data?.updatePost;
                const status = result?.status;
                // Cast status to Number to handle both "1" and 1
                const isSuccess = status === 1 || status === 200 || status === true || String(status).toLowerCase() === 'true';
                

                if (!isSuccess) {
                    const reason = result?.notValidReason || "Unknown Error/Cooldown";
                    console.log(` ❌ Post ${postId}: Failed. Reason: ${reason}`);
                } else {
                    console.log(`✅ Post ${postId}: Success`);
                }
            }
            // 3. Mark last run date in DB
            await prisma.harajUser.update({
                where: { id: user.id },
                data: { lastRunDate: new Date() }
            });
        }
    } catch (err) {
        console.error("Worker Error:", err);
    }
});