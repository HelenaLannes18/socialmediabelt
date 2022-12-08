//import { unstable_getServerSession } from 'next-auth/next';
import type { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from 'next-auth/react';
import { Tenant, } from '@prisma/client';
import { checkTenantPermission } from 'services/users';
import prisma from 'lib/prisma';
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2022-11-15'
})

interface SessionError {
    message: string
}
export default async (
    req: NextApiRequest,
    res: NextApiResponse<SessionError | Tenant>
) => {
    const session = await getSession({ req });



    if (session) {
        const tenantId = String(req.query.tenantId)

        //@ts-ignore
        const tenantPermission = await checkTenantPermission(tenantId, session.user.id)
        if (!tenantPermission) {
            return res.send({
                message: 'you need to be auth'
            })
        }
        if (req.method === 'POST') {
            try {


                const dbTenant = await prisma.tenant.findFirst({
                    where: {
                        id: tenantId
                    }
                })
                let stripeCustomerId = dbTenant?.stripeCustomer

                const subscription = await prisma.subscription.findFirst({
                    where: {
                        tenantId,
                        subscriptionStatus: true
                    }
                })
                if (subscription) {
                    stripeCustomerId = dbTenant?.stripeCustomer as string
                    const portalSession = await stripe.billingPortal.sessions.create({
                        customer: stripeCustomerId,
                        return_url: `${req.headers.origin}/app/${tenantId}/subscription?success=true`,
                    })
                    return res.redirect(303, portalSession.url as string);
                }
                if (!dbTenant?.stripeCustomer) {

                    //custumer id
                    const customer = await stripe.customers.create({
                        metadata: {
                            id: tenantId
                        }
                    })
                    await prisma.tenant.update({
                        where: {
                            id: tenantId
                        },
                        data: {
                            stripeCustomer: customer.id
                        }
                    })
                    stripeCustomerId = customer.id
                }
                // Create Checkout Sessions from body params.
                const session = await stripe.checkout.sessions.create({
                    client_reference_id: tenantId,
                    customer: stripeCustomerId as string,
                    line_items: [
                        {
                            // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
                            price: 'price_1MBewaDDlFjzihqgZkV75Rx2',
                            quantity: 1,
                        },
                    ],
                    mode: 'subscription',
                    success_url: `${req.headers.origin}/app/${tenantId}/subscription?success=true`,
                    cancel_url: `${req.headers.origin}/app/${tenantId}/subscription?canceled=true`,
                });


                return res.redirect(303, session.url as string);
            } catch (err) {
                return res.send({ message: 'error' })
            }


        }





    }
    return res.send({ message: 'error' })
}