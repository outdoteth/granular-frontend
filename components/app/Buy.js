import { BigNumber, Contract } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useMemo, useState } from "react";
import { useSubpools } from "../../hooks/useSubpools";
import { SelectSubpoolNft } from "../core/SelectSubpoolNft";
import poolAbi from "../../contracts/pool.abi.json";
import { useSigner } from "wagmi";

export const Buy = ({ tokenAddress }) => {
  const [subpoolTokens, setSubpoolTokens] = useState({});
  const { data: signer } = useSigner();
  const [subpools, poolAddress, subpoolsLoading] = useSubpools({
    tokenAddress,
  });

  const swaps = useMemo(() => {
    return Object.values(subpoolTokens)
      .filter((v) => v.tokens.length)
      .map((v) => ({
        ...v,
        isBuy: true,
      }));
  }, [subpoolTokens]);

  const afterSwapPrices = useMemo(() => {
    return swaps.map((swap) => {
      const { nftReserves, ethReserves } = subpools[swap.subpoolId];
      const price = ethReserves.div(nftReserves.sub(swap.tokens.length));
      return price;
    });
  }, [swaps]);

  const buy = async () => {
    try {
      const totalEthAmount = swaps
        .map((swap, i) => afterSwapPrices[i].mul(swap.tokens.length.toString()))
        .reduce((sum, v) => sum.add(v), BigNumber.from("0"));
      const pool = new Contract(poolAddress, poolAbi, signer);
      const tx = await pool.swap(swaps, { value: totalEthAmount });
      console.log(tx);
      await tx.wait();
      alert("Confirmed buy tx");
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };
  console.log(subpools);

  return (
    <div>
      <h3>Buy</h3>

      <SelectSubpoolNft
        onChange={setSubpoolTokens}
        value={subpoolTokens}
        tokenAddress={tokenAddress}
        address={poolAddress}
        hideFirstNft // used to prevent draining the pool (not possible)
      />

      <p>Buy amounts:</p>

      <ul>
        {swaps?.map(({ subpoolId, tokens }, i) => (
          <li key={subpoolId}>
            subpool-{subpoolId + 1} : {tokens.length} nfts : <br />
            costs{" "}
            {formatEther(afterSwapPrices[i].mul(tokens.length.toString()))}{" "}
            ether :{" "}
            {afterSwapPrices[i]
              .mul(100)
              .div(
                subpools[subpoolId].ethReserves.div(
                  subpools[subpoolId].nftReserves
                )
              )
              .toNumber() - 100}
            % price impact
          </li>
        ))}
      </ul>

      <button onClick={buy}>Buy</button>
    </div>
  );
};
