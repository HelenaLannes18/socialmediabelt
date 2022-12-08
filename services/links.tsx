import prisma from 'lib/prisma';
import { Link, Prisma, Click } from '@prisma/client';
import { group } from 'console';

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

interface Group {
    value: string;
    label: string;
    __isNew__?: boolean;
}

interface WithGroups {
    groups: Group[];
}

export type NewLinkForm = Prisma.LinkCreateInput & WithGroups;

export const save = async (
    tenantId: string,
    linkData: NewLinkForm
): Promise<Link | null> => {
    const currentLink = await findLinkBySlug(tenantId, linkData?.slug || '');
    if (!currentLink) {
        const { groups, ...data } = linkData;
        const groupsToConnect = groups
            .filter((group) => !group.__isNew__)
            .map((group) => ({
                id: group.value,
            }));
        const groupsToCreate = groups
            .filter((group) => group.__isNew__)
            .map((group) => ({ name: group.label, tenantId }));
        const savedLink = await prisma.link.create({
            data: {
                ...data,
                linkGroups: {
                    connect: groupsToConnect,
                    create: groupsToCreate,
                },
            },
        });
        //create group

        return savedLink;
    }
    return null;
};

export const update = async (
    tenantId: string,
    id: string,
    linkData: Prisma.LinkUpdateInput
): Promise<Link | null> => {
    const currentLink = await findLinkBySlug(tenantId, linkData?.slug as string);
    if (!currentLink || currentLink.id === id) {
        const savedLink = await prisma.link.update({
            data: linkData,
            where: {
                id,
            },
        });
        return savedLink;
    }
    return null;
};

export const findPaginated = async (
    tenantId: string,
    cursor?: string | string[],
    take?: string | string[]
): Promise<LinkPaginationWrapper> => {
    const takeNumber = Number(take || 5);
    const args: Prisma.LinkFindManyArgs = {
        where: {
            tenantId: {
                equals: tenantId,
            },
        },
        take: takeNumber,
        orderBy: {
            id: 'asc',
        },
        include: {
            itemOnPublicPage: true
        }
    };
    if (cursor) {
        args.cursor = {
            id: String(cursor),
        };
    }
    console.log({ tenantId, cursor, take });

    const links = await prisma.link.findMany(args);
    let nextLink = null;
    if (links.length > 0) {
        nextLink = await prisma.link.findFirst({
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
        prevLink = await prisma.link.findMany({
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

    const linksWithCLicks = await prisma.click.groupBy({
        by: ['linkId'],
        _count: {
            id: true,
        },
        where: {
            linkId: {
                in: links.map((link) => link.id),
            },
        },
    });

    const linksWithAnalytics = links.map((link) => {
        return {
            ...link,
            clicks:
                linksWithCLicks.find((click) => click.linkId === link.id)?._count?.id ||
                0,
        };
    });
    return {
        items: linksWithAnalytics,
        nextCursor: nextLink?.id || '',
        prevCursor: prevLink?.[prevLink.length - 1]?.id || '',
    };
};

export const findLinkBySlug = async (tenantId: string, slug: string) => {
    const link = await prisma.link.findFirst({
        select: {
            destination: true,
            id: true,
        },
        where: {
            tenantId,
            slug,
        },
    });
    return link;
};

export const findLinkById = async (tenantId: string, id: string) => {
    const link = await prisma.link.findFirst({
        where: {
            tenantId,
            id,
        },
    });
    return link;
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

    const linksOnPublicPage = await prisma.itemOnPublicPage.findMany({
        include: {
            link: {
                select: {
                    destination: true,
                    id: true,
                    publicName: true
                }
            }
        },
        where: {
            tenantId
        },
        orderBy: {
            order: 'asc'
        }
    })
    return linksOnPublicPage;
};
