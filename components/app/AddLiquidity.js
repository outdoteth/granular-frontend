import { BigNumber, Contract } from "ethers";
import { formatEther } from "ethers/lib/utils";
import { useMemo, useState } from "react";
import { useSubpools } from "../../hooks/useSubpools";
import { SelectSubpoolNft } from "../core/SelectSubpoolNft";
import poolAbi from "../../contracts/pool.abi.json";
import { useAccount, useSigner } from "wagmi";

export const AddLiquidity = () => {
  const [subpoolTokens, setSubpoolTokens] = useState({});
  const { address } = useAccount();
  const { data: signer } = useSigner();
  const [subpools, poolAddress, subpoolsLoading] = useSubpools({
    tokenAddress: process.env.NEXT_PUBLIC_BAYC_ADDRESS,
  });

  const lpAdds = useMemo(() => {
    return Object.values(subpoolTokens)
      .filter((v) => v.tokens.length)
      .map((v) => ({
        ...v,
        ethAmount: subpools[v.subpoolId].price.mul(v.tokens.length),
      }));
  }, [subpoolTokens]);

  const addLiquidity = async () => {
    try {
      const pool = new Contract(poolAddress, poolAbi, signer);
      const totalEthAmount = lpAdds.reduce(
        (sum, { ethAmount }) => sum.add(ethAmount),
        BigNumber.from("0")
      );

      console.log(totalEthAmount, lpAdds, poolAddress);
      const tx = await pool.add(lpAdds, { value: totalEthAmount });
      console.log(tx);
      await tx.wait();
      alert("Confirmed lp add tx");
    } catch (e) {
      console.error(e);
      alert(e);
    }
  };

  return (
    <div>
      <h3>Add liquidity</h3>
      <SelectSubpoolNft
        onChange={setSubpoolTokens}
        value={subpoolTokens}
        tokenAddress={process.env.NEXT_PUBLIC_BAYC_ADDRESS}
        address={address}
      />

      <p>LP amount:</p>

      <ul>
        {lpAdds?.map(({ ethAmount, subpoolId, tokens }) => (
          <li>
            subpool-{subpoolId + 1} : {tokens.length} nfts +{" "}
            {formatEther(ethAmount)} ether
          </li>
        ))}
      </ul>

      <button onClick={addLiquidity}>Add liquidity</button>
    </div>
  );
};
