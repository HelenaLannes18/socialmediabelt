import { getSession } from "next-auth/react";
import type { NextApiResponse, NextApiRequest } from "next";
import { getPublicLinks } from "services/links";
import { ItemOnPublicPage } from "@prisma/client";
import { checkTenantPermission } from "services/users";
import prisma from "lib/prisma";

interface SessionError {
    message: string
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<SessionError | ItemOnPublicPage[]>

) => {
    const session = await getSession({ req })

    if (session) {
        const tenantId = String(req.query.tenantId)
        //@ts-ignore
        const tenant = await checkTenantPermission(tenantId, session.user.id)
        if (!tenant) {
            return res.send({
                message: 'you need to be auth'
            })
        }
        if (req.method === 'POST') {
            const countMaxOrder =
                await prisma.$queryRaw`select MAX("ItemOnPublicPage"."order") from "ItemOnPublicPage" where "ItemOnPublicPage"."tenantId" = ${tenantId}`;
            await prisma.itemOnPublicPage.create({
                data: {
                    itemType: 'title',
                    itemValue: req.body.title,
                    tenantId,
                    //@ts-ignore
                    order: countMaxOrder[0].max + 1
                }
            })
            //return res.send({ message: 'ok' })
        }

        const links = await getPublicLinks(tenantId)
        return res.send(links)
    }

    res.send({
        message: 'you need to be auth'
    })
}

