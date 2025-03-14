import { useReadContract } from "thirdweb/react";
import { client, contractAddress } from "./client";
import { getContract, readContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

interface Donator {
    address: string;
    totalAmount: number;
}

const History: React.FC = () => {
  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: contractAddress,
  });

  const [donators, setDonators] = useState<Donator[]>([]);

  const { data, isPending } = useReadContract({
    contract,
    method: "function getDonators() view returns (address[])",
    params: [],
  });

  useEffect(() => {
    const fetchDonators = async () => {
      const donators: Donator[] = [];
      for (let i = 0; data && i < data.length; i++) {
        const donator = await readContract({
            contract,
            method:
              "function donators(address) view returns (uint256 totalAmount, bool exists)",
            params: [data[i]],
          });

        donators.push({ address: data[i], totalAmount: Number(ethers.utils.formatEther(donator[0].toString())) });
      }
      setDonators(donators);
    };

    if (!isPending) {
      fetchDonators();
    }
  }, [data, isPending]);

  return (
    <div className="w-4/5 bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">Tổng quyên góp</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {isPending ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          <>
            <div className="flex justify-between items-center border-b py-2 font-bold">
              <span className="text-gray-700">Wallet address</span>
              <span className="text-gray-700">Total (ETH)</span>
            </div>
            {donators.map((donator, index) => (
              <div
                key={index}
                className="flex justify-between items-center border-b py-2"
              >
                <span className="text-gray-700">{donator.address}</span>
                <span className="text-gray-700">{donator.totalAmount} ETH</span>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default History;
