// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Fixed192x64Math library deployment
  const Fixed192x64Math = await hre.ethers.getContractFactory(
    "Fixed192x64Math"
  );
  const fixed192x64Math = await Fixed192x64Math.deploy();

  await fixed192x64Math.deployed();

  // LMSRMarketMaker contract deployment
  const LMSRMarketMaker = await hre.ethers.getContractFactory(
    "LMSRMarketMaker",
    {
      libraries: {
        Fixed192x64Math: fixed192x64Math.address,
      },
    }
  );
  const lmsrMarketMaker = await LMSRMarketMaker.deploy();

  await lmsrMarketMaker.deployed();

  // LMSRMarketMakerFactory contract deployment
  const LMSRMarketMakerFactory = await hre.ethers.getContractFactory(
    "LMSRMarketMakerFactory",
    {
      libraries: {
        // Fixed192x64Math: "0x7e168b0604b26376cd3445eFa13c39a385393781",
        Fixed192x64Math: fixed192x64Math.address,
      },
    }
  );
  const lmsrMarketMakerFactory = await LMSRMarketMakerFactory.deploy();

  await lmsrMarketMakerFactory.deployed();

  console.log(
    `LMSRMarketMakerFactory deployed: ${lmsrMarketMakerFactory.address}`
  );

  // Fixed192x64Math contract verification
  await hre.run("verify:verify", {
    address: fixed192x64Math.address,
    constructorArguments: [],
  });

  // LMSRMarketMaker contract verification
  await hre.run("verify:verify", {
    address: lmsrMarketMaker.address,
    constructorArguments: [],
  });

  // LMSRMarketMakerFactory contract verification
  await hre.run("verify:verify", {
    address: lmsrMarketMakerFactory.address,
    constructorArguments: [],
  });
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
