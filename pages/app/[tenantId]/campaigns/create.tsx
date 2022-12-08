import Heading1 from 'components/Heading1';
import Heading2 from 'components/Heading2';
import { SubmitHandler, useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { post } from 'lib/fetch';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import AsyncCreatableSelect from 'react-select/async-creatable';
import CreatableSelect from 'react-select/creatable';

const linkSchema = yup
    .object({
        name: yup.string().required(),

    })
    .required();

interface GroupOptionForm {
    label: string;
    value: string;
    __isNew__?: boolean;
}


interface NewCampaignForm {
    name: string;
    tenantId: string;
    groups: GroupOptionForm[];
    urlParams: {
        campaignId: string;
        campaignName: string;
        campaignSource: string[];
        campaignMedium: string[];
    };
}

// const fetcher = (...args) => fetch(...args).then((res) => res.json())

const CreateCampaign = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        control,
        watch,
        formState: { errors },
    } = useForm<NewCampaignForm>({
        resolver: yupResolver(linkSchema),
    });

    const submit: SubmitHandler<NewCampaignForm> = async (inputs) => {
        const urlParams = {
            ...inputs.urlParams,
            //@ts-ignore
            campaignSource: inputs.urlParams.campaignSource.map((i) => i.value),
            //@ts-ignore
            campaignMedium: inputs.urlParams.campaignMedium.map((i) => i.value),

        }
        inputs.urlParams = urlParams
        const data = await post({
            url: `/api/${router?.query?.tenantId}/campaigns`,
            data: inputs,
        });
        router.push(`/app/${router?.query?.tenantId}/campaigns`);
    };

    useEffect(() => {
        setValue('tenantId', String(router?.query?.tenantId));
    }, [router.query]);



    console.log(watch('urlParams.campaignSource'));
    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div>
                    <Heading1>Gerenciador de Campaigns</Heading1>
                </div>
                {/* <pre>{JSON.stringify(data, null, 2)}</pre> */}
            </div>

            <form
                onSubmit={handleSubmit(submit)}
                className="container max-w-2xl mx-auto shadow-md md:w-3/4 mt-4"
            >
                <div className="p-4 bg-gray-100 border-t-2 border-indigo-400 rounded-lg bg-opacity-5">
                    <div className="max-w-sm mx-auto md:w-full md:mx-0">
                        <div className="inline-flex items-center space-x-4">
                            <Heading2>Criar Campaign</Heading2>
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
                            <div>
                                <div className=" relative ">
                                    <input
                                        type="text"
                                        className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        placeholder="Campaign Id"
                                        {...register('urlParams.campaignId')}
                                    />
                                    {errors?.urlParams?.campaignId?.message && (
                                        <p>{errors?.urlParams?.campaignId?.message}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className=" relative ">
                                    <input
                                        type="text"
                                        className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        placeholder="campaign Name"
                                        {...register('urlParams.campaignName')}
                                    />
                                    {errors?.urlParams?.campaignName?.message && (
                                        <p>{errors?.urlParams?.campaignName?.message}</p>
                                    )}
                                </div>
                            </div>
                            <div>
                                <div className="relative ">
                                    <Controller
                                        name="urlParams.campaignSource"
                                        control={control}
                                        render={({ field }) => (
                                            <CreatableSelect
                                                {...field}
                                                isClearable
                                                isMulti
                                                placeholder="Campaign source"
                                            />
                                        )}
                                    />
                                    {errors?.urlParams?.campaignSource?.message && (
                                        <p>{errors?.urlParams?.campaignSource?.message}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <div className="relative ">
                                    <Controller
                                        name="urlParams.campaignMedium"
                                        control={control}
                                        render={({ field }) => (
                                            <CreatableSelect
                                                {...field}
                                                isClearable
                                                isMulti
                                                placeholder="Campaign medium"
                                            />
                                        )}
                                    />
                                    {errors?.urlParams?.campaignMedium?.message && (
                                        <p>{errors?.urlParams?.campaignMedium?.message}</p>
                                    )}
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

export default CreateCampaign;
