import { EventCard, type EventCardProps } from "./EventCard";

export default {
  component: EventCard,
};

export function Trigger(args: EventCardProps) {
  return <EventCard {...args} />;
}

Trigger.args = {
  variant: "transfer",
};
