const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying Consultation contract...');
  
  const Consultation = await ethers.getContractFactory('Consultation');
  const consultation = await Consultation.deploy();
  
  await consultation.deployed();
  
  console.log('Consultation contract deployed to:', consultation.address);
  
  // Save the contract address and ABI for frontend use
  const fs = require('fs');
  const contractInfo = {
    address: consultation.address,
    abi: consultation.interface.format('json')
  };
  
  fs.writeFileSync(
    './src/contracts/ConsultationContract.json',
    JSON.stringify(contractInfo, null, 2)
  );
  
  console.log('Contract info saved to src/contracts/ConsultationContract.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });