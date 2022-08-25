import { useAccount, useConnect, useEnsName, useNetwork } from "wagmi";
import { ErrorText } from "./ErrorText";

export const ConnectWalletButton = ({ children }) => {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const {
    connect,
    connectors: [connector],
  } = useConnect();
  const { chain } = useNetwork();

  if (chain?.unsupported && !children)
    return <ErrorText>Connected to wrong network</ErrorText>;
  if (isConnected)
    return children ? children : <div>Connected to {ensName ?? address}</div>;

  return <button onClick={() => connect({ connector })}>connect wallet</button>;
};
