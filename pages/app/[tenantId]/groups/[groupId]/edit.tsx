import Heading1 from 'components/Heading1';
import Heading2 from 'components/Heading2';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { patch, post } from 'lib/fetch';
import Link from 'next/link';
import { useGet } from 'hooks/api';
import { useEffect, useState } from 'react';

const groupSchema = yup
    .object({
        name: yup.string().required(),
    })
    .required();
interface EditGroupForm {
    name: string;
    tenantId: string;
    id: string;
}

// const fetcher = (...args) => fetch(...args).then((res) => res.json())

const EditLinkGroup = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<EditGroupForm>({
        resolver: yupResolver(groupSchema),
    });

    const { data } = useGet(
        router?.query?.tenantId &&
        router?.query?.groupId &&
        `/api/${router?.query?.tenantId}/groups/${router?.query?.groupId}`
    );

    useEffect(() => {
        if (data) {
            setValue('tenantId', String(router?.query?.tenantId));
            setValue('id', String(router?.query?.linkId));
            setValue('name', data?.name);

        }
    }, [data]);

    const submit: SubmitHandler<EditGroupForm> = async (inputs) => {
        const data = await patch({
            url: `/api/${router?.query?.tenantId}/groups/${router?.query?.groupId}`,
            data: inputs,
        });
        router.push(`/app/${router?.query?.tenantId}/groups`)
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div>
                    <Heading1>Gerenciador de Grupos</Heading1>

                </div>
                {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
                <div className="flex items-center">
                    <Link href={`/app/${router?.query?.tenantId}/links/create`}>
                        <button
                            type="button"
                            className="w-full border-l border-t border-b text-base font-medium rounded-l-md text-black bg-white hover:bg-gray-100 px-4 py-2"
                        >
                            Editar grupo
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

            <form
                onSubmit={handleSubmit(submit)}
                className="container max-w-2xl mx-auto shadow-md md:w-3/4 mt-4"
            >
                <div className="p-4 bg-gray-100 border-t-2 border-indigo-400 rounded-lg bg-opacity-5">
                    <div className="max-w-sm mx-auto md:w-full md:mx-0">
                        <div className="inline-flex items-center space-x-4">
                            <Heading2>Criar link</Heading2>
                        </div>
                    </div>
                </div>
                <div className="space-y-6 bg-white">
                    <div className="items-center w-full p-4 space-y-4 text-gray-500 md:inline-flex md:space-y-0">
                        <h2 className="max-w-sm mx-auto md:w-1/3">Identificação</h2>
                        <div className="max-w-sm mx-auto md:w-2/3 space-y-5">
                            <div>
                                <div className=" relative ">
                                    <input
                                        type="text"
                                        className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        placeholder="Nome interno"
                                        {...register('name')}
                                    />
                                    {errors?.name?.message && <p>{errors?.name?.message}</p>}
                                </div>
                            </div>

                        </div>
                    </div>



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
        </>
    );
};

export default EditLinkGroup;
