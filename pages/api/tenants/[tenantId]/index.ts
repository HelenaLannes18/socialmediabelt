//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import prisma from 'lib/prisma';
import { Prisma } from '@prisma/client';
import { save } from 'services/links';
import { create } from 'services/tenants';
type TenantData = {
  id: string;
  name: string;
  slug: string;
};

export default async (
  req: NextApiRequest,
  res: NextApiResponse<TenantData | TenantData | null>
) => {
  const session = await getSession({ req });
  const tenantId = String(req.query.tenantId) || '';
  if (session) {
    const tenant = await prisma.tenant.findFirst({
      where: {
        //@ts-ignore
        id: tenantId,
      },
    });
    res.send(tenant);
  } else {
    res.send(null);
  }
};
