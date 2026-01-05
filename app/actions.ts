'use server'

import { prisma } from '@/lib/prisma';
import { encrypt } from '@/lib/crypto';
import { createHarajClient } from '@/lib/harajClient';

const CLIENT_ID = 'qfzMh1Jv-xS5c-HeaS-0qW7-fL2i82kKw4Otv3';
const VERSION = 'N0.0.1 , 2025-12-30 15/';
const URL = `https://graphql.haraj.com.sa/?clientId=${CLIENT_ID}&version=${encodeURIComponent(VERSION)}`;

export async function handleUserRegistration(formData: FormData) {
    const username = (formData.get('username') as string)?.trim();
    const password = (formData.get('password') as string)?.trim();
    const postIds = (formData.get('postIds') as string).split(',').map(id => id.trim());
    const time = formData.get('time') as string;

    try {
        const client = createHarajClient(`register_${username}`);

        const loginRes = await client.post(`${URL}&queryName=login`, {
            operationName: "login",
            query: `mutation login($username: String!, $password: String!, $oldToken: String!) {
                login(username: $username, password: $password, oldRefreshToken: $oldToken) {
                    accessToken, status, message
                }
            }`,
            variables: { username, password, oldToken: '' }
        }, {
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36',
                'lastrequestid': `${Date.now()}:${Math.floor(Math.random() * 1000000)}:17656728439974861111691665`,
                'Origin': 'https://haraj.com.sa',
                'Referer': 'https://haraj.com.sa/'
            }
        });

        const auth = loginRes.data?.data?.login;

        // FIXED LOGIC: Check if accessToken exists, regardless of if status is 1 or 200
        if (!auth || !auth.accessToken) {
            return { error: `Haraj Rejected: ${auth?.message || 'Check credentials'}` };
        }

        console.log("✅ Login Verified! Saving to Database...");

        // --- STEP 2: PRISMA SAVE (UPSERT) ---
        await prisma.harajUser.upsert({
            where: { username },
            update: {
                passwordEncrypted: encrypt(password),
                postIds: postIds,
                scheduleTime: time,
            },
            create: {
                username,
                passwordEncrypted: encrypt(password),
                postIds: postIds,
                scheduleTime: time,
            },
        });

        return { success: "Bot armed and ready! User saved to database." };

    } catch (err: any) {
        console.error("Critical Error:", err.message);
        return { error: "Database or Connection Error. Check your server logs." };
    }
}