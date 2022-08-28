import { Contract } from "ethers";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import styled from "styled-components";
import { erc721ABI, useSigner } from "wagmi";
import { AddLiquidity } from "../components/app/AddLiquidity";
import { Buy } from "../components/app/Buy";
import { RemoveLiquidity } from "../components/app/RemoveLiquidity";
import { Sell } from "../components/app/Sell";
import { ConnectWalletButton } from "../components/core/ConnectWalletButton";
import { useSubpools } from "../hooks/useSubpools";
import * as nftCollections from "../ethereum/nftCollections.json";

const Container = styled.div`
  display: grid;
  margin-top: 12px;
`;

export default function Home() {
  const [tab, setTab] = useState("Add liquidity");
  const { data: signer } = useSigner();
  const [tokenAddress, setTokenAddress] = useState(
    nftCollections.tokens[0].address
  );
  const [_, poolAddress] = useSubpools({
    tokenAddress,
  });

  const approve = async () => {
    const token = new Contract(tokenAddress, erc721ABI, signer);

    const tx = await token.setApprovalForAll(poolAddress, true);
    await tx.wait();

    alert("Approved token for spending");
  };

  return (
    <div>
      <Head>
        <title>Granular AMM</title>
      </Head>

      <h1>Granular</h1>
      <p>Desirability-ranked subpool NFT amm</p>
      <ConnectWalletButton />

      <select
        value={tokenAddress}
        style={{ marginTop: 12 }}
        onChange={(e) => setTokenAddress(e.target.value)}
      >
        {nftCollections.tokens.map(({ address, name, symbol }) => (
          <option value={address} key={address}>
            {name} ({symbol})
          </option>
        ))}
      </select>

      <button style={{ marginTop: 12 }} onClick={approve}>
        Approve NFT for pool
      </button>

      <Container>
        <select
          style={{ width: "fit-content" }}
          value={tab}
          onChange={(e) => setTab(e.target.value)}
        >
          {["Add liquidity", "Remove liquidity", "Buy", "Sell"].map((v) => (
            <option value={v} key={v}>
              {v}
            </option>
          ))}
        </select>

        {tab === "Add liquidity" && (
          <AddLiquidity tokenAddress={tokenAddress} />
        )}
        {tab === "Remove liquidity" && (
          <RemoveLiquidity tokenAddress={tokenAddress} />
        )}
        {tab === "Buy" && <Buy tokenAddress={tokenAddress} />}
        {tab === "Sell" && <Sell tokenAddress={tokenAddress} />}
      </Container>
    </div>
  );
}
