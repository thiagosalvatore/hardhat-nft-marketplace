import { Contract } from "ethers";
import { Address } from "hardhat-deploy/dist/types";
import { deployments, ethers, getNamedAccounts } from "hardhat";
import { assert, expect } from "chai";
import { token } from "../typechain-types/@openzeppelin/contracts";

describe("NftMarketplace", () => {
  let nftMarketplace: Contract;
  let buyerNftMarketplace: Contract;
  let basicNft: Contract;
  let deployer: Address;
  let buyer: Address;
  const PRICE = ethers.utils.parseEther("0.01");

  beforeEach(async () => {
    deployer = (await getNamedAccounts()).deployer;
    await deployments.fixture(["marketplace", "basicnft"]);
    nftMarketplace = await ethers.getContract("NftMarketplace", deployer);
    basicNft = await ethers.getContract("BasicNft", deployer);

    const accounts = await ethers.getSigners();
    buyerNftMarketplace = nftMarketplace.connect(accounts[1]);
    buyer = accounts[1].address;
  });

  describe("when contract is constructed", () => {
    it("should initialize an empty map of proceeds", async () => {
      const proceeds = await nftMarketplace.getProceeds(basicNft.address);

      assert.equal(proceeds.toString(), "0");
    });

    it("should initialize an empty map of listings", async () => {
      const tokenId = await basicNft.getTokenCounter();

      const listing = await nftMarketplace.getListing(
        basicNft.address,
        tokenId
      );

      assert.equal(listing.price.toString(), "0");
      assert.equal(
        listing.seller.toString(),
        "0x0000000000000000000000000000000000000000"
      );
    });
  });

  describe("when list item is called", () => {
    it("should revert when the owner of the asset is someone else", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();

      await expect(
        buyerNftMarketplace.listItem(basicNft.address, tokenId, PRICE)
      ).to.be.revertedWithCustomError(
        buyerNftMarketplace,
        "NftMarketplace__NotOwner"
      );
    });

    it("should revert when the item is already listed", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await expect(
        nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
      ).to.be.revertedWithCustomError(
        nftMarketplace,
        "NftMarketplace__AlreadyListed"
      );
    });

    it("should revert when the marketplace is not approved to operate on the item", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();

      await expect(
        nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
      ).to.be.revertedWithCustomError(
        nftMarketplace,
        "NftMarketplace__NotApprovedForMarketplace"
      );
    });

    it("should revert when the price is less than or equal to zero", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);

      await expect(
        nftMarketplace.listItem(
          basicNft.address,
          tokenId,
          ethers.utils.parseEther("0")
        )
      ).to.be.revertedWithCustomError(
        nftMarketplace,
        "NftMarketplace__PriceMustBeAboveZero"
      );
    });

    it("should add the NFT to the listing map with the desired price", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);

      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      const listing = await nftMarketplace.getListing(
        basicNft.address,
        tokenId
      );
      assert.equal(listing.price.toString(), PRICE.toString());
      assert.equal(listing.seller, deployer);
    });

    it("should emit ItemListed event", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);

      await expect(
        nftMarketplace.listItem(basicNft.address, tokenId, PRICE)
      ).to.emit(nftMarketplace, "ItemListed");
    });
  });

  describe("when buy item is called", () => {
    it("should revert if item is not listed", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();

      await expect(
        nftMarketplace.buyItem(basicNft.address, tokenId)
      ).to.be.revertedWithCustomError(
        nftMarketplace,
        "NftMarketplace__NotListed"
      );
    });

    it("should revert if the function is being called by someone else already", async () => {});

    it("should revert if the value being paid is less than the listing price", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await expect(
        buyerNftMarketplace.buyItem(basicNft.address, tokenId, {
          value: ethers.utils.parseEther("0.00001"),
        })
      ).to.be.revertedWithCustomError(
        buyerNftMarketplace,
        "NftMarketplace__PriceNotMet"
      );
    });

    it("should add the value paid to the proceeds of the seller", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await buyerNftMarketplace.buyItem(basicNft.address, tokenId, {
        value: PRICE,
      });

      const proceeds = await nftMarketplace.getProceeds(deployer);
      assert.equal(proceeds.toString(), PRICE.toString());
    });

    it("should delete the item from the listing mapping", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await buyerNftMarketplace.buyItem(basicNft.address, tokenId, {
        value: PRICE,
      });

      const listing = await nftMarketplace.getListing(
        basicNft.address,
        tokenId
      );
      assert.equal(listing.price.toString(), "0");
      assert.equal(
        listing.seller.toString(),
        "0x0000000000000000000000000000000000000000"
      );
    });

    it("should emit item bought event", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await expect(
        buyerNftMarketplace.buyItem(basicNft.address, tokenId, {
          value: PRICE,
        })
      ).to.emit(buyerNftMarketplace, "ItemBought");
    });
  });

  describe("when cancel listing is called", () => {
    it("should revert if the item is not listed", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();

      await expect(
        nftMarketplace.cancelListing(basicNft.address, tokenId)
      ).to.be.revertedWithCustomError(
        nftMarketplace,
        "NftMarketplace__NotListed"
      );
    });

    it("should revert if the cancel is not being made by the owner", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await expect(
        buyerNftMarketplace.cancelListing(basicNft.address, tokenId)
      ).to.be.revertedWithCustomError(
        buyerNftMarketplace,
        "NftMarketplace__NotOwner"
      );
    });

    it("should delete the item from the listing mapping", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await nftMarketplace.cancelListing(basicNft.address, tokenId);

      const listing = await nftMarketplace.getListing(
        basicNft.address,
        tokenId
      );
      assert.equal(listing.price.toString(), "0");
      assert.equal(
        listing.seller.toString(),
        "0x0000000000000000000000000000000000000000"
      );
    });

    it("should emit the ItemCanceled event", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await expect(
        nftMarketplace.cancelListing(basicNft.address, tokenId)
      ).to.emit(nftMarketplace, "ItemCanceled");
    });
  });

  describe("when update listing is called", () => {
    it("should revert if the item is not listed", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      const newPrice = ethers.utils.parseEther("0.2");

      await expect(
        nftMarketplace.updateListing(basicNft.address, tokenId, newPrice)
      ).to.be.revertedWithCustomError(
        nftMarketplace,
        "NftMarketplace__NotListed"
      );
    });

    it("should revert if the update is not being made by the owner", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      const newPrice = ethers.utils.parseEther("0.2");
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await expect(
        buyerNftMarketplace.updateListing(basicNft.address, tokenId, newPrice)
      ).to.be.revertedWithCustomError(
        buyerNftMarketplace,
        "NftMarketplace__NotOwner"
      );
    });

    it("should update the price on the listing mapping", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      const newPrice = ethers.utils.parseEther("0.2");
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await nftMarketplace.updateListing(basicNft.address, tokenId, newPrice);

      const listing = await nftMarketplace.getListing(
        basicNft.address,
        tokenId
      );
      assert.equal(listing.price.toString(), newPrice.toString());
    });

    it("should emit ItemListed event", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      const newPrice = ethers.utils.parseEther("0.2");
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);

      await expect(
        nftMarketplace.updateListing(basicNft.address, tokenId, newPrice)
      ).to.emit(nftMarketplace, "ItemListed");
    });
  });

  describe("when withdraw is called", () => {
    it("should revert if there are no proceeds to withdraw for the caller", async () => {
      await expect(
        nftMarketplace.withdrawProceeds()
      ).to.be.revertedWithCustomError(
        nftMarketplace,
        "NftMarketplace__NoProceeds"
      );
    });

    it("should revert if the function is being executed by someone else", async () => {});

    it("should set the proceeds for the caller as 0", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
      await buyerNftMarketplace.buyItem(basicNft.address, tokenId, {
        value: PRICE,
      });

      await nftMarketplace.withdrawProceeds();

      const proceeds = await nftMarketplace.getProceeds(deployer);
      assert.equal(proceeds.toString(), "0");
    });

    it("should remove the item balance from the marketplace balance", async () => {
      const tokenId = await basicNft.getTokenCounter();
      await basicNft.mintNft();
      await basicNft.approve(nftMarketplace.address, tokenId);
      await nftMarketplace.listItem(basicNft.address, tokenId, PRICE);
      await buyerNftMarketplace.buyItem(basicNft.address, tokenId, {
        value: PRICE,
      });
      const initialBalance = await nftMarketplace.provider.getBalance(
        nftMarketplace.address
      );

      await nftMarketplace.withdrawProceeds();

      const finalBalance = await nftMarketplace.provider.getBalance(
        nftMarketplace.address
      );
      assert.equal(initialBalance.toString(), PRICE.toString());
      assert.equal(finalBalance.toString(), "0");
    });
  });
});
