import { $, component$, useStore } from "@builder.io/qwik";
import InputField from "~/components/Molecules/InputField/InputField";
import ParagraphAnnotation from "~/components/Molecules/ParagraphAnnotation/ParagraphAnnotation";
import IconError from "@material-design-icons/svg/outlined/error_outline.svg?jsx";
import Annotation from "~/components/Atoms/Annotation/Annotation";
import Button from "~/components/Atoms/Buttons/Button";
import SelectField from "~/components/Molecules/SelectField/SelectField";

export const Swap = component$(() => {
  const state = useStore({ actionType: "Swap" });

  return (
    <div class="flex flex-col justify-center gap-6">
      <SelectField
        name="Action Type"
        variant="largeArrow"
        size="large"
        labelClass="normal-case"
        options={[
          { value: "Swap", text: "Swap" },
          { value: "Transfer", text: "Transfer" },
        ]}
        onValueChange={$((value: string) => {
          state.actionType = value;
        })}
      />
      <InputField
        name="Action name"
        size="medium"
        placeholder={`${state.actionType} #1`}
        labelClass="normal-case"
      />
      <InputField
        name="Action description"
        size="medium"
        placeholder={`${state.actionType} Description`}
        labelClass="normal-case"
      />
      <hr class="h-[1px] border-0 bg-white/10" />
      <div class="flex items-center justify-between">
        <Annotation text={`${state.actionType} Summary`} />
        <Button
          text="Choose options"
          variant="transparent"
          size="small"
          customClass="font-normal bg-white/10 !border-0"
        />
      </div>
      <ParagraphAnnotation
        hasIconBox={true}
        iconBoxBorder="clear"
        iconBoxSize="large"
        iconBoxCustomClass="p-0 w-8 h-8"
        iconBoxCustomIcon={<IconError class="h-8 w-8 fill-customWarning" />}
        customClass="gap-2 border border-customWarning bg-customWarning/10 p-4 rounded-lg w-full"
        paragraphText="You didn’t choose tokens yet"
        annotationText={`Please select the tokens you wish to ${state.actionType == "Swap" ? "exchange" : "transfer"}.`}
      />
      <div class="flex flex-col gap-4">
        <Annotation text="Details" />
        <div class="flex items-center justify-between rounded-lg bg-black/10 p-4">
          <Annotation text="Type" />
          <Annotation text="My Wallet" variant="white" />
        </div>
        <div class="flex items-center justify-between rounded-lg bg-black/10 p-4">
          <Annotation text="From" />
          <Annotation text="Wallet #1" variant="white" />
        </div>
        <div class="flex items-center justify-between rounded-lg bg-black/10 p-4">
          <Annotation text="To" />
          <Annotation text="Wallet #2" variant="white" />
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <Annotation text="Send" />
        <div class="flex items-center justify-between rounded-lg bg-black/10 p-4">
          <div class="flex items-center gap-2">
            <img
              width={16}
              height={16}
              src="/public/assets/icons/tokens/usdc.svg"
              alt="USDC"
            />
            <Annotation text="67,059.95" variant="white" />
          </div>
          <Annotation text="$67,059.95" variant="white" />
        </div>
      </div>
      <div class="flex flex-col gap-4">
        <Annotation text="Send" />
        <div class="flex items-center justify-between rounded-lg bg-black/10 p-4">
          <div class="flex items-center gap-2">
            <img
              width={16}
              height={16}
              src="/public/assets/icons/tokens/btc.svg"
              alt="BTC"
            />
            <Annotation text="1.00" variant="white" />
          </div>
          <Annotation text="$67,059.95" variant="white" />
        </div>
      </div>
    </div>
  );
});
