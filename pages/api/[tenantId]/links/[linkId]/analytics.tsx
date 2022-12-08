//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { checkTenantPermission } from 'services/users';
import { ClickPaginationWrapper, findAnalyticsPaginated, findPaginated } from 'services/links';
type TenantData = {
    id?: string;
    success: boolean;
};
interface SessionError {
    message: string
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<ClickPaginationWrapper | SessionError>
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

        //find
        const { cursor, take } = req.query
        const links = await findAnalyticsPaginated(linkId, cursor, take)

        return res.send(links)
    } else {
        return res.send({ message: 'needs to be auth' })
    }
};
