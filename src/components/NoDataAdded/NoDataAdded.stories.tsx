import type { Meta, StoryObj } from "storybook-framework-qwik";
import { type NoDataAddedProps, NoDataAdded } from "./NoDataAdded";

const meta: Meta<NoDataAddedProps> = {
  component: NoDataAdded,
};

type Story = StoryObj<NoDataAddedProps>;

export default meta;

export const NoDataAddedWallets: Story = {
  render: () => (
    <NoDataAdded
      title="You didn’t add any wallets yet"
      description="Please add your first wallet."
      buttonText="Add First Wallet"
    />
  ),
};
