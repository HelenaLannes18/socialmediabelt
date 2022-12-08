import { Tenant, Prisma } from '@prisma/client';
import prisma from 'lib/prisma';

export const findTenantBySlug = async (slug: string) => {
    const tenant = await prisma.tenant.findFirst({
        select: {
            id: true,
            name: true,
        },
        where: {
            slug,
        },
    });
    return tenant;
};

export const findTenantByDomain = async (domainName: string) => {
    const tenant = await prisma.customDomain.findFirst({
        select: {
            id: true,
            domainName: true,
            tenant: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        where: {
            domainName,
        },
    });
    return tenant;
};

export const findTenantById = async (id: string) => {
    const tenant = await prisma.tenant.findFirst({
        where: {
            id,
        },
    });
    return tenant;
};


export const create = async (
    userId: string,
    linkData: Prisma.TenantCreateInput
): Promise<Tenant> => {
    const savedTenant = await prisma.tenant.create({
        data: linkData,
    });
    await prisma.usersOnTenants.create({
        data: {
            tenantId: savedTenant.id,
            userId,
            role: 'owner'
        }
    })
    return savedTenant;
};

export const save = async (
    id: string,
    settingsData: Prisma.TenantUpdateManyArgs
): Promise<Tenant> => {
    const savedSettings = await prisma.tenant.update({
        where: {
            id: id,
        },
        data: settingsData,
    });
    return savedSettings;
};
