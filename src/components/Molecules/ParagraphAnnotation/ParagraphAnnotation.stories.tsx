import Tag from "~/components/Atoms/Tags/Tag";
import ParagraphAnnotation, {
  type ParagraphAnnotationProps,
} from "./ParagraphAnnotation";
import IconSchedule from "@material-design-icons/svg/round/schedule.svg?jsx";
import IconSuccess from "@material-design-icons/svg/round/check_circle_outline.svg?jsx";
import IconAlarm from "@material-design-icons/svg/round/alarm.svg?jsx";

export default {
  title: "molecules/ParagraphAnnotation",
  component: ParagraphAnnotation,
};

export function TokenBlock(args: ParagraphAnnotationProps) {
  return <ParagraphAnnotation {...args} />;
}

export function TokenBlock2(args: ParagraphAnnotationProps) {
  return <ParagraphAnnotation {...args} />;
}

export function WalletBlock(args: ParagraphAnnotationProps) {
  return (
    <ParagraphAnnotation {...args}>
      <IconSchedule class="h-4 w-4 fill-customWarning" />
    </ParagraphAnnotation>
  );
}

export function Action(args: ParagraphAnnotationProps) {
  return (
    <ParagraphAnnotation {...args}>
      <Tag
        variant="success"
        isBorder={true}
        text="Success"
        icon={<IconSuccess class="h-4 w-4 fill-customGreen" />}
      />
    </ParagraphAnnotation>
  );
}

export function Trigger(args: ParagraphAnnotationProps) {
  return <ParagraphAnnotation {...args} />;
}

TokenBlock.args = {
  hasIconBox: true,
  iconBoxSize: "small",
  iconBoxBorder: "default",
  iconBoxBackground: "transparent",
  iconBoxTokenPath: "/public/assets/icons/tokens/btc.svg",
  annotationText: "BTC",
  paragraphText: "Bitcoin",
  variant: "annotationNear",
};

TokenBlock2.args = {
  hasIconBox: true,
  iconBoxSize: "large",
  iconBoxBorder: "clear",
  iconBoxBackground: "white",
  iconBoxTokenPath: "/public/assets/icons/tokens/eth.svg",
  annotationText: "ETH",
  paragraphText: "Ethereum",
  variant: "annotationBelow",
};

WalletBlock.args = {
  hasIconBox: true,
  iconBoxSize: "small",
  iconBoxBorder: "default",
  iconBoxBackground: "white",
  iconBoxTokenPath: "/public/assets/icons/tokens/eth.svg",
  annotationText: "Ethereum",
  paragraphText: "Treasury WBTC",
  variant: "annotationBelow",
};

Action.args = {
  hasIconBox: false,
  annotationText: "6 hours ago",
  paragraphText: "Automation name #1",
  variant: "annotationBelow",
};

Trigger.args = {
  hasIconBox: true,
  iconBoxSize: "small",
  iconBoxBorder: "gradient",
  iconBoxBackground: "transparent",
  iconBoxCustomIcon: <IconAlarm class="h-full w-full fill-white" />,
  annotationText: "Every 7 days at 09:00",
  paragraphText: "Time Trigger #1",
  variant: "annotationBelow",
};
