//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { CustomDomain, Link, Prisma } from '@prisma/client';
import { checkTenantPermission } from 'services/users';
import { findAll, findDomainName, save } from 'services/domains';

interface SessionError {
    message: string
}
export default async (
    req: NextApiRequest,
    res: NextApiResponse<CustomDomain[] | SessionError | CustomDomain>
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
        if (req.method == 'POST') {
            const domainData: Prisma.CustomDomainCreateInput = {
                domainName: String(req.body.domainName),
                active: true,
                tenant: {
                    connect: {
                        id: String(tenantId)
                    }
                }
            }


            //@ts-ignore
            const savedLink = await save(tenantId, domainData)
            //@ts-ignore
            return res.send(savedLink);
        }
        //buscar por slug
        if (req.query.domainName) {
            const domain = await findDomainName(String(req?.query?.domainName))
            if (!domain) {
                res.send({ message: 'domain not found' })
            }
            //@ts-ignore
            return res.send(domain)
        }
        //find

        const domains = await findAll(tenantId)

        return res.send(domains)

    } else {
        res.send({
            message: 'you need to be auth.'
        })
    }
}