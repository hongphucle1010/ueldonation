import MyConnectButton from "./ConnectButton";

const Navigation: React.FC = () => {

  return (
    <div className="flex justify-between items-center w-full p-4 bg-green-400">
      <div>
        <span>UEL Donation</span>
      </div>
      <MyConnectButton />
    </div>
  );
};

export default Navigation;
