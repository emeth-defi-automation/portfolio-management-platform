import { type Signal, component$ } from "@builder.io/qwik";

interface AddressValueSwitchProps {
  isManualAddress: Signal<boolean>;
}

const WalletAddressValueSwitch = component$<AddressValueSwitchProps>(
  ({ isManualAddress }) => {
    return (
      <div class="mb-4">
        <div class="custom-bg-white custom-border-1 grid grid-cols-[50%_50%] rounded p-1">
          <button
            onClick$={() => {
              isManualAddress.value = false;
            }}
            type="button"
            class={`${isManualAddress.value ? "bg-black" : "custom-bg-button"}  col-span-1 rounded p-2.5 text-white`}
          >
            Observer wallets
          </button>
          <button
            onClick$={() => {
              isManualAddress.value = true;
            }}
            type="button"
            class={`${isManualAddress.value ? "custom-bg-button" : "bg-black"} col-span-1 rounded p-2.5  text-white`}
          >
            Other
          </button>
        </div>
      </div>
    );
  },
);

export default WalletAddressValueSwitch;
