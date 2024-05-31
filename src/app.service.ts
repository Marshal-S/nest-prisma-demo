import { Injectable } from '@nestjs/common';
import { prisma } from './prisma/prisma';

@Injectable()
export class AppService {
    constructor() {
        this.customExtends();
    }

    getHello(): string {
        return 'Hello World!';
    }

    async create() {
        //创建一条数据，顺道给head_id关联一个文件,不关联undefined或者null即可
        await prisma.user.create({
            data: {
                name: '哈哈',
                age: 20,
                head_id: 10,
                // head_id: undefined,
            },
        });
        //创建多个
        await prisma.user.createMany({
            data: [
                {
                    name: '哈哈',
                    age: 20,
                    head_id: 10,
                },
            ],
        });
        //创建时可以连关联数据一同创建，例如用户数据分为基础表和一对一的私密表，可以一同创建(失败一起失败)
        await prisma.user.create({
            data: {
                name: '哈哈',
                age: 20,
                head: {
                    create: {
                        originname: '文件名字',
                        filename: '123.png',
                        size: 100,
                    },
                },
            },
        });
    }

    async update() {
        //更新一条
        await prisma.user.update({
            where: {
                id: 1,
            },
            data: {
                name: 'ls',
            },
        });
        //更新多条,只能更新成一样的，否则只能一条一条更新
        await prisma.user.updateMany({
            where: {
                age: 16,
            },
            data: {
                age: 18,
            },
        });
        //年龄小于18的都自增1（原子操作）
        await prisma.user.updateMany({
            where: {
                age: {
                    lt: 17,
                },
            },
            data: {
                age: {
                    increment: 1, //增加，原子操作
                    // decrement: 1,//减少，原子操作
                },
            },
        });
        //更新自己的同时，支持增删改关联表
        await prisma.user.update({
            where: {
                id: 1,
            },
            data: {
                name: '哈哈',
                head: {
                    create: {
                        originname: '文件名字',
                        filename: '123.png',
                        size: 100,
                    },
                    update: {
                        where: {
                            id: 2,
                        },
                        data: {
                            filename: '234.png',
                        },
                    },
                    delete: {
                        id: 2,
                    },
                },
            },
        });
    }

    async upset() {
        //更新或者创建，有id就更新，没有就创建
        await prisma.user.upsert({
            where: {
                id: 1,
            },
            create: {
                name: '哈哈',
                age: 20,
                head_id: 10,
            },
            update: {
                name: '哈哈',
                age: 20,
            },
        });
    }

    async manyToMany() {
        //主要是隐式多对多，显示多对多跟操作正常表一样，只不过显示的多对多表，需要通过删除和创建来断开建立关系
        //隐式多对多的创建不多说，可以直接create一起创建，也可以连接已有数据的两者
        //主要介绍两者的连接，也就是关系的建立，通过where筛选本组数据，然后通过 update + set 和另外一张表建立关联
        await prisma.company.update({
            where: {
                id: 10, //company id 为10的和 user表中 id为 10、11的数据建立关联
            },
            data: {
                users: {
                    set: [{ id: 10 }, { id: 11 }], //使用此操作会更新关联数据，以前的关联会被覆盖
                },
            },
        });
        //如果觉的隐式多对多不好用，对于关联表操作比较频繁，嫌弃效率低，可以采用显式多对多的方式，那么可以直接操控关系
        //因此也可以看出，隐式多对多，比较适合关系表比较纯粹，且操作没那么繁琐的情况
        //(例如点赞一个视频、文章，即使关联没有其他数据，如果操作很频繁，那么隐式多对多效率确实低了，可以采用显示多对多，当然也可替换其他手段应对)
    }

    async find() {
        //查找唯一，条件为unique
        const user = await prisma.user.findUnique({
            where: {
                id: 1,
            },
        });
        //条件部位unique，可能存在多条，查找一条
        await prisma.user.findFirst({
            where: {
                name: '大黄',
            },
        });
        //查找多条
        await prisma.user.findMany({
            where: {
                name: {
                    contains: '大黄',
                },
            },
        });
        //查找关联，排序
        await prisma.user.findMany({
            where: {
                name: {
                    contains: '大黄',
                },
            },
            //取出关联数据
            include: {
                head: true,
                collection: {
                    include: {
                        user: true,
                        article: true,
                    },
                },
            },
            //orderBy排序
            orderBy: {
                created_time: 'desc',
                // updated_time: 'asc',
            },
        });
        //选择字段查询select
        await prisma.user.findMany({
            where: {
                name: {
                    contains: '大黄',
                },
            },
            //可以代替include,不同的是，select只会拿出写出的的值，include则是取出所有的非关联，将写出的关联数据关联出来
            //这里只拿用到的数据，可以提升查询效率和节省带宽
            select: {
                id: true,
                name: true,
                head: true,
                collection: {
                    include: {
                        user: {
                            //user表只拿出我们想要的数据
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
        });
        //复合id查询,会生成一个复合键，通过该键值查询
        await prisma.shopCoverFile.findUnique({
            where: {
                shop_id_file_id: {
                    shop_id: 1,
                    file_id: 1,
                },
            },
        });
        //如果本身就是主键(关联表复合主键)，实际上不用复合键值，用这个且查询
        await prisma.shopCoverFile.findUnique({
            where: {
                shop_id: 1,
                file_id: 1,
            },
        });
        //对于unique这类复合主键，则必须使用复合主键功能，才是实现findUnique功能
        //否则只能使用findFirst
        await prisma.newShop.findUnique({
            where: {
                pre_name: {
                    pre: '1',
                    name: 'b',
                },
            },
        });
        //查询条件
        await prisma.user.findMany({
            where: {
                //条件默认为且，即为同时满足方可
                id: 10,
                head_id: 20,
                // 和上面等同
                // AND: {
                //   id: 10,
                //   head_id: 20,
                // },
                //条件或，里面的条件满足一条即可，整体和外面的为且的关系
                OR: [
                    {
                        id: 1,
                    },
                    {
                        name: '哈哈',
                    },
                ],
                //取出条件不满足的
                NOT: {
                    id: 2,
                },
                age: {
                    //小于等于大于等于，取值范围的不多说了
                    lt: 20,
                    lte: 30,
                    gt: 40,
                    gte: 40,
                },
                name: {
                    contains: '包含', //模糊查询, 相当于'%包含%',
                    startsWith: '包', //看名字就知道，不需要多介绍了吧
                    endsWith: '含',
                },
            },
        });
    }

    async delete() {
        //这个操作平时看别人用的少，不代表其不会用，很多数据有价值不会删是其一，其二是开发偷懒了，懒得删关联表才出现的标识位代替删除
        //实际上有不少数据是需要删除的，否则会有冗余错误或影响后续操作等(例如:关系表，带有少量数据的关系表，临时数据表等)
        //删除一条，需要使用unique的键值
        await prisma.user.delete({
            where: {
                id: 1,
            },
        });
        //大量删除，支持模糊
        await prisma.user.deleteMany({
            where: {
                name: '',
            },
        });
    }

    async findPages() {
        //分页，列表常用的
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: '李',
                },
            },
            //跳过的数据条数，这里就是获取第21~30条
            skip: 20,
            //取出数量
            take: 10,
        });
        //获取数量
        const count = await prisma.user.count({
            where: {
                name: {
                    contains: '李',
                },
            },
            //跳过的数据条数，这里就是获取第21~30条
            skip: 20,
            //取出数量
            take: 10,
        });
        //公用查询，通过设置类型查询
        const options: {
            where: Record<string, unknown>;
            skip: number;
            //取出数量
            take: number;
        } = {
            where: {
                name: {
                    contains: '李',
                },
            },
            //跳过的数据条数，这里就是获取第21~30条
            skip: 20,
            //取出数量
            take: 10,
        };
        await prisma.user.findMany(options);
        await prisma.user.count(options);
        //上面的明显还是不好用，可以直接用扩展的$extends的方式扩展，后面简单介绍一下
        //或者直接使用 prisma-extension-pagination 组件，这个组件也挺好用的，代码也不多

        //游标
        await prisma.user.findMany({
            where: {
                name: {
                    contains: '李',
                },
            },
            cursor: {
                id: 20,
            },
            //使用游标后，就不使用默认的跳过了
            // skip: 20,
            //取出数量
            take: 10,
        });
    }

    async customOperate() {
        //自定义操作，手写sql语句
        //对于复杂的业务，上面基础使用肯定满足不了，且里面的聚合、分组似乎总不是那么好用
        //这里直接介绍一下手写sql语句的方式来实现很多情况
        //这里直接对用户名字进行分组统计，实际可能更复杂
        //这里统计的count为bigint会序列化失败，我们转化成字符串
        await prisma.$queryRaw`
            select cast(count(name) AS CHAR) as count
            from User
            where age >= 18
            group by name
            order by count desc
        `;
    }

    async trans() {
        //事务，实战中两个或者多个操作同时进行时，基本都会用到的，其可以保持数据一致性、错误回滚等(原子、一致、持久、隔离)
        //事务的好坏，可以避免错误产生的脏数据，使用不当可能会导致性能变慢，严重时，可能导致死锁(某些资源一直无法访问)
        //并发事务
        //这里同时创建一条user和article数据，没有顺序，有一个失败就会回滚
        await prisma.$transaction([
            prisma.user.create({
                data: {
                    name: '11',
                    age: 20,
                    head_id: undefined,
                },
            }),
            prisma.article.create({
                data: {
                    name: '11',
                },
            }),
        ]);
        //交互事务，存在顺序时，需要用到交互事务
        //还记得我们一开始create的时候，顺道创建一个file关联么
        //我们先创建file，然后获取外键，创建user信息并关联，此时就实现了该原子操作
        //交互事务有等待时间，超时就会结束
        await prisma.$transaction(
            async (prisma) => {
                const file = await prisma.file.create({
                    data: {
                        originname: '123.png',
                        size: 200,
                        filename: '123.png',
                    },
                });
                await prisma.user.create({
                    data: {
                        name: '11',
                        age: 20,
                        head_id: file.id,
                    },
                });
            },
            {
                maxWait: 5000, //默认2000ms
                timeout: 10000, // 默认 5000ms
            },
        );
    }

    async customExtends() {
        const { page_num, page_size } = { page_num: 1, page_size: 10 };
        const res = await prisma.file.findAndCount({
            where: {
                id: 1,
            },
            page: page_num,
            limit: page_size,
        });
        console.log(res);
    }
}
