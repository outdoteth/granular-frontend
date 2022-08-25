import { BigNumber, Contract } from "ethers";
import { parseEther } from "ethers/lib/utils";
import { useEffect, useState } from "react";
import { erc20ABI, useAccount, useProvider } from "wagmi";
import factoryAbi from "../contracts/factory.abi.json";
import poolAbi from "../contracts/pool.abi.json";

export const useSubpools = ({ tokenAddress }) => {
  const { address } = useAccount();
  const [loading, setLoading] = useState();
  const [subpools, setSubpools] = useState();
  const [poolAddress, setPoolAddress] = useState();
  const provider = useProvider();

  const fetchSubools = async () => {
    setLoading(true);
    const factory = new Contract(
      process.env.NEXT_PUBLIC_FACTORY_ADDRESS,
      factoryAbi,
      provider
    );

    const poolAddress = await factory.tokenToPool(tokenAddress);
    setPoolAddress(poolAddress);

    const pool = new Contract(poolAddress, poolAbi, provider);
    const totalPools = (await pool.subpoolCount()).toNumber();

    const subpools = await Promise.all(
      new Array(totalPools).fill(0).map(async (_, i) => {
        const {
          ethReserves,
          nftReserves,
          merkleRoot,
          lpToken: lpTokenAddress,
          init,
        } = await pool.subpools(i);

        const lpToken = new Contract(lpTokenAddress, erc20ABI, provider);

        return {
          ethReserves,
          nftReserves,
          merkleRoot,
          price: nftReserves.gt(0)
            ? ethReserves.div(nftReserves)
            : BigNumber.from(parseEther("0.1")),
          lpTokenAddress,
          lpTokenTotalSupply: await lpToken.totalSupply(),
          accountLpTokenBalance: await lpToken.balanceOf(address),
        };
      })
    );

    setSubpools(subpools);
    setLoading(false);
  };

  useEffect(() => {
    if (tokenAddress) fetchSubools();
  }, [tokenAddress]);

  return [subpools, poolAddress, loading];
};
