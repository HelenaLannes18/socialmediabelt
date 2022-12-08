import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next';
import { findLinkBySlug } from 'services/links';
import { findTenantBySlug } from 'services/tenants';
import prisma from 'lib/prisma';
//@ts-ignore
const GoPage = (props) => {
    return <pre>{JSON.stringify(props, null, 2)}</pre>;
};
//@ts-ignore
export const getServerSideProps = async (context) => {
    const slug = context.params.slug
    let tenant = null
    if (slug.indexOf('.') < 0) {
        tenant = await findTenantBySlug(context.params.slug);
        if (!tenant) {
            return {
                notFound: true,
            };
        }
    }
    //@ts-ignore
    const link = await findLinkBySlug(tenant?.id, context.params.link);
    if (!link) {
        return {
            notFound: true,
        };
    }

    //couting clicks
    const click = await prisma.click.create({
        data: {
            metadata: { headers: context.req.headers },
            linkId: link.id
        }
    })


    // return context.res
    //     .writeHead(301, {
    //         'Content-Type': 'text/plain',
    //         Location: link.destination
    //     })
    //     .end();

    return {
        props: {
            ...context.params,
            tenant,
            link,
        },
    };
};
export default GoPage;
