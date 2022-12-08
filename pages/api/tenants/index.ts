//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { Prisma } from '@prisma/client';
import { save } from 'services/links';
import { create, findTenantBySlug } from 'services/tenants';
type TenantData = {
  id: string;
  name: string;
  slug: string;
};

type TenantId = {
  id: string;
};
type TenantSearchError = {
  message: 'Tenant not found';
};
export default async (
  req: NextApiRequest,
  res: NextApiResponse<TenantData[] | TenantData | TenantId | TenantSearchError>
) => {
  const session = await getSession({ req });
  if (session) {
    if (req.method === 'POST') {
      const tenantData: Prisma.TenantCreateInput = {
        name: String(req.body.name),
        slug: String(req.body.slug),
        plan: String(req.body.plan),
        image: '',
      };
      //@ts-ignore
      const savedTenant = await create(session.user.id, tenantData);
      return res.send(savedTenant);
    }

    //buscar por slug
    if (req.query.slug) {
      const tenant = await findTenantBySlug(String(req?.query?.slug));
      if (!tenant) {
        return res.send({ message: 'Tenant not found' });
      }
      return res.send({ id: tenant?.id || '' });
    }

    const tenants = await prisma.tenant.findMany({
      where: {
        //@ts-ignore
        users: {
          some: {
            //@ts-ignore
            userId: session.user.id,
          },
        },
      },
    });
    res.send(tenants);
  } else {
    res.send([]);
  }
};
