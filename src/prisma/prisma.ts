import { PrismaClient } from '@prisma/client';
import pagination from './pagination';
import signurl from './signurl';

export const prisma = new PrismaClient({
    transactionOptions: {
        maxWait: 2000, // default: 2000
        timeout: 5000, // default: 5000
    },
})
    .$extends(pagination)
    .$extends(signurl);
