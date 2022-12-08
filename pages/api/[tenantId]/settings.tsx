//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { findTenantById, save } from 'services/tenants'
import Links from 'pages/app/[tenantId]/links';
import { Tenant, Prisma } from '@prisma/client';
import { checkTenantPermission } from 'services/users';


interface SessionError {
    message: string
}
export default async (
    req: NextApiRequest,
    res: NextApiResponse<SessionError | Tenant>
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
            const settingsData: Prisma.TenantUpdateManyArgs = {
                //@ts-ignore
                name: String(req.body.name),
                slug: String(req.body.slug),
            }



            const savedLink = await save(tenantId, settingsData)
            return res.send(savedLink);
        }
        return await findTenantById(tenantId)




    }
    res.send({
        message: 'you need to be auth.'
    })

}