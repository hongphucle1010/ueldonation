import { ConnectButton } from "thirdweb/react";
import { client } from "./client";

const MyConnectButton: React.FC = () => {
  return <ConnectButton client={client} />;
};

export default MyConnectButton;
