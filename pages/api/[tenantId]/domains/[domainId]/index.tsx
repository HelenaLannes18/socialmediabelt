//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { checkTenantPermission } from 'services/users';
import { CustomDomain, Link, Prisma } from '@prisma/client';
import { update } from 'services/domains';
import { findDomainById } from 'services/domains';
type TenantData = {
    id?: string;
    success: boolean;
};
interface SessionError {
    message: string
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<TenantData | SessionError | CustomDomain | null>
) => {
    const session = await getSession({ req });



    if (session) {
        const tenantId = String(req.query.tenantId)
        const domainId = String(req.query.domainId)
        //@ts-ignore
        const tenant = await checkTenantPermission(tenantId, session.user.id)
        if (!tenant) {
            return res.send({
                message: 'need to be auth'
            })
        }
        if (req.method == 'DELETE') {
            const domain = await prisma.customDomain.findFirst({
                where: {
                    id: domainId,
                    tenantId
                }
            })
            if (!domain) {
                return res.send({
                    message: 'domain not found'
                })
            }



            await prisma.customDomain.delete({
                where: {
                    id: domainId
                }
            })

            return res.send({ id: domainId, success: true });
        }

        if (req.method === 'PATCH') {
            const linkData: Prisma.CustomDomainUpdateInput = {
                domainName: String(req.body.domainName),
                tenant: {
                    connect: {
                        id: String(tenantId)
                    }
                }
            }

            const savedDomain = await update(tenantId, domainId, linkData)
            return res.send(savedDomain)
        }
        const domain = await findDomainById(tenantId, domainId)
        return res.send(domain)
    } else {
        return res.send({ success: false })
    }
};
