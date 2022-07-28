import { useMoralisQuery } from "react-moralis";

export default function NftOverview() {
  const {
    data: listedNfts,
    error,
    isFetching,
  } = useMoralisQuery("ActiveItem", (query) =>
    query.limit(10).descending("tokenId")
  );

  if (isFetching) {
    return <div>Loading</div>;
  }

  return <div>{listedNfts.map((item) => item.get("tokenId"))}</div>;
}
