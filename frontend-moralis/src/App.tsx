import React from "react";
import { Header } from "./components/Header";
import { Route, Routes } from "react-router-dom";
import { SellNft } from "./screens/SellNft";
import { NftOverview } from "./screens/NftOverview";

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path="/" element={<NftOverview />} />
        <Route path="/sell-nft" element={<SellNft />} />
      </Routes>
    </div>
  );
}

export default App;
