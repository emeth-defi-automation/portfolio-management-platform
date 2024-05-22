import { type QRL, component$, $ } from "@builder.io/qwik";
import { getAddress } from "viem";
// import { Input } from "~/components/Input/Input";

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
import SelectField from "../Molecules/SelectField/SelectField";
import Annotation from "../Atoms/Annotation/Annotation";
import InputField from "../Molecules/InputField/InputField";
import Input from "../Atoms/Input/Input";
import Label from "../Atoms/Label/Label";
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
        {/* <div class="mb-4">
          <label for="network" class="custom-text-50 pb-2 text-xs uppercase">
            Network
          </label>
          <Input
            type="text"
            name="network"
            placeholder="Select network"
            disabled={true}
          />
        </div> */}
        <SelectField
          disabled={true}
          name="network"
          size="large"
          class="mb-4"
          options={[{ value: "", text: "Select netwrok" }]}
        />
        {/* Name */}
        <div>
          {!isValidName(addWalletFormStore.name) && (
            <Annotation
              class="absolute end-6 pt-[1px] !text-red-500"
              text="Name too short"
            />
          )}
          {!addWalletFormStore.isNameUnique && (
            <Annotation
              class="absolute end-6 pt-[1px] !text-red-500"
              text="Name already exists"
            />
          )}
          <InputField
            size="large"
            variant={null}
            name="Wallet name" //might does not work correctly
            disabled={false}
            inputClass={`
                      ${!isValidName(addWalletFormStore.name) ? "!border-red-700 border border-solid" : ""}`}
            //the border color does not change
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
            <Annotation
              class="absolute end-6 pt-[1px] !text-red-500"
              text="Wallet already exists"
            />
          )}
          <Label
            name="Wallet address" //might does not work correctly
            class="mb-2 flex items-center justify-between gap-2"
            // 0x00000000219ab540356cbb839cbe05303d7705fa
          >
            {!addWalletFormStore.isExecutable ? (
              <div>
                {!isValidAddress(addWalletFormStore.address) ? (
                  <Annotation class=" !text-red-500" text="Invalid addres" />
                ) : !isCheckSum(addWalletFormStore.address) ? (
                  <Annotation
                    class="text-wrap text-right !text-red-500"
                    text="Convert your address before submitting"
                  />
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
          </Label>

          {!addWalletFormStore.isExecutable ? (
            <div class="mb-5 grid grid-cols-[75%_25%] items-center justify-between gap-2">
              <Input
                name="address"
                customClass={`${!isValidAddress(addWalletFormStore.address) || !isCheckSum(addWalletFormStore.address) ? "border-red-700" : ""}`}
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
