//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { checkTenantPermission } from 'services/users';
import { Campaign, Link, Prisma } from '@prisma/client';
import { findCampaignById, update } from 'services/campaigns';

type TenantData = {
    id?: string;
    success: boolean;
};
interface SessionError {
    message: string
}

export default async (
    req: NextApiRequest,
    res: NextApiResponse<TenantData | SessionError | Campaign | null>
) => {
    const session = await getSession({ req });



    if (session) {
        const tenantId = String(req.query.tenantId)
        const campaignId = String(req.query.campaignId)
        //@ts-ignore
        const tenant = await checkTenantPermission(tenantId, session.user.id)
        if (!tenant) {
            return res.send({
                message: 'need to be auth'
            })
        }
        //trocar aqui em link
        if (req.method === 'DELETE') {
            const link = await prisma.campaign.findFirst({
                where: {
                    id: campaignId,
                    tenantId
                }
            })
            if (!link) {
                return res.send({
                    message: 'needs to be auth'
                })
            }



            await prisma.campaign.delete({
                where: {
                    id: campaignId
                }
            })

            return res.send({ id: campaignId, success: true });
        }

        if (req.method === 'PATCH') {
            const linkData: Prisma.CampaignUpdateInput = {
                name: String(req.body.name),
                urlParams: req.body.urlParams,
                tenant: {
                    connect: {
                        id: String(tenantId)
                    }
                }
            }

            const savedLink = await update(tenantId, campaignId, linkData)
            return res.send(savedLink)
        }
        const campaign = await findCampaignById(tenantId, campaignId)
        return res.send(campaign)
    } else {
        return res.send({ success: false })
    }
};
