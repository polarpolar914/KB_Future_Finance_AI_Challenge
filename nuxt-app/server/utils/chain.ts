import { JsonRpcProvider, Contract, ContractFactory, Signer } from 'ethers'
import fs from 'fs'
import path from 'path'

export const provider = new JsonRpcProvider(
    process.env.CHAIN_RPC_URL || 'http://localhost:8545',
)

const escrowArtifactPath = path.join(process.cwd(), 'artifacts', 'contracts', 'Escrow.sol', 'Escrow.json')
const escrowArtifact = fs.existsSync(escrowArtifactPath)
    ? JSON.parse(fs.readFileSync(escrowArtifactPath, 'utf8'))
    : null
const guaranteeArtifactPath = path.join(process.cwd(), 'artifacts', 'contracts', 'GuaranteeVault.sol', 'GuaranteeVault.json')
const guaranteeArtifact = fs.existsSync(guaranteeArtifactPath)
    ? JSON.parse(fs.readFileSync(guaranteeArtifactPath, 'utf8'))
    : null
const insuranceArtifactPath = path.join(process.cwd(), 'artifacts', 'contracts', 'InsurancePool.sol', 'InsurancePool.json')
const insuranceArtifact = fs.existsSync(insuranceArtifactPath)
    ? JSON.parse(fs.readFileSync(insuranceArtifactPath, 'utf8'))
    : null
const claimArtifactPath = path.join(process.cwd(), 'artifacts', 'contracts', 'ClaimNFT.sol', 'ClaimNFT.json')
const claimArtifact = fs.existsSync(claimArtifactPath)
    ? JSON.parse(fs.readFileSync(claimArtifactPath, 'utf8'))
    : null

const logDir = path.join(process.cwd(), 'event_logs')
function log(file: string, data: unknown) {
    if (!fs.existsSync(logDir)) fs.mkdirSync(logDir, { recursive: true })
    fs.appendFileSync(path.join(logDir, file), `${new Date().toISOString()} ${JSON.stringify(data)}\n`)
}

export async function deployEscrow(payer: string, payee: string, amounts: bigint[], signer: Signer) {
    if (!escrowArtifact) throw new Error('compile contracts first')
    const factory = new ContractFactory(escrowArtifact.abi, escrowArtifact.bytecode, signer)
    const contract = await factory.deploy(payer, payee, amounts)
    const tx = contract.deploymentTransaction()
    if (tx) log('transactions.log', { type: 'deploy', hash: tx.hash })
    contract.on('Deposited', (from, value) =>
        log('events.log', { event: 'Deposited', from, amount: value.toString() }),
    )
    contract.on('MilestoneConfirmed', (idx) =>
        log('events.log', { event: 'MilestoneConfirmed', index: Number(idx) }),
    )
    contract.on('FundsReleased', (value) =>
        log('events.log', { event: 'FundsReleased', amount: value.toString() }),
    )
    await contract.waitForDeployment()
    return contract as Contract
}

export function getEscrow(address: string, signerOrProvider: Signer | JsonRpcProvider = provider) {
    if (!escrowArtifact) throw new Error('compile contracts first')
    return new Contract(address, escrowArtifact.abi, signerOrProvider)
}

export async function getEscrowStatus(address: string, milestoneCount = 0) {
    const contract = getEscrow(address)
    const balance: bigint = await contract.balance()
    let confirmed = 0
    for (let i = 0; i < milestoneCount; i++) {
        const m = await contract.milestones(i)
        if (m.released) confirmed++
    }
    return {
        balance: balance.toString(),
        confirmedMilestones: confirmed,
        totalMilestones: milestoneCount,
    }
}

export async function deployGuaranteeVault(signer: Signer) {
    if (!guaranteeArtifact) throw new Error('compile contracts first')
    const factory = new ContractFactory(guaranteeArtifact.abi, guaranteeArtifact.bytecode, signer)
    const contract = await factory.deploy()
    const tx = contract.deploymentTransaction()
    if (tx) log('transactions.log', { type: 'deploy', hash: tx.hash })
    contract.on('GuaranteeLimitSet', (account, limit) =>
        log('events.log', { event: 'GuaranteeLimitSet', account, limit: limit.toString() }),
    )
    contract.on('Locked', (dealId, amount) =>
        log('events.log', { event: 'Locked', dealId: dealId.toString(), amount: amount.toString() }),
    )
    contract.on('Unlocked', (dealId, amount) =>
        log('events.log', { event: 'Unlocked', dealId: dealId.toString(), amount: amount.toString() }),
    )
    await contract.waitForDeployment()
    return contract as Contract
}

export function getGuaranteeVault(address: string, signerOrProvider: Signer | JsonRpcProvider = provider) {
    if (!guaranteeArtifact) throw new Error('compile contracts first')
    return new Contract(address, guaranteeArtifact.abi, signerOrProvider)
}

export async function deployInsurancePool(signer: Signer) {
    if (!insuranceArtifact) throw new Error('compile contracts first')
    const factory = new ContractFactory(insuranceArtifact.abi, insuranceArtifact.bytecode, signer)
    const contract = await factory.deploy()
    const tx = contract.deploymentTransaction()
    if (tx) log('transactions.log', { type: 'deploy', hash: tx.hash })
    contract.on('DealRegistered', (dealId, insured, premium) =>
        log('events.log', { event: 'DealRegistered', dealId: dealId.toString(), insured, premium: premium.toString() }),
    )
    contract.on('PayoutTriggered', (dealId, to, amount) =>
        log('events.log', { event: 'PayoutTriggered', dealId: dealId.toString(), to, amount: amount.toString() }),
    )
    await contract.waitForDeployment()
    return contract as Contract
}

export function getInsurancePool(address: string, signerOrProvider: Signer | JsonRpcProvider = provider) {
    if (!insuranceArtifact) throw new Error('compile contracts first')
    return new Contract(address, insuranceArtifact.abi, signerOrProvider)
}

export async function deployClaimNFT(signer: Signer) {
    if (!claimArtifact) throw new Error('compile contracts first')
    const factory = new ContractFactory(claimArtifact.abi, claimArtifact.bytecode, signer)
    const contract = await factory.deploy()
    const tx = contract.deploymentTransaction()
    if (tx) log('transactions.log', { type: 'deploy', hash: tx.hash })
    await contract.waitForDeployment()
    return contract as Contract
}

export function getClaimNFT(address: string, signerOrProvider: Signer | JsonRpcProvider = provider) {
    if (!claimArtifact) throw new Error('compile contracts first')
    return new Contract(address, claimArtifact.abi, signerOrProvider)
}