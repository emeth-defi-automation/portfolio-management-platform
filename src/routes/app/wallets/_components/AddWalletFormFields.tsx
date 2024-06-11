import {
    type QRL,
    component$,
    $,
    useContext,
    useVisibleTask$,
    useSignal,
    useTask$,
} from "@builder.io/qwik";
import { getAddress } from "viem";
import { Input } from "~/components/Input/Input";

import { useDebouncer } from "~/utils/debouncer";
import {
    isAddressUnique,
    isCheckSum,
    isNameUnique,
    isValidAddress,
    isValidName,
} from "~/utils/validators/addWallet";
import IconSuccess from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";
import IconWarning from "@material-design-icons/svg/filled/warning_amber.svg?jsx";
import Button from "~/components/Atoms/Buttons/Button";
import { type AddWalletFormStore } from "~/routes/app/wallets/interface";
import Tag from "~/components/Atoms/Tags/Tag";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { type Config, watchAccount } from "@wagmi/core";
export interface AddWalletFormFieldsProps {
    addWalletFormStore: AddWalletFormStore;
    onConnectWalletClick: QRL<() => void>;
}

export default component$<AddWalletFormFieldsProps>(
    ({ addWalletFormStore, onConnectWalletClick }) => {
        const newWalletNameInput = useSignal<HTMLInputElement>();
        const nameInputDebounce = useDebouncer(
            $(async (value: string) => {
                addWalletFormStore.isNameUniqueLoading = true;
                addWalletFormStore.isNameUnique = await isNameUnique(value);
                addWalletFormStore.isNameUniqueLoading = false;
            }),
            300,
        );
        const walletAddressDebounce = useDebouncer(
            $(async (value: string) => {
                addWalletFormStore.isAddressUnique = await isAddressUnique(value);
            }),
            300,
        );

        const wagmiConfig = useContext(WagmiConfigContext);
        const connectedAddress = useSignal<any>(
            localStorage.getItem("emmethUserWalletAddress"),
        );
        // eslint-disable-next-line qwik/no-use-visible-task
        useVisibleTask$(({ track }) => {
            track(() => connectedAddress.value);
            if (wagmiConfig.config) {
                watchAccount(wagmiConfig.config as Config, {
                    onChange: (account) => {
                        if (account.address != connectedAddress.value) {
                            connectedAddress.value = account.address;
                        }
                    },
                });
            }
        });

        useTask$(async ({ track }) => {
            track(() => {
                addWalletFormStore.isExecutable;
                newWalletNameInput.value?.focus();
            });
        });

        return (
            <>
                {/* network */}
                <div class="mb-4">
                    <label for="network" class="custom-text-50 pb-2 text-xs uppercase">
                        Network
                    </label>
                    <Input
                        type="text"
                        name="network"
                        placeholder="Select network"
                        disabled={true}
                    />
                </div>
                {/* Name */}
                <div>
                    {!isValidName(addWalletFormStore.name) && (
                        <span class="absolute end-6 pt-[1px] text-xs text-red-500">
                            Name too short
                        </span>
                    )}
                    {!addWalletFormStore.isNameUnique && (
                        <span class="absolute end-6 pt-[1px] text-xs text-red-500">
                            Name already exists
                        </span>
                    )}
                    <Input
                        text="Wallet Name"
                        type="text"
                        ref={newWalletNameInput}
                        name="name"
                        customClass={`
                ${!isValidName(addWalletFormStore.name) ? "border-red-700" : ""}`}
                        value={addWalletFormStore.name}
                        placeholder="Enter wallet name..."
                        onInput={$(async (e) => {
                            const target = e.target as HTMLInputElement;
                            addWalletFormStore.name = target.value;
                            nameInputDebounce(target.value);
                        })}
                    />
                </div>
                {/* Address */}
                <div>
                    {!addWalletFormStore.isAddressUnique && (
                        <span class="absolute end-6 pt-[1px] text-xs text-red-500">
                            Wallet already exists
                        </span>
                    )}
                    <label
                        for="address"
                        class="flex items-center justify-between gap-2 text-xs"
                    >
                        <span class="custom-text-50">Wallet Address</span>
                        {!addWalletFormStore.isExecutable ? (
                            <div>
                                {!isValidAddress(addWalletFormStore.address) ? (
                                    <span class=" text-xs text-red-500">Invalid address</span>
                                ) : !isCheckSum(addWalletFormStore.address) ? (
                                    <span class=" text-xs text-red-500">
                                        Convert your address to the check sum before submitting.
                                    </span>
                                ) : null}
                            </div>
                        ) : (
                            <div>
                                <Button
                                    variant="blue"
                                    onClick$={onConnectWalletClick}
                                    text={
                                        connectedAddress.value !==
                                            localStorage.getItem("emmethUserWalletAddress")
                                            ? "Second Wallet connected."
                                            : "Connect another wallet"
                                    }
                                    size="small"
                                />
                            </div>
                        )}
                    </label>

                    {!addWalletFormStore.isExecutable ? (
                        <div class="mb-5 grid grid-cols-[75%_25%] items-center justify-between gap-2">
                            <Input
                                type="text"
                                name="address"
                                customClass={`${!isValidAddress(addWalletFormStore.address) || !isCheckSum(addWalletFormStore.address) ? "border-red-700" : ""} mt-4 w-full`}
                                value={addWalletFormStore.address}
                                placeholder="Enter wallet address..."
                                onInput={$((e) => {
                                    const target = e.target as HTMLInputElement;
                                    addWalletFormStore.address = target.value;
                                    walletAddressDebounce(target.value);
                                })}
                            />
                            <Button
                                variant="blue"
                                text="Convert"
                                size="small"
                                onClick$={async () => {
                                    addWalletFormStore.address = getAddress(
                                        addWalletFormStore.address,
                                    );
                                }}
                                disabled={
                                    addWalletFormStore.address.length === 0 ||
                                    !isValidAddress(addWalletFormStore.address) ||
                                    isCheckSum(addWalletFormStore.address)
                                }
                            />
                        </div>
                    ) : (
                        <div>
                            {connectedAddress.value ? (
                                <Tag
                                    text={
                                        connectedAddress.value.slice(0, 4) +
                                        "..." +
                                        connectedAddress.value.slice(-4)
                                    }
                                    isBorder={true}
                                    variant="success"
                                    icon={<IconSuccess class="h-4 w-4 fill-customGreen" />}
                                    size="large"
                                    class="mb-8 mt-4"
                                />
                            ) : (
                                <Tag
                                    text="Wallet not connected"
                                    isBorder={true}
                                    variant="warning"
                                    icon={<IconWarning class="h-5 w-5 fill-customWarning" />}
                                    size="large"
                                    class="mb-8 mt-4"
                                />
                            )}
                        </div>
                    )}
                </div>
            </>
        );
    },
);