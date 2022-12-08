//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { Prisma } from '@prisma/client';


type LinkData = {
    id: string;
    name: string;
    slug: string;
};
type LinkPaginationWrapper = {
    cursor: string
    take: number
    hasNext: boolean
    hasPrevious: boolean
    items: LinkData[]
}
//@ts-ignore
const getPaginatedLinks = async (tenantId, cursor, take) => {
    const takeNumber = Number(take || 5)
    const args: Prisma.LinkFindManyArgs = {
        select: {
            id: true,
            name: true
        },
        where: {
            tenantId: {
                equals: tenantId
            }
        },
        take: takeNumber,
        orderBy: {
            id: 'asc'
        }
    }
    if (cursor) {
        args.cursor = {
            id: String(cursor)
        }
    }
    console.log({ tenantId, cursor, take })

    const links = await prisma.link.findMany(args)
    const nextLink = await prisma.link.findFirst({
        select: {
            id: true
        },
        where: {
            id: {
                gt: links[links.length - 1].id
            }
        },
        orderBy: {
            id: 'asc'
        }
    })

    const prevLink = await prisma.link.findMany({
        select: {
            id: true
        },
        where: {
            id: {
                lt: links[0].id
            }
        },
        orderBy: {
            id: 'desc'
        },
        take: takeNumber
    })
    return {
        items: links,
        nextCursor: nextLink?.id || '',
        prevCursor: prevLink?.[prevLink.length - 1]?.id || ''
    }
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<String>
) => {
    const session = await getSession({ req });



    if (session) {
        const tenantId = String(req.query.tenantId)

        const { cursor, take } = req.query

        const page1 = await getPaginatedLinks(tenantId, cursor, take)
        const page2 = await getPaginatedLinks(tenantId, page1.nextCursor, take)
        const page2prev = await getPaginatedLinks(tenantId, page2.prevCursor, take)
        const page3 = await getPaginatedLinks(tenantId, page2.nextCursor, take)
        const page3prev = await getPaginatedLinks(tenantId, page3.prevCursor, take)

        res.send(JSON.stringify({
            page1, page2, page2prev, page3, page3prev
        }, null, 2))

    }
}
