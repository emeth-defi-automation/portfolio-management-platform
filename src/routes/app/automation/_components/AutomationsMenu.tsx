import { $, component$, useContext } from "@builder.io/qwik";
import { Config, getAccount, simulateContract } from "@wagmi/core";
import Button from "~/components/Atoms/Buttons/Button";
import Checkbox from "~/components/Atoms/Checkbox/Checkbox";
import Header from "~/components/Atoms/Headers/Header";
import Paragraph from "~/components/Atoms/Paragraphs/Paragraphs";
import { ButtonWithIcon } from "~/components/Buttons/Buttons";
import { WagmiConfigContext } from "~/components/WalletConnect/context";
import { messagesContext } from "../../layout";
import { emethContractAbi } from "~/abi/emethContractAbi";

interface AutomationsMenuProps {}

export const AutomationsMenu = component$<AutomationsMenuProps>(() => {
  const wagmiConfig = useContext(WagmiConfigContext);
  const formMessageProvider = useContext(messagesContext);

  const handleAddAutomation = $(async () => {
    const account = getAccount(wagmiConfig.config as Config);
    const emethContractAddress = import.meta.env
      .PUBLIC_EMETH_CONTRACT_ADDRESS_SEPOLIA;

    const automation = await simulateContract(wagmiConfig.config as Config, {
      account: account.address as `0x${string}`,
      abi: emethContractAbi,
      address: emethContractAddress,
      functionName: "addAction",
      args: [
        12991n,
        "0xD418937d10c9CeC9d20736b2701E506867fFD85f" as `0x${string}`,
        "0x9D16475f4d36dD8FC5fE41F74c9F44c7EcCd0709" as `0x${string}`,
        20000000000000000000n,
        "0x0577b55800816b6A2Da3BDbD3d862dce8e99505D" as `0x${string}`,
        "0x8545845EF4BD63c9481Ae424F8147a6635dcEF87" as `0x${string}`,
        1715998201n,
        1n,
      ],
    });

    console.log(automation);
  });

  return (
    <div class="grid grid-rows-[32px_40px_1fr] gap-6 border-r border-white/10 bg-white/[0.03] p-6">
      <div class="flex items-center justify-between gap-2">
        <Header variant="h4" text="Automations" class="font-normal" />
        <Button
          text="Add New"
          variant="transparent"
          size="small"
          customClass="font-normal bg-white/10 !border-0"
          onClick$={() => handleAddAutomation()}
        />
      </div>
      <div class="grid w-full gap-2">
        <ButtonWithIcon
          image="/assets/icons/search.svg"
          text="Search for Automation"
          class="custom-border-1 h-10 flex-row-reverse justify-between gap-2 rounded-lg px-3"
        />
      </div>

      <div class="">
        <div class="flex items-center justify-between gap-12 p-4">
          <div class="flex flex-col gap-3">
            <Header variant="h5" text="Automation Name #1" />
            <Paragraph
              size="xs"
              variant="secondaryText"
              text="At a scheduled time with a defined alert"
            />
          </div>
          <Checkbox variant="toggleTick" isChecked={true} class="" />
        </div>
      </div>
    </div>
  );
});
