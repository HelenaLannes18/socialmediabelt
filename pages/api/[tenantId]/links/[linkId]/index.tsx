//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { checkTenantPermission } from 'services/users';
import { Link, Prisma } from '@prisma/client';
import { findLinkById, update } from 'services/links';
type TenantData = {
    id?: string;
    success: boolean;
};
interface SessionError {
    message: string
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<TenantData | SessionError | Link | null>
) => {
    const session = await getSession({ req });



    if (session) {
        const tenantId = String(req.query.tenantId)
        const linkId = String(req.query.linkId)
        //@ts-ignore
        const tenant = await checkTenantPermission(tenantId, session.user.id)
        if (!tenant) {
            return res.send({
                message: 'need to be auth'
            })
        }
        if (req.method === 'DELETE') {
            const link = await prisma.link.findFirst({
                where: {
                    id: linkId,
                    tenantId
                }
            })
            if (!link) {
                return res.send({
                    message: 'needs to be auth'
                })
            }



            await prisma.link.delete({
                where: {
                    id: linkId
                }
            })

            return res.send({ id: linkId, success: true });
        }

        if (req.method === 'PATCH') {
            const linkData: Prisma.LinkUpdateInput = {
                name: String(req.body.name),
                publicName: String(req.body.publicName),
                slug: String(req.body.slug),
                destination: String(req.body.destination),
                tenant: {
                    connect: {
                        id: String(tenantId)
                    }
                }
            }

            const savedLink = await update(tenantId, linkId, linkData)
            return res.send(savedLink)
        }
        const link = await findLinkById(tenantId, linkId)
        return res.send(link)
    } else {
        return res.send({ success: false })
    }
};
