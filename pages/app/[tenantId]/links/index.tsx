import Heading1 from 'components/Heading1';
import Heading2 from 'components/Heading2';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { fetchData } from 'next-auth/client/_utils';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { useGet } from 'hooks/api';
import { deleteEntity, post } from 'lib/fetch';
import Alert from 'components/Alert';
import Link from 'next/link';
import TogglePublicPage from 'components/TogglePublicPage';
import { useEffect, useState } from 'react';
import ToggleFavorite from 'components/ToggleFavorite';
import CampaignModal from 'components/CampaignModal';







//começa aqui a doidera

const linkSchema = yup
    .object({
        name: yup.string().required(),
        publicName: yup.string().required(),
        slug: yup.string().required(),
        destination: yup.string().required(),
        appLink: yup.string().required(),
    })
    .required();

interface NewLinkForm {
    name: string;
    publicName: string;
    slug: string;
    destination: string;
    appLink: string;
}



const Links = () => {
    const router = useRouter();
    const [selectedUrl, setSelectedUrl] = useState('');
    const [isCopyModalOpen, setCopyModalOpen] = useState(0)
    const cursor = router?.query?.cursor
        ? '?cursor=' + router?.query?.cursor
        : '';
    const { data, mutate } = useGet(
        router?.query?.tenantId && `/api/${router?.query?.tenantId}/links${cursor}`
    );

    useEffect(() => {
        if (data && router) {
            if (router?.query?.cursor) {
                console.log({ data, router })
                if (data.items.length === 0) {
                    router.push(`/app/${router?.query?.tenantId}/links`);
                }
            }
        }
    }, [data, router]);
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<NewLinkForm>({
        resolver: yupResolver(linkSchema),
    });
    const submit: SubmitHandler<NewLinkForm> = async (inputs) => {
        const data = await post({
            url: `/api/${router?.query?.tenantId}/links`,
            data: inputs,
        });

        await mutate();
    };
    const deleteLink = async (id: string) => {
        await deleteEntity({ url: `/api/${router?.query?.tenantId}/links/${id}` });
        await mutate();
    };
    const setUrl = (url: string) => () => {
        setSelectedUrl(url);
        setCopyModalOpen((curr) => curr + 1)
    }


    return (
        <>
            <CampaignModal tenantId={router?.query?.tenantId}
                url={selectedUrl}
                shouldOpen={isCopyModalOpen} />
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div>
                    <Heading1>Gerenciador de Links</Heading1>
                    <Heading2>Gerenciador de Links</Heading2>
                </div>

                {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
                <div className="flex items-center">
                    <Link href={`/app/${router?.query?.tenantId}/links/create`}>
                        <button
                            type="button"
                            className="w-full border-l border-t border-b text-base font-medium rounded-l-md text-black bg-white hover:bg-gray-100 px- py-1"
                        >
                            Criar Link
                        </button>
                    </Link>
                    <Link href={`/app/${router?.query?.tenantId}/groups`}>
                        <button
                            type="button"
                            className="w-full border text-base font-medium text-black bg-white hover:bg-gray-100 px-4 py-2"
                        >
                            Gerenciar Grupos
                        </button>
                    </Link>
                </div>
            </div>

            {data && data?.items?.length === 0 && (
                <Alert>Nenhum link cadastrado.</Alert>
            )}
            {data && data?.items?.length > 0 && (
                <div className="container mx-auto px-4 sm:px-8 max-w-3xl">
                    <div className="py-8">
                        <div className="flex flex-row mb-1 sm:mb-0 justify-between w-full">
                            <h2 className="text-2xl leading-tight">Links</h2>
                            <div className="text-end">
                                <form className="flex flex-col md:flex-row w-3/4 md:w-full max-w-sm md:space-x-3 space-y-3 md:space-y-0 justify-center">
                                    <div className=" relative ">
                                        <input
                                            type="text"
                                            id='"form-subscribe-Filter'
                                            className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                            placeholder="name"
                                        />
                                    </div>
                                    <button
                                        className="flex-shrink-0 px-4 py-2 text-base font-semibold text-white bg-purple-600 rounded-lg shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-purple-200"
                                        type="submit"
                                    >
                                        Filter
                                    </button>
                                </form>
                            </div>
                        </div>
                        <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                            <div className="inline-block min-w-full shadow rounded-lg overflow-hidden">
                                <table className="min-w-full leading-normal">
                                    <thead>
                                        <tr>
                                            <th
                                                scope="col"
                                                className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                            >
                                                Name
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                            >
                                                clicks
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                            >
                                                status
                                            </th>
                                            <th
                                                scope="col"
                                                className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                            ></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data &&
                                            //@ts-ignore
                                            data?.items?.map((link) => (
                                                <tr>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                        <div className="flex items-center">
                                                            <div className="ml-3">
                                                                <p className="text-gray-900 whitespace-no-wrap">
                                                                    <ToggleFavorite
                                                                        linkId={link.id}
                                                                        tenantId={router?.query?.tenantId as string}
                                                                        isFavorite={link.favorite} />



                                                                    {link.name} -{' '}
                                                                    <span className="text-xm text-gray-500">
                                                                        {link.publicName}
                                                                    </span>
                                                                    <br />
                                                                    {link.destination}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                        <span className="relative inline-block px-3 py-1 font-semibold text-green-900 leading-tight">
                                                            <span
                                                                aria-hidden="true"
                                                                className="absolute inset-0 bg-green-200 opacity-50 rounded-full"
                                                            ></span>
                                                            <Link
                                                                href={`/app/${router?.query?.tenantId}/links/${link.id}/analytics`}
                                                                passHref
                                                                legacyBehavior
                                                            >
                                                                <a className="relative">{link.clicks}</a>
                                                            </Link>
                                                        </span>
                                                    </td>

                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                        <TogglePublicPage
                                                            linkId={link.id}
                                                            tenantId={router?.query?.tenantId as string}
                                                            itemOnPublicPage={link?.itemOnPublicPage?.[0]?.id}
                                                        />
                                                    </td>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                        <button onClick={setUrl(link.destination)}>
                                                            Copy
                                                        </button>
                                                        <Link
                                                            href={`/app/${router?.query?.tenantId}/links/${link.id}/edit`}
                                                            passHref
                                                            legacyBehavior
                                                        >
                                                            <a className="inline-block mx-1 text-indigo-600 hover:text-indigo-900">
                                                                Edit
                                                            </a>
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteLink(link.id)}
                                                            className="inline-block mx-1 text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                <div className="px-5 bg-white py-5 flex flex-col xs:flex-row items-center xs:justify-between">
                                    <div className="flex items-center">
                                        <Link
                                            href={`/app/${router?.query?.tenantId}/links?cursor=${data?.prevCursor}`}
                                        >
                                            <button
                                                type="button"
                                                className="w-full p-4 border text-base rounded-l-xl text-gray-600 bg-white hover:bg-gray-100"
                                                disabled={!data.prevCursor}
                                            >
                                                <svg
                                                    width={9}
                                                    fill="currentColor"
                                                    height={8}
                                                    viewBox="0 0 1792 1792"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M1427 301l-531 531 531 531q19 19 19 45t-19 45l-166 166q-19 19-45 19t-45-19l-742-742q-19-19-19-45t19-45l742-742q19-19 45-19t45 19l166 166q19 19 19 45t-19 45z"></path>
                                                </svg>
                                            </button>
                                        </Link>
                                        <Link
                                            href={`/app/${router?.query?.tenantId}/links?cursor=${data?.items[data?.items?.length - 1].id
                                                }`}
                                        >
                                            <button
                                                type="button"
                                                className="w-full p-4 border-t border-b border-r text-base  rounded-r-xl text-gray-600 bg-white hover:bg-gray-100"
                                                disabled={!data.nextCursor}
                                            >
                                                <svg
                                                    width={9}
                                                    fill="currentColor"
                                                    height={8}
                                                    viewBox="0 0 1792 1792"
                                                    xmlns="http://www.w3.org/2000/svg"
                                                >
                                                    <path d="M1363 877l-742 742q-19 19-45 19t-45-19l-166-166q-19-19-19-45t19-45l531-531-531-531q-19-19-19-45t19-45l166-166q19-19 45-19t45 19l742 742q19 19 19 45t-19 45z"></path>
                                                </svg>
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Links;
