// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @title ClaimNFT - NFT representing insurance claim certificates
contract ClaimNFT is ERC721URIStorage {
    uint256 public nextTokenId;

    constructor() ERC721("ClaimNFT", "CLM") {}

    /// @notice Mint a new claim NFT to `to` with metadata `tokenURI`
    /// @return tokenId The newly issued token id
    function issue(address to, string memory tokenURI)
        external
        returns (uint256 tokenId)
    {
        tokenId = ++nextTokenId;
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, tokenURI);
    }
}

