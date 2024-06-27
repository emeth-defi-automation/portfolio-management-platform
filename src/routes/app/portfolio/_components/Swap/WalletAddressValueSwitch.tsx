import { type Signal, component$ } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";

interface AddressValueSwitchProps {
  isManualAddress: Signal<boolean>;
  textLeft: string;
  textRight: string;
}

const WalletAddressValueSwitch = component$<AddressValueSwitchProps>(
  ({ isManualAddress, textLeft, textRight }) => {
    return (
      <div class="custom-border-1 flex h-10 items-center rounded p-1">
        <Button
          text={textLeft}
          onClick$={() => {
            isManualAddress.value = false;
          }}
          customClass="w-full h-full p-0"
          variant={`${isManualAddress.value ? "onlyIcon" : "transfer"}`}
        />
        <Button
          text={textRight}
          onClick$={() => {
            isManualAddress.value = true;
          }}
          variant={`${isManualAddress.value ? "transfer" : "onlyIcon"}`}
          customClass="h-full w-full p-0"
        />
      </div>
    );
  },
);

export default WalletAddressValueSwitch;
