import { ethers } from 'ethers'
import fs from 'fs'
import path from 'path'

async function main() {
    const provider = new ethers.JsonRpcProvider(process.env.CHAIN_RPC_URL || 'http://127.0.0.1:8545')
    const signer = await provider.getSigner()
    console.log('Deploying contracts with account:', await signer.getAddress())

    const artifact = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'artifacts', 'contracts', 'Escrow.sol', 'Escrow.json'), 'utf8'))
    const factory = new ethers.ContractFactory(artifact.abi, artifact.bytecode, signer)
    const amounts = process.argv.slice(2).map((a) => BigInt(a))
    const contract = await factory.deploy(
        await signer.getAddress(),
        await signer.getAddress(),
        amounts.length ? amounts : [0n],
    )
    await contract.waitForDeployment()

    console.log('Escrow deployed to:', await contract.getAddress())
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})