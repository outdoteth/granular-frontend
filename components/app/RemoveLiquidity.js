import { BigNumber, Contract } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useMemo, useState } from "react";
import { useSubpools } from "../../hooks/useSubpools";
import { SelectSubpoolNft } from "../core/SelectSubpoolNft";
import poolAbi from "../../contracts/pool.abi.json";
import { useSigner } from "wagmi";

export const RemoveLiquidity = ({ tokenAddress }) => {
  const [subpoolTokens, setSubpoolTokens] = useState({});
  const { data: signer } = useSigner();
  const [subpools, poolAddress, subpoolsLoading] = useSubpools({
    tokenAddress,
  });

  const lpRemoves = useMemo(() => {
    return Object.values(subpoolTokens)
      .filter((v) => v.tokens.length)
      .map((v) => ({
        ...v,
      }));
  }, [subpoolTokens]);

  const removeLiquidity = async () => {
    try {
      const pool = new Contract(poolAddress, poolAbi, signer);
      const tx = await pool.remove(lpRemoves);
      console.log(tx);
      await tx.wait();
      alert("Confirmed lp remove tx");
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };
  console.log(subpools);

  return (
    <div>
      <h3>Remove liquidity</h3>
      <SelectSubpoolNft
        onChange={setSubpoolTokens}
        value={subpoolTokens}
        tokenAddress={tokenAddress}
        address={poolAddress}
      />

      <p>Remove LP amounts:</p>

      <ul>
        {lpRemoves?.map(({ subpoolId, tokens }) => (
          <li key={subpoolId}>
            subpool-{subpoolId + 1} : {tokens.length} nfts +{" "}
            {formatEther(subpools[subpoolId].price.mul(tokens.length))} ether
            <br /> cost{" "}
            {formatEther(
              subpools[subpoolId].lpTokenTotalSupply
                .mul(tokens.length)
                .div(subpools[subpoolId].nftReserves)
            )}{" "}
            LP tokens (your balance:{" "}
            {formatEther(subpools[subpoolId].accountLpTokenBalance)} LP tokens)
          </li>
        ))}
      </ul>

      <button onClick={removeLiquidity}>Remove liquidity</button>
    </div>
  );
};
