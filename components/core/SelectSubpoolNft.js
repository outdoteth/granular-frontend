import { formatEther } from "ethers/lib/utils";
import { useAccount } from "wagmi";
import { useNfts } from "../../hooks/useNfts";
import { useSubpools } from "../../hooks/useSubpools";
import rankings from "../../rankings/bayc.json";
import { generateMerkleProof } from "../../utils/generateMerkleProof";

export const SelectSubpoolNft = ({
  onChange,
  value,
  tokenAddress,
  address,
  hideFirstNft,
  filterZeroNftReserveSubpools,
}) => {
  const [subpools, poolAddress, subpoolsLoading] = useSubpools({
    tokenAddress,
  });
  const [nfts, loading] = useNfts({
    address,
    tokenAddress,
  });

  const rankedNfts = nfts.reduce((arr, nft) => {
    const bin = rankings[nft.tokenId] - 1;

    if (arr[bin]) arr[bin].push(nft);
    else arr[bin] = [nft];
    return arr;
  }, []);

  return (
    <div>
      <b>Select some nfts</b>

      {(loading || subpoolsLoading) && <p>Loading...</p>}

      <div>
        {subpools &&
          rankedNfts.map(
            (nfts, index) =>
              (!hideFirstNft || nfts.length > 1) &&
              (!filterZeroNftReserveSubpools ||
                subpools[index].nftReserves.gt("0")) && (
                <div key={index}>
                  <h4>
                    subpool-{index + 1} : current price{" "}
                    {formatEther(subpools[index].price)} ether : (
                    {value[index]?.tokens.length || 0} selected)
                  </h4>

                  <div style={{ maxHeight: 200, overflow: "auto" }}>
                    {nfts
                      .slice(hideFirstNft ? 1 : 0)
                      .map(({ image, tokenId }) => {
                        const currentInput = value[index];
                        const selected = currentInput?.tokens.some(
                          (v) => tokenId === v.tokenId
                        );

                        return (
                          <img
                            height={60}
                            src={image}
                            key={tokenId}
                            style={{
                              marginRight: 4,
                              cursor: "pointer",
                              border: selected
                                ? "2px solid red"
                                : "2px solid transparent",
                            }}
                            onClick={() => {
                              if (selected) {
                                currentInput.tokens =
                                  currentInput.tokens.filter(
                                    (v) => v.tokenId != tokenId
                                  );
                              } else {
                                const token = {
                                  tokenId,
                                  proof: generateMerkleProof(
                                    tokenId,
                                    rankings,
                                    index
                                  ),
                                };

                                if (currentInput) {
                                  currentInput.tokens.push(token);
                                } else {
                                  currentInput = {
                                    tokens: [token],
                                    subpoolId: index,
                                  };
                                }
                              }

                              onChange({ ...value, [index]: currentInput });
                            }}
                          />
                        );
                      })}
                  </div>
                </div>
              )
          )}
      </div>
    </div>
  );
};
