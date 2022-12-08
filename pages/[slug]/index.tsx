import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next';
import { findLinkBySlug } from 'services/links';
import { findTenantBySlug, findTenantByDomain } from 'services/tenants';
import { getPublicLinks } from 'services/links';
import Head from 'next/head';
//@ts-ignore
const TenantHome = ({ tenant, links, ...props }) => {
    //<pre>{JSON.stringify(links, null, 2)}</pre>
    return (
        <>
            <Head>
                <title>{tenant.name} - Links by Social Media</title>
                <meta
                    name="description"
                    content=" Todos os links do DevPleno você encontra aqui."
                ></meta>
            </Head>
            <div className="max-w-xl mx-auto pt-4">
                <h1 className="text-center font-bold text-4xl my-4">{tenant.name}</h1>
                {/* @ts-ignore */}
                {links.map(({ link, id, highlight, ...item }) => {
                    if (!link) {
                        return <h3 className='text-2xl font-bold text-center'>{item.itemValue}</h3>
                    }
                    return (
                        //esse que tem que trocar
                        <a
                            key={id}
                            href={link.destination}
                            className="transition-all bg-gray-800 text-white py-4 w-full block text-center"
                        >
                            {link.publicName}
                        </a>
                    );
                })}
                <hr />
                <footer className="text-center text-sm mt-2">
                    Construido com: Social Media Belt
                </footer>
            </div>
        </>
    );
};
//@ts-ignore
export const getServerSideProps = async (context) => {
    const slug = context.params.slug;
    let tenant = null;
    if (slug.indexOf('.') < 0) {
        tenant = await findTenantBySlug(context.params.slug);
        if (!tenant) {
            return {
                notFound: true,
            };
        }
    }

    const domain = await findTenantByDomain(context.params.slug);
    if (domain) {
        tenant = domain.tenant;
    }

    if (!tenant) {
        return {
            notFound: true,
        };
    }

    const links = await getPublicLinks(tenant?.id as string);

    return {
        props: {
            ...context.params,
            tenant,
            links,
        },
    };
};
export default TenantHome;
