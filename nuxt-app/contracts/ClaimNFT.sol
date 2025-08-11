// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @title ClaimNFT - minimal NFT representing insurance claim certificates
contract ClaimNFT {
    string public constant name = "ClaimNFT";
    string public constant symbol = "CLM";

    uint256 public nextTokenId;

    struct Certificate {
        uint256 dealId;
        uint256 payoutAmount;
    }

    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => address) public ownerOf;
    mapping(address => uint256) public balanceOf;
    mapping(uint256 => string) private _tokenURIs;

    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event CertificateIssued(uint256 indexed tokenId, uint256 indexed dealId, uint256 payoutAmount);

    function tokenURI(uint256 tokenId) external view returns (string memory) {
        require(ownerOf[tokenId] != address(0), "nonexistent token");
        return _tokenURIs[tokenId];
    }

    function issueCertificate(
        address to,
        uint256 dealId,
        uint256 payoutAmount,
        string memory uri
    ) external returns (uint256 tokenId) {
        tokenId = ++nextTokenId;
        ownerOf[tokenId] = to;
        balanceOf[to] += 1;
        _tokenURIs[tokenId] = uri;
        certificates[tokenId] = Certificate(dealId, payoutAmount);
        emit Transfer(address(0), to, tokenId);
        emit CertificateIssued(tokenId, dealId, payoutAmount);
    }
}
