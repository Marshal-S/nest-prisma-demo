import { Prisma } from '@prisma/client';

export type PrismaQuery<T> = {
    where?: Prisma.Args<T, 'findFirst'>['where'];
    page?: number | string; //page从1开始
    limit?: number | string; //默认为10
    cursor?: Prisma.Args<T, 'findUnique'>['where'];
};

export type PaginationType<T> = {
    items: T[];
    currentPage: number;
    pageCount: number;
    totalCount: number;
    totalPages: number;
};

export default Prisma.defineExtension({
    name: 'prisma-extends-pagination',
    model: {
        $allModels: {
            async findAndCount<T>(
                this: T,
                { page, limit, cursor, where, ...query }: PrismaQuery<T> = {},
            ): Promise<PaginationType<T>> {
                const context = Prisma.getExtensionContext(this) as any;
                const currentPage = page ? Number(page) : 1;
                const take = limit ? Number(limit) : 10;
                const skip = (currentPage - 1) * take;
                const res = await context.findMany({
                    ...query,
                    skip: skip > 0 ? skip : 0,
                    take,
                    cursor,
                    where,
                });
                const count = await context.count({
                    where,
                });
                return {
                    items: res,
                    currentPage: currentPage,
                    pageCount: take,
                    totalCount: count,
                    totalPages: Math.ceil(count / take),
                };
            },
        },
    },
});
