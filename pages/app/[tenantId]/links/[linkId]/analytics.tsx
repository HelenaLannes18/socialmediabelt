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
import { useEffect } from 'react';
import formatRelative from 'date-fns/formatRelative';
import { ptBR } from 'date-fns/locale';

const LinkAnalytics = () => {
    const router = useRouter();
    const cursor = router?.query?.cursor
        ? '?cursor=' + router?.query?.cursor
        : '';
    const { data } = useGet(
        router?.query?.tenantId && `/api/${router?.query?.tenantId}/links/${router?.query?.linkId}/analytics${cursor}`
    );



    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div>
                    <Heading1>Estatísticas do Link</Heading1>
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
                    <button
                        type="button"
                        className="w-full border text-base font-medium text-black bg-white hover:bg-gray-100 px-4 py-2"
                    >
                        Criar Grupo
                    </button>
                </div>
            </div>

            {data && data?.items?.length === 0 && (
                <Alert>O link ainda não foi utilizado.</Alert>
            )}
            {data && data?.items?.length > 0 && (
                <div className="container mx-auto px-4 sm:px-8 max-w-3xl">
                    <div className="py-8">
                        <div className="flex flex-row mb-1 sm:mb-0 justify-between w-full">
                            <h2 className="text-2xl leading-tight">Clicks</h2>

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
                                                Date
                                            </th>

                                            <th
                                                scope="col"
                                                className="px-5 py-3 bg-white  border-b border-gray-200 text-gray-800  text-left text-sm uppercase font-normal"
                                            >
                                                Browser
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
                                            data?.items?.map((click) => (
                                                <tr>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                        <div className="flex items-center">
                                                            <div className="ml-3">
                                                                <p className="text-gray-900 whitespace-no-wrap">
                                                                    <span title={click.createdAt}>
                                                                        {formatRelative(new Date(click.createdAt), new Date(), { locale: ptBR })}
                                                                    </span>
                                                                    <br />
                                                                    <span className="text-xm text-gray-500">
                                                                        {click.id}
                                                                    </span>

                                                                </p>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">


                                                        <span className="relative">{click?.metada?.headers?.['user-agent'] || 'NA'}</span>

                                                    </td>


                                                </tr>
                                            ))}
                                    </tbody>
                                </table>
                                <div className="px-5 bg-white py-5 flex flex-col xs:flex-row items-center xs:justify-between">
                                    <div className="flex items-center">
                                        <Link
                                            href={`/app/${router?.query?.tenantId}/links/${router?.query?.tenantId}/analytics?cursor=${data?.prevCursor}`}
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
                                            href={`/app/${router?.query?.tenantId}/links/${router?.query?.tenantId}/analytics?cursor=${data?.items[data?.items?.length - 1].id
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

export default LinkAnalytics;
