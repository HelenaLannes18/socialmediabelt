import prisma from 'lib/prisma';

export const checkTenantPermission = async (tenantId: string, userId: string) => {
    const tenant = await prisma.usersOnTenants.findFirst({
        where: {
            //@ts-ignore
            userId: userId,
            tenantId: tenantId
        }
    })
    return tenant
}