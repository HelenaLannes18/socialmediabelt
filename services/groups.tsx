import prisma from 'lib/prisma';
import { Link, Prisma, Click, LinkGroup } from '@prisma/client';
import { group } from 'console';

export interface LinkGroupPaginationWrapper {
    items: LinkGroup[];
    nextCursor: string;
    prevCursor: string;
}

export const save = async (
    tenantId: string,
    linkData: Prisma.LinkGroupCreateInput
): Promise<LinkGroup | null> => {
    const savedLinkGroup = await prisma.linkGroup.create({
        data: linkData,
    });
    return savedLinkGroup;
};

export const update = async (
    tenantId: string,
    id: string,
    linkData: Prisma.LinkGroupUpdateInput
): Promise<LinkGroup | null> => {

    const savedGroup = await prisma.linkGroup.update({
        data: linkData,
        where: {
            id,
        },
    });
    return savedGroup;

};

export const findPaginated = async (
    tenantId: string,
    cursor?: string | string[],
    take?: string | string[]
): Promise<LinkGroupPaginationWrapper> => {
    const takeNumber = Number(take || 5);
    const args: Prisma.LinkGroupFindManyArgs = {
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

    const linkGroups = await prisma.linkGroup.findMany(args);
    let nextLink = null;
    if (linkGroups.length > 0) {
        nextLink = await prisma.linkGroup.findFirst({
            select: {
                id: true,
            },
            where: {
                id: {
                    gt: linkGroups[linkGroups.length - 1].id,
                },
            },
            orderBy: {
                id: 'asc',
            },
        });
    }

    let prevLink = null;
    //@ts-ignore
    if (links.length > 0) {
        prevLink = await prisma.linkGroup.findMany({
            select: {
                id: true,
            },
            where: {
                id: {
                    //@ts-ignore
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
        items: linkGroups,
        nextCursor: nextLink?.id || '',
        prevCursor: prevLink?.[prevLink.length - 1]?.id || '',
    };
};

export const findLinkGroupByName = async (
    tenantId: string,
    name: string
): Promise<LinkGroup[]> => {
    const linkGroup = await prisma.linkGroup.findMany({
        where: {
            name: {
                contains: name,
            },
        },
    });
    return linkGroup;
};

export const findGroupById = async (tenantId: string, id: string) => {
    const group = await prisma.linkGroup.findFirst({
        where: {
            tenantId,
            id,
        },
    });
    return group;
};

