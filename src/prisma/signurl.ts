import { Prisma } from '@prisma/client';

//同步签名测试方法
function signUrl(filename: string) {
    //配上自己的签名，不能是异步，必须同步，异步自己想其他办法吧
    return `http://www.xxx.com/${filename}`;
}

export default Prisma.defineExtension({
    name: 'prisma-extends-file-url',
    result: {
        file: {
            url: {
                needs: { filename: true },
                compute(file) {
                    // the computation logic
                    // return file.filename;
                    // 必须是同步签名方法
                    return signUrl(file.filename);
                },
            },
        },
    },
});
