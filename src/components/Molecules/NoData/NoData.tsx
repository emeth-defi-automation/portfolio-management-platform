import { twMerge } from "tailwind-merge";
import IconInfoWhite from "/public/assets/icons/info-white.svg?jsx";
import Button from "~/components/Atoms/Buttons/Button";

export interface NoDataProps {
  title: string;
  description?: string;
  class?: string;
}

export type tagType = NoDataProps;

const NoDataBlock = ({ ...props }) => {
  return (
    <div {...props} class={twMerge("flex flex-col gap-4", props.class)}>
      <div class="flex flex-col items-center justify-center gap-4">
        <IconInfoWhite class="h-10 w-10" />
        {/* TODO: change h3 and p to atoms */}
        <h3>{props.title}</h3>
        <p>{props.description}</p>
      </div>

      <div class="flex items-center justify-center gap-2">
        <Button variant="transparent" text="Deposit Funds" class="py-2.5" />
        <Button text="Setup Wallet" class="py-2.5" />
      </div>
    </div>
  );
};

export default NoDataBlock;
