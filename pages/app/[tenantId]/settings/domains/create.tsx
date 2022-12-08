import Heading1 from 'components/Heading1';
import Heading2 from 'components/Heading2';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { post } from 'lib/fetch';
import Link from 'next/link';
import { useEffect } from 'react';
import { setConstantValue } from 'typescript';

const domainSchema = yup
    .object({
        domainName: yup
            .string()
            .required('Informe um slug')
            .test(
                'is-slug-unique',
                'Esse dominio já foi utilizado!',
                async (value, context) => {
                    const tenant = await fetch(`api/${context.parent.tenantId}/domains?domainName=${value}`);

                    const tenantData = await tenant.json();
                    if (tenantData && tenantData.id) {
                        return false;
                    }
                    return true;
                }
            ),
    })
    .required();
interface NewDomainForm {
    domainName: string;
    tenantId: string;
}

// const fetcher = (...args) => fetch(...args).then((res) => res.json())

const CreateDomain = () => {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<NewDomainForm>({
        resolver: yupResolver(domainSchema),
    });

    useEffect(() => {
        setValue('tenantId', router.query.tenantId as string)
    }, [router])

    const submit: SubmitHandler<NewDomainForm> = async (inputs) => {
        const data = await post({
            url: `/api/${router.query.tenantId}/domains`,
            data: inputs,
        });
        router.push(`/app/${router.query.tenantId}/settings/domains`);
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2">
                <div>
                    <Heading1>Criar novo dominio</Heading1>
                </div>
            </div>
            <form
                onSubmit={handleSubmit(submit)}
                className="container max-w-2xl mx-auto shadow-md md:w-3/4 mt-4"
            >
                <div className="p-4 bg-gray-100 border-t-2 border-indigo-400 rounded-lg bg-opacity-5">
                    <div className="max-w-sm mx-auto md:w-full md:mx-0">
                        <div className="inline-flex items-center space-x-4">
                            <Heading2>Criar dominio</Heading2>
                        </div>
                    </div>
                </div>
                <div className="space-y-6 bg-white">
                    <div className="items-center w-full p-4 space-y-4 text-gray-500 md:inline-flex md:space-y-0">
                        <h2 className="max-w-sm mx-auto md:w-1/3">Nome do dominio</h2>
                        <div className="max-w-sm mx-auto md:w-2/3 space-y-5">
                            <div>
                                <div className=" relative ">
                                    <input
                                        type="text"
                                        className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        placeholder="Nome de dominio"
                                        {...register('domainName')}
                                    />
                                    {errors?.domainName?.message && (
                                        <p>{errors?.domainName?.message}</p>
                                    )}
                                </div>
                            </div>
                            <div></div>
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

export default CreateDomain;
