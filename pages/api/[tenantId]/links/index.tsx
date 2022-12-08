//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { findPaginated, save, LinkPaginationWrapper, findLinkBySlug, NewLinkForm } from 'services/links'
import Links from 'pages/app/[tenantId]/links';
import { Link, Prisma } from '@prisma/client';
import { checkTenantPermission } from 'services/users';

interface SessionError {
    message: string
}
export default async (
    req: NextApiRequest,
    res: NextApiResponse<LinkPaginationWrapper | SessionError | Link>
) => {
    const session = await getSession({ req });



    if (session) {
        const tenantId = String(req.query.tenantId)

        //@ts-ignore
        const tenant = await checkTenantPermission(tenantId, session.user.id)
        if (!tenant) {
            return res.send({
                message: 'you need to be auth'
            })
        }
        if (req.method === 'POST') {
            const linkData: NewLinkForm = {
                name: String(req.body.name),
                publicName: String(req.body.publicName),
                slug: String(req.body.slug),
                destination: String(req.body.destination),
                groups: req.body.groups,
                tenant: {
                    connect: {
                        id: String(tenantId)
                    }
                }
            }


            //@ts-ignore
            const savedLink = await save(tenantId, linkData)
            //@ts-ignore
            return res.send(savedLink);
        }
        //buscar por slug
        if (req.query.slug) {
            const link = await findLinkBySlug(tenantId, String(req?.query?.slug))
            if (!link) {
                res.send({ message: 'link not found' })
            }
            //@ts-ignore
            return res.send(link)
        }


        if (req.query.favorite) {
            const links = await prisma.link.findMany({
                where: {
                    tenantId,
                    favorite: true
                }
            })
            //@ts-ignore
            return res.send({ items: links })
        }

        //find
        const { cursor, take } = req.query

        const links = await findPaginated(tenantId, cursor, take)

        return res.send(links)

    } else {
        res.send({
            message: 'you need to be auth.'
        })
    }
}