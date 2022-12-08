import { Switch } from '@headlessui/react';
import { patch } from 'lib/fetch';
import { useState } from 'react';


interface Props {
    tenantId: string
    linkId: string
    highlight: boolean
}
const ToggleHighlight = ({ linkId, tenantId, highlight = false }: Props) => {
    const [enabled, setEnabled] = useState(highlight)
    const toggle = async (isEnabled: boolean) => {
        if (isEnabled) {

            await patch({
                url: `/api/${tenantId}/items-on-public-page/${linkId}`,
                data: {
                    id: linkId,
                    highlight: true
                },
            });


            setEnabled(true)
        }
        else {
            await patch({
                url: `/api/${tenantId}/items-on-public-page/${linkId}`,
                data: {
                    id: linkId,
                    highlight: false
                },
            });
            setEnabled(false)
        }
    }
    return (
        <Switch
            checked={enabled}
            onChange={toggle}
            className={`${enabled ? 'bg-teal-900' : 'bg-teal-700'
                }
          relative inline-flex h-[38px] w-[74px] shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2  focus-visible:ring-white focus-visible:ring-opacity-75`}
        >
            <span className="sr-only">Use setting</span>

            <span
                aria-hidden="true"
                className={`${enabled ? 'translate-x-9' : 'translate-x-0'
                    }
            pointer-events-none inline-block h-[34px] w-[34px] transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out`}
            />
        </Switch>
    )
}

export default ToggleHighlight