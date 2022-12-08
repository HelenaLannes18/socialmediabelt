//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { findPaginated, LinkGroupPaginationWrapper } from 'services/groups'
import Links from 'pages/app/[tenantId]/links';
import { Link, LinkGroup, Prisma } from '@prisma/client';
import { checkTenantPermission } from 'services/users';
import { findLinkGroupByName, save } from 'services/groups';

interface SessionError {
    message: string
}
export default async (
    req: NextApiRequest,
    res: NextApiResponse<SessionError | LinkGroup[] | LinkGroupPaginationWrapper>
) => {
    const session = await getSession({ req });



    if (session) {
        const tenantId = String(req.query.tenantId)

        //@ts-ignore
        const tenant = await checkTenantPermission(tenantId, session.user.id)
        if (!tenant) {
            return res.send({
                message: ' you need to be auth'
            })
        }
        if (req.method === 'POST') {
            //@ts-ignore
            const linkData: Prisma.LinkGroupCreateInput = {
                name: String(req.body.name),


            }


            //@ts-ignore
            const savedLink = await save(tenantId, linkData)
            //@ts-ignore
            return res.send(savedLink);
        }
        //buscar por slug
        if (req.query.name) {
            const linkGroup = await findLinkGroupByName(tenantId, String(req?.query?.name))
            if (!linkGroup) {
                res.send({ message: 'link group not found' })
            }
            return res.send(linkGroup)
        }
        //find
        const { cursor, take } = req.query

        const groups = await findPaginated(tenantId, cursor, take)

        return res.send(groups)

    } else {
        res.send({
            message: 'you need to be auth.'
        })
    }
}