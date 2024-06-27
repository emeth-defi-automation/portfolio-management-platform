import { type Signal, component$ } from "@builder.io/qwik";

interface AddressValueSwitchProps {
  isManualAddress: Signal<boolean>;
}

const WalletAddressValueSwitch = component$<AddressValueSwitchProps>(
  ({ isManualAddress }) => {
    return (
      <div class="mb-4">
        <div class="custom-bg-white custom-border-1 flex rounded p-1">
          <button
            onClick$={() => {
              isManualAddress.value = false;
            }}
            type="button"
            class={`${isManualAddress.value ? "bg-black" : "custom-bg-button"} w-full rounded p-2.5 text-white`}
          >
            Observable
          </button>
          <button
            onClick$={() => {
              isManualAddress.value = true;
            }}
            type="button"
            class={`${isManualAddress.value ? "custom-bg-button" : "bg-black"} w-full rounded p-2.5  text-white`}
          >
            Executable
          </button>
        </div>
      </div>
    );
  },
);

export default WalletAddressValueSwitch;
