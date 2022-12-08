import { Switch } from '@headlessui/react';
import { patch } from 'lib/fetch';
import { useState } from 'react';


interface Props {
    tenantId: string
    linkId: string
    itemOnPublicPage: string
}
const TogglePublicPage = ({ linkId, tenantId, itemOnPublicPage = '' }: Props) => {
    const [enabled, setEnabled] = useState(itemOnPublicPage !== '')
    const toggle = async (isEnabled: boolean) => {
        if (isEnabled) {
            const data = await patch({
                url: `/api/${tenantId}/links/${linkId}/toggle-public-page`,
                data: {
                    tenantId,
                    linkId,
                    action: 'add'
                }
            });
            setEnabled(true)
        }
        else {
            const data = await patch({
                url: `/api/${tenantId}/links/${linkId}/toggle-public-page`,
                data: {
                    tenantId,
                    linkId,
                    action: 'remove'
                }
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

export default TogglePublicPage