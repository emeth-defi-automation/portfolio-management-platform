import Dialog, { type DialogProps } from "./Dialog";

export default {
  title: "organisms/Dialog",
  component: Dialog,
};

export function Default(args: DialogProps) {
  return (
    <Dialog {...args}>
      <p>hello</p>
    </Dialog>
  );
}

Default.args = {
  hasButton: true,
};
