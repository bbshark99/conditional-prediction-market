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
    "LMSRMarketMakerFactory"
  );
  const lmsrMarketMakerFactory = await LMSRMarketMakerFactory.deploy();

  await lmsrMarketMakerFactory.deployed();

  // ConditionalToken contract deployment
  const ConditionalToken = await hre.ethers.getContractFactory(
    "ConditionalTokens"
  );
  const conditionalToken = await ConditionalToken.deploy();

  await conditionalToken.deployed();

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

  // ConditionalToken contract verification
  await hre.run("verify:verify", {
    address: conditionalToken.address,
    constructorArguments: [],
  });

  // Fixed192x64Math contract verification
  await hre.run("verify:verify", {
    address: fixed192x64Math.address,
    constructorArguments: [],
  });
}

// function linkBytecode(artifact, libraries) {
//   let bytecode = artifact.bytecode;

//   for (const [, fileReferences] of Object.entries(artifact.linkReferences)) {
//     for (const [libName, fixups] of Object.entries(fileReferences)) {
//       const addr = libraries[libName];
//       if (addr === undefined) {
//         continue;
//       }

//       for (const fixup of fixups) {
//         bytecode =
//           bytecode.substr(0, 2 + fixup.start * 2) +
//           addr.substr(2) +
//           bytecode.substr(2 + (fixup.start + fixup.length) * 2);
//       }
//     }
//   }

//   return bytecode;
// }

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
