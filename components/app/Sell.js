import { BigNumber, Contract } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useMemo, useState } from "react";
import { useSubpools } from "../../hooks/useSubpools";
import { SelectSubpoolNft } from "../core/SelectSubpoolNft";
import poolAbi from "../../contracts/pool.abi.json";
import { useAccount, useSigner } from "wagmi";

export const Sell = ({ tokenAddress }) => {
  const [subpoolTokens, setSubpoolTokens] = useState({});
  const { data: signer } = useSigner();
  const { address } = useAccount();
  const [subpools, poolAddress, subpoolsLoading] = useSubpools({
    tokenAddress,
  });

  const swaps = useMemo(() => {
    return Object.values(subpoolTokens)
      .filter((v) => v.tokens.length)
      .map((v) => ({
        ...v,
        isBuy: false,
      }));
  }, [subpoolTokens]);

  const afterSwapPrices = useMemo(() => {
    return swaps.map((swap) => {
      const { nftReserves, ethReserves } = subpools[swap.subpoolId];
      console.log(subpools[swap.subpoolId]);
      const price = ethReserves.div(nftReserves.add(swap.tokens.length));
      return price;
    });
  }, [swaps]);

  const sell = async () => {
    try {
      const pool = new Contract(poolAddress, poolAbi, signer);
      const tx = await pool.swap(swaps);
      console.log(tx);
      await tx.wait();
      alert("Confirmed sell tx");
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };
  console.log(subpools);

  return (
    <div>
      <h3>Sell</h3>

      <SelectSubpoolNft
        onChange={setSubpoolTokens}
        value={subpoolTokens}
        tokenAddress={tokenAddress}
        address={address}
        filterZeroNftReserveSubpools // prevent pools with 0 nft reserves from showing up (cant sell into these)
      />

      <p>Sell amounts:</p>

      <ul>
        {swaps?.map(({ subpoolId, tokens }, i) => (
          <li key={subpoolId}>
            subpool-{subpoolId + 1} : {tokens.length} nfts : <br />
            receive{" "}
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

      <button onClick={sell}>Sell</button>
    </div>
  );
};
