//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { checkTenantPermission } from 'services/users';
import { Link } from '@prisma/client';
type TenantData = {
    id?: string;
    success: boolean;
};
interface SessionError {
    message: string;
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<TenantData | SessionError | Link | null>
) => {
    const session = await getSession({ req });

    if (session) {
        const tenantId = String(req.query.tenantId);
        const linkId = String(req.query.linkId);
        const action = String(req.body.action);
        //@ts-ignore
        const tenant = await checkTenantPermission(tenantId, session.user.id);
        if (!tenant) {
            return res.send({
                message: 'need to be auth',
            });
        }

        if (req.method === 'PATCH') {
            if (action === 'add') {

                const link = await prisma.link.update({
                    data: {
                        favorite: true,
                    },
                    where: {
                        id: linkId
                    }
                });
                return res.send(link);
            }
            const link = await prisma.link.update({
                data: {
                    favorite: false,
                },
                where: {
                    id: linkId
                }
            });
            return res.send(link);
        }

    } else {
        return res.send({ success: false });
    }
};
