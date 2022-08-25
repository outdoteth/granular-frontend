import { defaultAbiCoder } from "ethers/lib/utils";
import keccak256 from "keccak256";
import MerkleTree from "merkletreejs";

export const generateMerkleProof = (tokenId, rankings, subpoolId) => {
  const sortedRankings = Object.entries(rankings).reduce((arr, [k, v]) => {
    const bin = v - 1;

    if (arr[bin]) arr[bin].push(k);
    else arr[bin] = [k];
    return arr;
  }, []);

  const leaves = sortedRankings[subpoolId].map((v) =>
    keccak256(defaultAbiCoder.encode(["uint256"], [v]))
  );
  const tree = new MerkleTree(leaves, keccak256, { sort: true });
  const proof = tree.getHexProof(
    keccak256(defaultAbiCoder.encode(["uint256"], [tokenId]))
  );

  return proof;
};
