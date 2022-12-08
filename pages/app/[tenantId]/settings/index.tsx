import Heading1 from 'components/Heading1';
import Heading2 from 'components/Heading2';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { post } from 'lib/fetch';
import { mutate } from 'swr';
import { useEffect, useState } from 'react';
import { useGet } from 'hooks/api';
import Link from 'next/link';

const settingsSchema = yup
    .object({
        name: yup.string().required(),
        slug: yup
            .string()
            .required('Informe um slug')
            .test(
                'is-slug-unique',
                'Esse slug já foi utilizado!',
                async (value, context) => {
                    const link = await fetch(
                        `/api/tenants?slug=${value}`
                    );
                    const linkData = await link.json();
                    if (linkData && linkData.id && linkData.id !== context.parent.id) {
                        return false;
                    }
                    return true;
                }
            ),
    })
    .required();
interface TenantSettingsForm {
    id: string
    name: string;
    slug: string;
}

const Settings = () => {
    const router = useRouter();
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<TenantSettingsForm>({
        resolver: yupResolver(settingsSchema),
    });

    const submit: SubmitHandler<TenantSettingsForm> = async (inputs) => {
        await post({
            url: `/api/${router?.query?.tenantId}/settings`,
            data: inputs,
        });
        mutate(`/api/tenants/${router?.query?.tenantId}`)
        setSuccess(true)
        //router.push(`/app/${router?.query?.tenantId}/links`)
    };
    const { data } = useGet(
        router?.query?.tenantId && `/api/tenants/${router?.query?.tenantId}`
    )
    useEffect(() => {
        setValue('id', router?.query?.tenantId as string)
        setValue('name', data.name)
        setValue('slug', data.slug)
    }, [data])

    return (


        <form
            onSubmit={handleSubmit(submit)}
            className="container max-w-2xl mx-auto shadow-md md:w-3/4 mt-4"
        >
            <div className="flex items-center">
                <Link href={`/app/${router?.query?.tenantId}/settings/domains`}>
                    <button
                        type="button"
                        className="w-full border-l border-t border-b text-base font-medium rounded-l-md text-black bg-white hover:bg-gray-100 px- py-1"
                    >
                        Gerenciar domínios
                    </button>
                </Link>

            </div>

            <div className="p-4 bg-gray-100 border-t-2 border-indigo-400 rounded-lg bg-opacity-5">
                <div className="max-w-sm mx-auto md:w-full md:mx-0">
                    <div className="inline-flex items-center space-x-4">
                        <Heading2>Configurações de Conta</Heading2>
                    </div>
                </div>

            </div>
            {/* <pre>{JSON.stringify(data,null,2)}</pre> */}
            <div className="space-y-6 bg-white">
                <div className="items-center w-full p-4 space-y-4 text-gray-500 md:inline-flex md:space-y-0">
                    <h2 className="max-w-sm mx-auto md:w-1/3">Identificação</h2>
                    <div className="max-w-sm mx-auto md:w-2/3 space-y-5">
                        <div>
                            <div className=" relative ">
                                <input
                                    type="text"
                                    className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    placeholder="Nome da Conta"
                                    {...register('name')}
                                />
                                {errors?.name?.message && <p>{errors?.name?.message}</p>}
                            </div>
                        </div>

                        <div>
                            <div className=" relative ">
                                <input
                                    type="text"
                                    className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    placeholder="Identificador (slug)"
                                    {...register('slug')}
                                />
                                {errors?.slug?.message && <p>{errors?.slug?.message}</p>}
                            </div>
                        </div>
                    </div>
                </div>
                <hr />

                <hr />
                <div className="w-full px-4 pb-4 ml-auto text-gray-500 md:w-1/3">
                    <button
                        type="submit"
                        className="py-2 px-4  bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 text-white w-full transition ease-in duration-200 text-center text-base font-semibold shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2  rounded-lg "
                    >
                        Save
                    </button>
                </div>
            </div>
        </form>
    )
}
export default Settings