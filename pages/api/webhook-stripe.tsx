import { NextApiRequest, NextApiResponse } from 'next';
import Stripe from 'stripe';
import prisma from 'lib/prisma';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2022-11-15',
});
type Data = {
    ok: boolean;
};

export const config = {
    api: {
        bodyParser: false,
    },
};
//@ts-ignore
async function buffer(readable) {
    const chuncks = [];
    for await (const chunck of readable) {
        chuncks.push(typeof chunck === 'string' ? Buffer.from(chunck) : chunck);
    }
    return Buffer.concat(chuncks);
}

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<Data>
) {
    if (req.method === 'GET') {
        return res.send({
            ok: true,
        });
    }

    if (req.method === 'POST') {
        const buf = await buffer(req);
        const sig = req.headers['stripe-signature'];

        const webhookSecret =
            process.env.STRIPE_WEBHOOK_LIVE ?? process.env.STRIPE_WEBHOOK_SECRET
        let event;

        try {
            event = stripe.webhooks.constructEvent(
                buf,
                sig as string,
                webhookSecret as string
            );

            const checkoutSession = event.data.object as Stripe.Checkout.Session


            switch (event.type) {
                case 'customer.subscription.created':
                case 'customer.subscription.updated':
                case 'customer.subscription.deleted':
                    //@ts-ignore
                    const stripeSubscriptionId = event?.data?.object?.id
                    //@ts-ignore
                    const status = event?.data?.object?.status
                    //@ts-ignore
                    const stripeCustomerId = event?.data?.object?.customer
                    //@ts-ignore
                    const currentPeriodStart = new Date(event?.data?.object?.current_period_start * 1000)
                    //@ts-ignore
                    const currentPeriodEnd = new Date(event?.data?.object?.current_period_end * 1000)

                    const tenant = await prisma.tenant.findFirst({
                        where: {
                            stripeCustomer: stripeCustomerId
                        }
                    })

                    const subscription = await prisma.subscription.findFirst({
                        where: {
                            tenantId: tenant?.id,
                            stripeId: stripeSubscriptionId
                        }
                    })

                    if (subscription) {
                        //update
                        await prisma.subscription.update({
                            where: {
                                id: subscription.id
                            },
                            data: {
                                subscriptionStatus: status === 'active',
                                currentPeriodStart,
                                currentPeriodEnd
                            }
                        })
                    } else {
                        await prisma.subscription.create({
                            data: {
                                tenantId: tenant?.id as string,
                                subscriptionStatus: true,
                                stripeId: stripeSubscriptionId,
                                currentPeriodStart,
                                currentPeriodEnd
                            }
                        })
                    }
                    // const subscription = await prisma.subscription.upsert({
                    //     update:{
                    //         subscriptionStatus: true
                    //     },
                    //     create:{
                    //         stripeId: 'aaaa',
                    //         subscriptionStatus:true,
                    //         tenantId: 'tenantId'
                    //     },
                    //     where:{

                    //     }
                    // })
                    //       await manageSubscriptionStatusChange(
                    //         event.data.object.id,
                    //       event.data.object.custumer,
                    //       event.type === 'customer.subscription.created'
                    //   )
                    break
                case 'checkout.session.completed':
                    //       const checkoutSession = event.data.object
                    //       if(checkoutSession.mode === 'subscription') {
                    //        const subscriptionId = checkoutSession.subscription
                    //        await manageSubscriptionStatusChange(
                    //           subscriptionId,
                    //           checkoutSession.customer,
                    //           true
                    //   )
                    //   }
                    break
                default:
                    throw new Error('Unhandled relevant event!')
            }

        } catch (err) {
            //@ts-ignore
            console.log(`Error message: ${err.message}`);
            return res.status(400).send({ ok: false });
        }
    }
    res.status(200).json({
        ok: false,
    });
}
