import { ConnectWallet } from "@web3uikit/web3";
import { Link } from "react-router-dom";

export function Header() {
  return (
    <nav
      className={"p-5 border-b-2 flex flex-row justify-between items-center"}
    >
      <h1 className={"py-4 px-4 font-bold text-3xl"}>NFT Marketplace</h1>
      <div className={"flex flex-grow items-center "}>
        <Link to="/" className="mr-4 p-6">
          Home
        </Link>
        <Link to="/sell-nft" className="mr-4 p-6">
          Sell NFT
        </Link>
        <ConnectWallet moralisAuth={false} />
      </div>
    </nav>
  );
}
