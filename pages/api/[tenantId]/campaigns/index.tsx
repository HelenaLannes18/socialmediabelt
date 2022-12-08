//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { findPaginated, save, CampaignLinkForm, CampaignPaginationWrapper } from 'services/campaigns'
import { Campaign, Link, Prisma } from '@prisma/client';
import { checkTenantPermission } from 'services/users';

interface SessionError {
    message: string
}
export default async (
    req: NextApiRequest,
    res: NextApiResponse<CampaignPaginationWrapper | SessionError | Campaign>
) => {
    const session = await getSession({ req });



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
            const campaignData: CampaignLinkForm = {
                name: String(req.body.name),
                urlParams: req.body.urlParams,
                tenant: {
                    connect: {
                        id: String(tenantId)
                    }
                }
            }


            //@ts-ignore
            const savedCampaign = await save(tenantId, campaignData)
            //@ts-ignore
            return res.send(savedCampaign);
        }

        //find
        const { cursor, take } = req.query

        const campaigns = await findPaginated(tenantId, cursor, take)

        return res.send(campaigns)

    } else {
        res.send({
            message: 'you need to be auth.'
        })
    }
}