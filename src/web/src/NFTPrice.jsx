import { useContractRead, WagmiConfig } from "wagmi";
import { parseEther, formatEther } from "@ethersproject/units";
import { optimism } from "wagmi/chains";
import { useEffect, useState } from "react";

import { client, chains } from "./client.mjs";

const abi = [
  {
    inputs: [],
    name: "saleDetails",
    outputs: [
      {
        components: [
          { internalType: "bool", name: "publicSaleActive", type: "bool" },
          { internalType: "bool", name: "presaleActive", type: "bool" },
          { internalType: "uint256", name: "publicSalePrice", type: "uint256" },
          { internalType: "uint64", name: "publicSaleStart", type: "uint64" },
          { internalType: "uint64", name: "publicSaleEnd", type: "uint64" },
          { internalType: "uint64", name: "presaleStart", type: "uint64" },
          { internalType: "uint64", name: "presaleEnd", type: "uint64" },
          {
            internalType: "bytes32",
            name: "presaleMerkleRoot",
            type: "bytes32",
          },
          {
            internalType: "uint256",
            name: "maxSalePurchasePerAddress",
            type: "uint256",
          },
          { internalType: "uint256", name: "totalMinted", type: "uint256" },
          { internalType: "uint256", name: "maxSupply", type: "uint256" },
        ],
        internalType: "struct IERC721Drop.SaleDetails",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];

const address = "0x66747bdc903d17c586fa09ee5d6b54cc85bbea45";

export const PriceComponent = (props) => {
  const [ethPrice, setEthPrice] = useState(null);
  const salesDetails = useContractRead({
    address,
    abi,
    functionName: "saleDetails",
    chainId: optimism.id,
  });

  useEffect(() => {
    (async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd",
      );

      const data = await response.json();
      setEthPrice(data.ethereum.usd);
    })();
  }, []);

  const salesPrice = salesDetails?.data?.publicSalePrice || 0;
  let total = salesPrice;
  if (total && props.fee) {
    total = total.add(parseEther(props.fee));
  }

  const usdPrice = ethPrice
    ? `$${(formatEther(total) * ethPrice).toFixed(2)}`
    : null;

  if (!usdPrice || !total) {
    return "...loading";
  }

  return (
    <span>
      <span>({usdPrice}) </span>
      <span>{formatEther(total)} ETH</span>
    </span>
  );
};

const WrappedPriceComponent = (props) => {
  return (
    <WagmiConfig client={client}>
      <PriceComponent {...props} />
    </WagmiConfig>
  );
};

export default WrappedPriceComponent;
