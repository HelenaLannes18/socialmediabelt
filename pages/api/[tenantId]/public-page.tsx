//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { findTenantById, save } from 'services/tenants'
import { Tenant, Prisma, ItemOnPublicPage } from '@prisma/client';
import { checkTenantPermission } from 'services/users';
import { getPublicLinks } from 'services/links'


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
        if (req.method === 'POST') {
            const settingsData: Prisma.TenantUpdateManyArgs = {
                //@ts-ignore
                name: String(req.body.name),
                slug: String(req.body.slug),
            }



            const savedLink = await save(tenantId, settingsData)
            //@ts-ignore
            return res.send(savedLink);
        }
        const links = await getPublicLinks(tenantId)
        return res.send(links)




    }
    res.send({
        message: 'you need to be auth.'
    })

}