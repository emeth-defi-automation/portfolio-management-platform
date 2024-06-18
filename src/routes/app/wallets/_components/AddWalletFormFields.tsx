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
import SelectField from "~/components/Molecules/SelectField/SelectField";
import Annotation from "~/components/Atoms/Annotation/Annotation";
import InputField from "~/components/Molecules/InputField/InputField";
import Input from "~/components/Atoms/Input/Input";
import Label from "~/components/Atoms/Label/Label";
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
            if (account.address !== connectedAddress.value) {
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
        <SelectField
          id="network"
          disabled={true}
          name="network"
          size="large"
          class="mb-4"
          options={[{ value: "", text: "Select network" }]}
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
            id="walletName"
            size="large"
            variant={null}
            ref={newWalletNameInput}
            name="Wallet name"
            disabled={false}
            isInvalid={!isValidName(addWalletFormStore.name) ? true : false}
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
              class="absolute end-6 pt-[1px] !text-customRed"
              text="Wallet already exists"
            />
          )}
          <Label
            for="address"
            name="Wallet address"
            class="mb-2 flex items-center justify-between gap-2"
          >
            {!addWalletFormStore.isExecutable ? (
              <div>
                {!isValidAddress(addWalletFormStore.address) ? (
                  <Annotation class="!text-customRed" text="Invalid address" />
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
          </Label>

          {!addWalletFormStore.isExecutable ? (
            <div class="mb-5 grid grid-cols-[75%_25%] items-center justify-between gap-2">
              <Input
                id="address"
                name="address"
                InputClass={`${!isValidAddress(addWalletFormStore.address) || !isCheckSum(addWalletFormStore.address) ? "!border-red-700" : ""}`}
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
                  class="mb-8 mt-4 flex-row-reverse"
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
