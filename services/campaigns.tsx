import prisma from 'lib/prisma';
import { Link, Prisma, Click, Campaign } from '@prisma/client';

export interface CampaignPaginationWrapper {
    items: Campaign[];
    nextCursor: string;
    prevCursor: string;
}


export type CampaignLinkForm = Prisma.CampaignCreateInput

export const save = async (
    tenantId: string,
    campaignData: CampaignLinkForm
): Promise<Campaign | null> => {

    const savedCampaign = await prisma.campaign.create({
        data: campaignData
    });
    return savedCampaign;

};

export const update = async (
    tenantId: string,
    id: string,
    campaignData: Prisma.CampaignUpdateInput
): Promise<Campaign | null> => {
    const savedCampaign = await prisma.campaign.update({
        data: campaignData,
        where: {
            id,
        },
    });
    return savedCampaign;

};

export const findPaginated = async (
    tenantId: string,
    cursor?: string | string[],
    take?: string | string[]
): Promise<CampaignPaginationWrapper> => {
    const takeNumber = Number(take || 5);
    const args: Prisma.CampaignFindManyArgs = {
        where: {
            tenantId: {
                equals: tenantId,
            },
        },
        take: takeNumber,
        orderBy: {
            id: 'asc',
        },
    };
    if (cursor) {
        args.cursor = {
            id: String(cursor),
        };
    }
    console.log({ tenantId, cursor, take });

    const links = await prisma.campaign.findMany(args);
    let nextLink = null;
    if (links.length > 0) {
        nextLink = await prisma.campaign.findFirst({
            select: {
                id: true,
            },
            where: {
                id: {
                    gt: links[links.length - 1].id,
                },
            },
            orderBy: {
                id: 'asc',
            },
        });
    }

    let prevLink = null;
    if (links.length > 0) {
        prevLink = await prisma.campaign.findMany({
            select: {
                id: true,
            },
            where: {
                id: {
                    lt: links[0].id,
                },
            },
            orderBy: {
                id: 'desc',
            },
            take: takeNumber,
        });
    }



    return {
        items: links,
        nextCursor: nextLink?.id || '',
        prevCursor: prevLink?.[prevLink.length - 1]?.id || '',
    };
};



export const findCampaignById = async (tenantId: string, id: string) => {
    const campaign = await prisma.campaign.findFirst({
        where: {
            tenantId,
            id,
        },
    });
    return campaign;
};



