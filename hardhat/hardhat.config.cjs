require('@nomicfoundation/hardhat-toolbox');

/** @type {import('hardhat/config').HardhatUserConfig} */
const config = {
  solidity: '0.8.20',
  paths: {
    sources: './contracts',
    artifacts: './artifacts'
  }
};

module.exports = config;
