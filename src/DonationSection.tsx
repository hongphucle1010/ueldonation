import { getContract, prepareContractCall, sendTransaction } from "thirdweb";
import { client, contractAddress } from "./client";
import { baseSepolia } from "thirdweb/chains";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { useState } from "react";
import { ethers } from "ethers";

const DonationSection: React.FC = () => {
  const [orgId, setOrgId] = useState(0);
  const [amount, setAmount] = useState(0);
  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: contractAddress,
  });

  const { data, isPending } = useReadContract({
    contract,
    method: "function donatorsCount() view returns (uint256)",
    params: [],
  });

  const { mutate: sendTransaction } = useSendTransaction();

  const onClick = () => {
    console.log("Donating", orgId, amount);
    const transaction = prepareContractCall({
      contract,
      method: "function contribute(uint256 orgId) payable",
      params: [BigInt(orgId)],
      value: ethers.utils.parseEther(String(amount)).toBigInt(),
    });
    sendTransaction(transaction);
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <p className="text-lg font-semibold">
          Number of donations: {isPending ? "Loading..." : String(data)}
        </p>
      </div>
      <div className="mb-4">
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Organization ID:
          </label>
          <input
            type="number"
            value={orgId}
            onChange={(e) => setOrgId(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Amount (ETH):
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <button
          onClick={onClick}
          className="mt-4 w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Donate
        </button>
      </div>

    </div>
  );
};

export default DonationSection;
