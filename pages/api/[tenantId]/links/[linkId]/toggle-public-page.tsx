//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { checkTenantPermission } from 'services/users';
import { ItemOnPublicPage, Prisma } from '@prisma/client';
import { findLinkById, update } from 'services/links';
type TenantData = {
    id?: string;
    success: boolean;
};
interface SessionError {
    message: string;
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<TenantData | SessionError | ItemOnPublicPage | null>
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
                const countMaxOrder =
                    await prisma.$queryRaw`select MAX("ItemOnPublicPage"."order") from "ItemOnPublicPage" where "ItemOnPublicPage"."tenantId" = ${tenantId}`;

                const newPublicLinkOnPage = await prisma.itemOnPublicPage.create({
                    data: {
                        highlight: false,
                        linkId,
                        itemValue: '',
                        itemType: 'link',
                        //@ts-ignore
                        order: countMaxOrder[0].max + 1,
                        tenantId,
                    },
                });
                return res.send(newPublicLinkOnPage);
            }
            const linkOnPublicPage = await prisma.itemOnPublicPage.findFirst({
                where: {
                    linkId,
                },
            });
            await prisma.itemOnPublicPage.delete({
                where: {
                    id: linkOnPublicPage?.id,
                },
            });

            return res.send({ message: '' });
        }
    } else {
        return res.send({ success: false });
    }
};
