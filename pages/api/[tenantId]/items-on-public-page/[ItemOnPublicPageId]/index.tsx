//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { ItemOnPublicPage } from '@prisma/client';
import { checkTenantPermission } from 'services/users';
import { getPublicLinks } from 'services/links'
import prisma from 'lib/prisma'

interface SessionError {
    message: string
}
export default async (
    req: NextApiRequest,
    res: NextApiResponse<SessionError | ItemOnPublicPage[]>
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

        const id = req.body.id || (req.query.itemOnPublicPageId as string)
        const currentItem = await prisma.itemOnPublicPage.findFirst({
            where: {
                id,
                tenantId
            }
        })
        if (!currentItem) {
            return res.send({
                message: 'you need to be auth'
            })
        }
        if (req.method === 'PATCH') {


            if (req.body.order) {
                const order = req.body.order as number
                await prisma.itemOnPublicPage.update({
                    data: {
                        order
                    },
                    where: {
                        id
                    }
                })
            }
            if (req.body.highlight !== undefined) {
                const highlight = req.body.highlight as boolean
                await prisma.itemOnPublicPage.update({
                    data: {
                        highlight
                    },
                    where: {
                        id
                    }
                })
            }

            return res.send({ message: 'ok' })
        }
        if (req.method === 'DELETE') {

            await prisma.itemOnPublicPage.delete({
                where: {
                    id
                }
            })
            return res.send({ message: 'ok' })
        }
        const links = await getPublicLinks(tenantId)
        return res.send(links)
    }
    res.send({
        message: 'you need to be auth'
    })
}
