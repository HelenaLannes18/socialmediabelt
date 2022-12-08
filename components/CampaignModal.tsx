import { Dialog, Transition } from '@headlessui/react';
import { useGet } from 'hooks/api';
import { Fragment, useState, useEffect } from 'react';

const Arrow = () => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-6 w-6 inline-block mx-2"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
    >
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M17 8l4 4m0 0l-4 4m4-4H3"
        />
    </svg>
);

//@ts-ignore
const SelectParams = ({ data, setParams }) => {
    const [selectedCampaign, setCampaign] = useState('');
    const [source, setSource] = useState('');
    const [stage, setStage] = useState(0);
    const [medium, setMedium] = useState('');
    //@ts-ignore
    const changeState = (stageNumber) => {
        setStage(stageNumber);

        if (stageNumber === 0) {
            setCampaign('');
            setSource('');
            setMedium('');
        }
        if (stageNumber === 1) {
            setSource('');
            setMedium('');
        }
        if (stageNumber === 2) {
            setMedium('');
        }
    };

    useEffect(() => {
        const campaign = data?.items?.find(
            //@ts-ignore
            (campaign) => campaign.id === selectedCampaign
        );
        setParams({
            utm_source: source,
            utm_id: campaign?.urlParams?.campaignId,
            utm_campaign: campaign?.urlParams?.campaignName,
            utm_medium: medium,
        });
    }, [selectedCampaign, source, medium]);

    const campaignName = data?.items?.find(
        //@ts-ignore
        (campaign) => campaign.id === selectedCampaign
    )?.name;

    return (
        <div className="py-2 px-4 border mt-1">
            <button
                className="underline hover:text-slate-400"
                //@ts-ignore
                onClick={() => changeStage(0)}
            >
                Origem
            </button>
            {stage > 0 && (
                <>
                    <Arrow />
                    <button
                        className="underline hover:text-slate-400"
                        //@ts-ignore
                        onClick={() => changeStage(1)}
                    >
                        {campaignName}
                    </button>
                </>
            )}
            {stage > 1 && (
                <>
                    <Arrow />
                    <button
                        className="underline hover:text-slate-400"
                        //@ts-ignore
                        onClick={() => changeStage(2)}
                    >
                        {source}
                    </button>
                </>
            )}
            {stage > 2 && (
                <>
                    <Arrow />
                    <span>{medium}</span>
                </>
            )}
            {selectedCampaign === '' && (
                <p className="text-sm text-gray-500">
                    <span className="font-bold">Selecione a campanha:</span>
                    <br />
                    {data &&
                        data.items &&
                        //@ts-ignore
                        data.items.map((campaign) => {
                            return (
                                <div>
                                    <button
                                        className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded text-black mr-1"
                                        onClick={() => {
                                            setCampaign(campaign.id);
                                            setStage(1);
                                        }}
                                    >
                                        {campaign.name}
                                    </button>
                                </div>
                            );
                        })}
                </p>
            )}
            {selectedCampaign !== '' && source === '' && (
                <p className="text-sm text-gray-500">
                    <span className="font-bold">Selecione o source:</span>
                    <br />
                    {data &&
                        data.items &&
                        data.items
                            //@ts-ignore
                            .filter((i) => i.id === selectedCampaign)[0]
                            //@ts-ignore
                            .urlParams.campaignSource.map((source) => {
                                return (
                                    <button
                                        className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded text-black mr-1"
                                        onClick={() => {
                                            setSource(source);
                                            setStage(2);
                                        }}
                                    >
                                        {source}
                                    </button>
                                );
                            })}
                </p>
            )}
            {selectedCampaign !== '' && source !== '' && medium === '' && (
                <p className="text-sm text-gray-500">
                    <span className="font-bold">Selecione o medium:</span>
                    <br />
                    {data &&
                        data.items &&
                        data.items
                            //@ts-ignore
                            .filter((i) => i.id === selectedCampaign)[0]
                            //@ts-ignore
                            .urlParams.campaignMedium.map((medium) => {
                                return (
                                    <button
                                        className="bg-gray-300 hover:bg-gray-400 py-2 px-4 rounded text-black mr-1"
                                        onClick={() => {
                                            setMedium(medium);
                                            setStage(3);
                                        }}
                                    >
                                        {medium}
                                    </button>
                                );
                            })}
                </p>
            )}
        </div>
    );
};

//@ts-ignore
function CampaignModal({ tenantId, url, shouldOpen = 0 }) {
    const [isOpen, setIsOpen] = useState(false);
    const [SelectedParams, setSelectedParams] = useState({});
    const { data } = useGet(`/api/${tenantId}/campaigns`);

    useEffect(() => {
        if (shouldOpen > 0) {
            setIsOpen(true);
        }
    }, [shouldOpen]);

    const hasCampaigns = data?.items?.lenght > 0;

    function closeModal() {
        setIsOpen(false);
    }

    function openModal() {
        setIsOpen(true);
    }

    const copyUrlToClipboard = async () => {
        const urlParamsStr = Object.keys(SelectedParams)
            //@ts-ignore
            .map((key) => key + '=' + selectedParams(key))
            .join('&');
        navigator.clipboard.writeText(url + '?' + urlParamsStr);
    };

    const copyRawUrlToClipboard = () => {
        navigator.clipboard.writeText(url);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-10" onClose={closeModal}>
                <div className="min-h-screen px-4 text-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100"
                        leaveTo="opacity-0"
                    >
                        <Dialog.Overlay className="fixed inset-0" />
                    </Transition.Child>
                    <span
                        className="inline-block h-screen align-middle"
                        aria-hidden="true"
                    >
                        &#8203;
                    </span>
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl" />
                        <button
                            type="button"
                            className="absolute top-2 right-2 inline-flex justify-center rounded-md border border-transparent bg-blue-100 px-4 py-2 text-sm font-medium text-blue-900 hover:bg-blue-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
                            onClick={closeModal}
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
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>
                        <Dialog.Title
                            as="h3"
                            className="text-lg font-medium leading-6 text-gray-900"
                        >
                            {hasCampaigns
                                ? 'Copiar link ou Selecione uma campanha'
                                : 'Copiar link'}
                        </Dialog.Title>
                        <div className="bg-gray-200 rounded py-2 px-4">
                            <p className="bg-gray-200 rounded py-2 px-4">
                                <span className="text-xs font-bold inline-block">Destino:</span>
                                <br />
                                {url}
                            </p>

                            {hasCampaigns && (
                                <SelectParams data={data} setParams={setSelectedParams} />
                            )}
                        </div>
                    </Transition.Child>
                    <div className="mt-4">
                        {hasCampaigns && (
                            <button
                                type="button"
                                className="inline-flex justify-center px-4 py-2 text-sm font-medium"
                                onClick={copyUrlToClipboard}
                            >
                                Copy link with UTMs
                            </button>
                        )}
                        <button
                            type="button"
                            className="inline-flex justify-center px-4 py-2 text-sm font-medium"
                            onClick={copyRawUrlToClipboard}
                        >
                            Copy link without UTMs
                        </button>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

export default CampaignModal;
