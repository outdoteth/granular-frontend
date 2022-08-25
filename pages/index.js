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

const Container = styled.div`
  display: grid;
  margin-top: 12px;
`;

export default function Home() {
  const [tab, setTab] = useState("Add liquidity");
  const { data: signer } = useSigner();
  const [_, poolAddress] = useSubpools({
    tokenAddress: process.env.NEXT_PUBLIC_BAYC_ADDRESS,
  });

  const approve = async () => {
    const token = new Contract(
      process.env.NEXT_PUBLIC_BAYC_ADDRESS,
      erc721ABI,
      signer
    );

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
      <button style={{ marginTop: 12 }} onClick={approve}>
        Approve BAYC for pool
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

        {tab === "Add liquidity" && <AddLiquidity />}
        {tab === "Remove liquidity" && <RemoveLiquidity />}
        {tab === "Buy" && <Buy />}
        {tab === "Sell" && <Sell />}
      </Container>
    </div>
  );
}
