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

// const fetcher = (...args) => fetch(...args).then((res) => res.json())

const Tenants = () => {
    const router = useRouter();
    const { data, mutate } = useGet(`/api/tenants`);

    useEffect(() => {
        if (data && router) {
            if (router?.query?.cursor) {
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

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div>
                    <Heading1>Minhas contas</Heading1>
                </div>
                {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
                <div className="flex items-center">
                    <Link href={`/app/tenants/create`}>
                        <button
                            type="button"
                            className="w-full border text-base font-medium rounded-md text-black bg-white hover:bg-gray-100 px- py-1"
                        >
                            Criar Nova Conta
                        </button>
                    </Link>
                </div>
            </div>

            {data && data?.length === 0 && <Alert>Nenhum link cadastrado.</Alert>}
            {data && data?.length > 0 && (
                <div className="container mx-auto px-4 sm:px-8 max-w-3xl">
                    <div className="py-8">
                        <div className="flex flex-row mb-1 sm:mb-0 justify-between w-full">
                            <h2 className="text-2xl leading-tight">Links</h2>
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
                                                plan
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
                                            data?.map((tenant) => (
                                                <tr>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                        <div className="flex items-center">
                                                            <div className="ml-3">
                                                                <p className="text-gray-900 whitespace-no-wrap">
                                                                    {tenant.name}<br />
                                                                    <span className="text-xm text-gray-500">
                                                                        {tenant.slug}.socialmediabelt.com
                                                                    </span>

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
                                                            <span className="relative">{tenant.plan}</span>
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                        <a
                                                            href="#"
                                                            className="inline-block mx-1 text-indigo-600 hover:text-indigo-900"
                                                        >
                                                            Edit
                                                        </a>
                                                        <button
                                                            //@ts-ignore
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
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Tenants;
