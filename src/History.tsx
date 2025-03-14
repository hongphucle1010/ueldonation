import { useReadContract } from "thirdweb/react";
import { client, contractAddress } from "./client";
import { getContract, readContract } from "thirdweb";
import { baseSepolia } from "thirdweb/chains";

const History: React.FC = () => {
  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: contractAddress,
  });

//   const getInfo = async (_donator: string) => {
//     const data = await readContract({
//       contract,
//       method:
//         "function getDonatorInfo(address _donator) view returns (uint256 totalAmount)",
//       params: [_donator],
//     });

//     return data;
//   };

  const { data, isPending } = useReadContract({
    contract,
    method: "function getDonators() view returns (address[])",
    params: [],
  });

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <h1 className="text-3xl font-bold text-center mb-6">History</h1>
      <div className="bg-white shadow-md rounded-lg p-6">
        {isPending ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : (
          data?.map((donator: string, index: number) => (
            <div
              key={index}
              className="flex justify-between items-center border-b py-2"
            >
              <span className="text-gray-700">{donator}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default History;
