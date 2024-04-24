import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ConnectButton, type ButtonProps } from "./Buttons";

export default {
  title: 'atoms/Button',
  component: ConnectButton
}

export function Default(args: ButtonProps) {
  return <ConnectButton  
  {...args}
      
       />
}

export function WalletConnect(args: ButtonProps) {
  return <ConnectButton  
  {...args}
       />
}

export function Info(args: ButtonProps) {
  return <ConnectButton  
  {...args}
       />
}

Default.args = {
  image:"/assets/icons/login/metamask.svg",
  text:"Use Metamask"
}

WalletConnect.args = {
       image:"/assets/icons/login/walletconnect.svg",
      text:"Use WalletConnect"
}

Info.args = {
      image:"/assets/icons/info-white.svg",
       text:"How to use Wallet?",
       class:"w-52 !border-0 bg-customBlue py-2 pl-2 pr-3 text-xs"
}




     




   
