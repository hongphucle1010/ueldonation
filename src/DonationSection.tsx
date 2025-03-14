import {
  getContract,
  prepareContractCall,
  readContract,
  sendTransaction,
} from "thirdweb";
import { client, contractAddress } from "./client";
import { baseSepolia } from "thirdweb/chains";
import { useReadContract, useSendTransaction } from "thirdweb/react";
import { useEffect, useState } from "react";
import { ethers } from "ethers";

interface Organization {
  id: number;
  info: {
    name: string;
    address: string;
    totalDonations: number;
  };
}

const DonationSection: React.FC = () => {
  const [orgId, setOrgId] = useState(0);

  const [amount, setAmount] = useState(0);
  const contract = getContract({
    client: client,
    chain: baseSepolia,
    address: contractAddress,
  });

  const { data: orgCount, isLoading: isOrgCountPending } = useReadContract({
    contract,
    method: "function orgCount() view returns (uint256)",
    params: [],
  });

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  useEffect(() => {
    const fetchOrganizations = async () => {
      const orgs: Organization[] = [];
      for (let i = 0; orgCount && i < orgCount; i++) {
        const org = await readContract({
          contract,
          method:
            "function organizations(uint256) view returns (string name, address wallet, uint256 totalDonations)",
          params: [BigInt(i)],
        });
        orgs.push({
          id: i,
          info: {
            name: org[0],
            address: org[1],
            totalDonations: Number(ethers.utils.formatEther(org[2].toString())),
          },
        });
      }
      setOrganizations(orgs);
    };

    if (!isOrgCountPending) {
      fetchOrganizations();
    }
  }, [orgCount, isOrgCountPending]);

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
            Select Organization:
          </label>
          <select
            value={selectedOrganization ? selectedOrganization.id : ""}
            onChange={(e) => {
              const org = organizations.find(
                (org) => org.id === Number(e.target.value)
              );
              setSelectedOrganization(org || null);
            }}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>
              Select an organization
            </option>
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>
                {org.info.name + " - " + org.info.totalDonations.toString() + " ETH"}
              </option>
            ))}
          </select>
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
