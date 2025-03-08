import { createDb } from '@repo/database/client'

const conn = createDb({
    url: process.env.DATABASE_URL!,
    authToken: process.env.DATABASE_AUTH_TOKEN,
})

export const db = conn.db