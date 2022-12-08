import Heading2 from 'components/Heading2';
import { SubmitHandler, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/router';
import { deleteEntity, patch, post } from 'lib/fetch';
import { mutate } from 'swr';
import { useEffect, useState } from 'react';
import { useGet } from 'hooks/api';
import Link from 'next/link';
import ToggleHighlight from 'components/ToggleHighlight';

const titleSchema = yup
    .object({
        title: yup.string().required(),
    })
    .required();
interface NewTitleForm {
    title: string;
}

const PublicPageManage = () => {
    const router = useRouter();
    const [success, setSuccess] = useState(false);

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm<NewTitleForm>({
        resolver: yupResolver(titleSchema),
    });

    const submit: SubmitHandler<NewTitleForm> = async (inputs) => {
        await post({
            url: `/api/${router?.query?.tenantId}/items-on-public-page`,
            data: inputs,
        });
        mutate(`/api/${router?.query?.tenantId}/public-page`);
        setSuccess(true);
        //router.push(`/app/${router?.query?.tenantId}/links`)
    };
    const { data, mutate } = useGet(
        router?.query?.tenantId && `/api/${router?.query?.tenantId}/public-page`
    );
    useEffect(() => {
        // setValue('id', router?.query?.tenantId as string)
        // setValue('name', data.name)
        // setValue('slug', data.slug)
    }, [data]);
    const setNewOrder =
        (id1: string, order1: string, id2: string, order2: string) => async () => {
            await patch({
                url: `/api/${router?.query?.tenantId}/items-on-public-page/${id1}`,
                data: {
                    id: id1,
                    order: order1,
                },
            });

            await patch({
                url: `/api/${router?.query?.tenantId}/items-on-public-page/${id2}`,
                data: {
                    id: id2,
                    order: order2,
                },
            });
            await mutate();
        };
    const deleteItem = (itemId: string) => async () => {
        await deleteEntity({
            url: `/api/${router?.query?.tenantId}/items-on-public-page/${itemId}`,
        });
        await mutate();
    };

    if (!data) {
        return null;
    }

    return (
        <>
            <form
                onSubmit={handleSubmit(submit)}
                className="container max-w-2xl mx-auto shadow-md md:w-3/4 mt-4"
            >
                <div className="p-4 bg-gray-100 border-t-2 border-indigo-400 rounded-lg bg-opacity-5">
                    <div className="max-w-sm mx-auto md:w-full md:mx-0">
                        <div className="inline-flex items-center space-x-4">
                            <Heading2>Criar Title</Heading2>
                        </div>
                    </div>
                </div>
                {/* <pre>{JSON.stringify(data,null,2)}</pre> */}
                <div className="space-y-6 bg-white">
                    <div className="items-center w-full p-4 space-y-4 text-gray-500 md:inline-flex md:space-y-0">
                        <h2 className="max-w-sm mx-auto md:w-1/3">Titulo</h2>
                        <div className="max-w-sm mx-auto md:w-2/3 space-y-5">
                            <div>
                                <div className=" relative ">
                                    <input
                                        type="text"
                                        className=" rounded-lg border-transparent flex-1 appearance-none border border-gray-300 w-full py-2 px-4 bg-white text-gray-700 placeholder-gray-400 shadow-sm text-base focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                        placeholder="Titulo"
                                        {...register('title')}
                                    />
                                    {errors?.title?.message && <p>{errors?.title?.message}</p>}
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
            <div>
                {!!data?.map &&
                    //@ts-ignore
                    data?.map((item, index) => {
                        const prev = data?.[index - 1];
                        const next = data?.[index + 1];
                        return (
                            <div
                                key={item.id}
                                className="my-2 shadow rounded py-4 hover:bg-white flex flex-row"
                            >
                                <span className="flex-1 py-2">
                                    {item?.link?.publicName || item?.itemValue}
                                </span>
                                {index > 0 && (
                                    <button
                                        className="bg-gray-400 p-4 rounded"
                                        onClick={setNewOrder(
                                            item.id,
                                            prev?.order,
                                            prev?.id,
                                            item.order
                                        )}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-6 h-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M4.5 15.75l7.5-7.5 7.5 7.5"
                                            />
                                        </svg>
                                    </button>
                                )}
                                {index < data?.length - 1 && (
                                    <button
                                        className="bg-gray-400 p-4 rounded"
                                        onClick={setNewOrder(
                                            item.id,
                                            next?.order,
                                            next?.id,
                                            item.order
                                        )}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            strokeWidth={1.5}
                                            stroke="currentColor"
                                            className="w-6 h-6"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                                            />
                                        </svg>
                                    </button>
                                )}
                                <ToggleHighlight
                                    tenantId={item.tenantId}
                                    linkId={item.id}
                                    highlight={item.highlight}
                                />
                                <button
                                    className="bg-gray-400 p-4 rounded"
                                    onClick={deleteItem(item.id)}
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        strokeWidth={1.5}
                                        stroke="currentColor"
                                        className="w-6 h-6"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            d="M19.5 12h-15"
                                        />
                                    </svg>
                                </button>
                            </div>
                        );
                    })}
            </div>
        </>
    );
};
export default PublicPageManage;
