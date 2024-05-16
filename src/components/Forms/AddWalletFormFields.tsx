import { type QRL, component$, $ } from "@builder.io/qwik";
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
import IconSuccess from "/public/assets/icons/dashboard/success.svg?jsx";
import IconWarning from "/public/assets/icons/dashboard/warning.svg?jsx";
import Button from "../Atoms/Buttons/Button";
import { type AddWalletFormStore } from "~/routes/app/wallets/interface";
export interface AddWalletFormFieldsProps {
  addWalletFormStore: AddWalletFormStore;
  onConnectWalletClick: QRL<() => void>;
  isWalletConnected: boolean | undefined;
}

export default component$<AddWalletFormFieldsProps>(
  ({ addWalletFormStore, onConnectWalletClick, isWalletConnected }) => {
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
                  text={isWalletConnected ? "Disconnect " : "Connect Wallet"}
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
              {isWalletConnected ? (
                <div
                  class={`mb-8 mt-4 flex h-12 w-full items-center justify-between rounded-lg border border-customGreen bg-customGreen bg-opacity-10 p-3 text-customGreen`}
                >
                  <div></div>
                  {/* don't delete this div it's for correct flex */}
                  {/*addWalletFormStore.address
                    ? `${addWalletFormStore.address.slice(0, 4) + "..." + addWalletFormStore.address.slice(-4)}`
                    : "wallet address"} */}
                  Wallet address
                  <IconSuccess class="h-4 w-4" />
                </div>
              ) : (
                <div
                  class={`relative mb-8 mt-4 flex h-12 w-full items-center justify-center rounded-lg border border-customWarning bg-customWarning bg-opacity-10 p-3 text-customWarning`}
                >
                  Wallet not connected
                  <IconWarning class="absolute end-3 h-4 w-4" />
                </div>
              )}
            </div>
          )}
        </div>
      </>
    );
  },
);
