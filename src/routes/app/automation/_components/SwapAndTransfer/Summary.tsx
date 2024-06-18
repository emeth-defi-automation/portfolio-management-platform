import { component$ } from "@builder.io/qwik";
import Annotation from "~/components/Atoms/Annotation/Annotation";
import { DetailsBox } from "~/components/Atoms/DetailsBox/DetailsBox";

export interface SummaryProps {
  actionType?: string;
}

export const Summary = component$<SummaryProps>((props) => {
  return (
    <>
      <div class="flex flex-col gap-4">
        <Annotation text="Details" />
        <DetailsBox title="Type" text="My Wallet" />
        <DetailsBox title="From" text="Wallet #1" />
        <DetailsBox title="To" text="0x698...1933" isAddress={true} />
      </div>
      {props.actionType == "Swap" ? (
        <>
          <div class="flex flex-col gap-4">
            <Annotation text="Send" />
            <DetailsBox
              title="67,059.95"
              tokenPath="/public/assets/icons/tokens/usdc.svg"
              text="$67,059.95"
            />
          </div>
          <div class="flex flex-col gap-4">
            <Annotation text="Reveice" />
            <DetailsBox
              title="1.00"
              tokenPath="/public/assets/icons/tokens/btc.svg"
              text="$67,059.95"
            />
          </div>
        </>
      ) : (
        <div class="flex flex-col gap-4">
          <Annotation text="Overall Transfer Amount" />
          <DetailsBox text="$201,179.85" customClass="flex-row-reverse" />
        </div>
      )}
    </>
  );
});
