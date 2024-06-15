import { AutomationCard, type AutomationCardProps } from "./AutomationCard";

export default {
  component: AutomationCard,
};

export function Trigger(args: AutomationCardProps) {
  return <AutomationCard {...args} />;
}

Trigger.args = {
  variant: "transfer",
  isActive: true,
};
