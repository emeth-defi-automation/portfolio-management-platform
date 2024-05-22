import { $, component$, useContext, useVisibleTask$ } from "@builder.io/qwik";
import Button from "~/components/Atoms/Buttons/Button";
import { ButtonWithIcon } from "~/components/Buttons/Buttons";
import IconEdit from "@material-design-icons/svg/outlined/edit.svg?jsx";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { messagesContext } from "../layout";
import {
  Config,
  getAccount,
  simulateContract,
  writeContract,
} from "@wagmi/core";
import { emethContractAbi } from "~/abi/emethContractAbi";

export default component$(() => {
  return (
    <>
      <div class="grid grid-cols-[1fr_2.5fr]">
        <div class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex gap-2">
              <Header variant="h4" text="New Automation" class="font-normal" />
              <Button
                variant="onlyIcon"
                leftIcon={<IconEdit class="h-4 w-4 fill-white" />}
              />
            </div>
            <div class="flex items-center gap-2">
              <Paragraph size="xs" class="text-customGreen" text="Active" />
              <Checkbox variant="toggleTick" isChecked={true} class="" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
});
