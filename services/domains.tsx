import prisma from 'lib/prisma';
import { Link, Prisma, Click, CustomDomain } from '@prisma/client';

export interface LinkPaginationWrapper {
    items: Link[];
    nextCursor: string;
    prevCursor: string;
}

export interface ClickPaginationWrapper {
    items: Click[];
    nextCursor: string;
    prevCursor: string;
}

export const save = async (
    tenantId: string,
    domainData: Prisma.CustomDomainCreateInput
): Promise<CustomDomain | null> => {
    const currentLink = await findDomainName(
        domainData?.domainName || ''
    );
    if (!currentLink) {
        const customDomain = await prisma.customDomain.create({
            data: domainData,
        });
        return customDomain;
    }
    return null;
};

export const update = async (
    tenantId: string,
    id: string,
    domainData: Prisma.CustomDomainUpdateInput
): Promise<CustomDomain | null> => {
    const currentLink = await findDomainName(
        String(domainData.domainName)
    );
    if (!currentLink || currentLink.id === id) {
        const isMyDomain = await prisma.customDomain.findFirst({
            select: {
                id: true
            },
            where: {
                id,
                tenantId
            }
        })
        if (isMyDomain) {
            const savedDomain = await prisma.customDomain.update({
                data: domainData,
                where: {
                    id
                },
            });
            return savedDomain;
        }
        return null
    }
    return null;
};

export const findAll = async (tenantId: string): Promise<CustomDomain[]> => {
    const args: Prisma.CustomDomainFindManyArgs = {
        where: {
            tenantId: {
                equals: tenantId,
            },
        },
        orderBy: {
            id: 'asc',
        },
    };

    const domains = await prisma.customDomain.findMany(args);

    return domains;
};

export const findLinkByDomainName = async (
    tenantId: string,
    domainName: string
) => {
    const domain = await prisma.customDomain.findFirst({
        select: {
            domainName: true,
            id: true,
        },
        where: {
            tenantId,
            domainName,
        },
    });
    return domain;
};

export const findDomainName = async (
    domainName: string
) => {
    const domain = await prisma.customDomain.findFirst({
        select: {
            domainName: true,
            id: true,
        },
        where: {
            domainName,
        },
    });
    return domain;
};


export const findDomainById = async (tenantId: string, id: string) => {
    const domain = await prisma.customDomain.findFirst({
        where: {
            tenantId,
            id,
        },
    });
    return domain;
};

export const findAnalyticsPaginated = async (
    linkId: string,
    cursor?: string | string[],
    take?: string | string[]
): Promise<ClickPaginationWrapper> => {
    const takeNumber = Number(take || 5);
    const args: Prisma.ClickFindManyArgs = {
        where: {
            linkId: {
                equals: linkId,
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
    // console.log({ tenantId, cursor, take });

    const clicks = await prisma.click.findMany(args);
    let nextClick = null;
    if (clicks.length > 0) {
        nextClick = await prisma.click.findFirst({
            select: {
                id: true,
            },
            where: {
                id: {
                    gt: clicks[clicks.length - 1].id,
                },
            },
            orderBy: {
                id: 'asc',
            },
        });
    }

    let prevClick = null;
    if (clicks.length > 0) {
        prevClick = await prisma.click.findMany({
            select: {
                id: true,
            },
            where: {
                id: {
                    lt: clicks[0].id,
                },
            },
            orderBy: {
                id: 'desc',
            },
            take: takeNumber,
        });
    }

    return {
        items: clicks,
        nextCursor: nextClick?.id || '',
        prevCursor: prevClick?.[prevClick.length - 1]?.id || '',
    };
};

export const getPublicLinks = async (tenantId: string) => {
    const links = await prisma.link.findMany({
        select: {
            id: true,
            publicName: true,
            destination: true,
        },
        where: {
            tenantId,
        },
    });
    return links;
};
