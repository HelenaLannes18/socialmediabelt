//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { checkTenantPermission } from 'services/users';
import { LinkGroup, Prisma } from '@prisma/client';
import { findGroupById, update } from 'services/groups';
type TenantData = {
    id?: string;
    success: boolean;
};
interface SessionError {
    message: string
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<TenantData | SessionError | LinkGroup | null>
) => {
    const session = await getSession({ req });



    if (session) {
        const tenantId = String(req.query.tenantId)
        const groupId = String(req.query.groupId)
        //@ts-ignore
        const tenant = await checkTenantPermission(tenantId, session.user.id)
        if (!tenant) {
            return res.send({
                message: 'need to be auth'
            })
        }
        if (req.method == 'DELETE') {
            const link = await prisma.linkGroup.findFirst({
                where: {
                    id: groupId,
                    tenantId
                }
            })
            if (!link) {
                return res.send({
                    message: 'needs to be auth'
                })
            }



            await prisma.linkGroup.delete({
                where: {
                    id: groupId
                }
            })

            return res.send({ id: groupId, success: true });
        }

        if (req.method === 'PATCH') {
            const linkData: Prisma.LinkGroupUpdateInput = {
                name: String(req.body.name),
                tenant: {
                    connect: {
                        id: String(tenantId)
                    }
                }
            }

            const savedLink = await update(tenantId, groupId, linkData)
            return res.send(savedLink)
        }
        const group = await findGroupById(tenantId, groupId)
        return res.send(group)
    } else {
        return res.send({ success: false })
    }
};
