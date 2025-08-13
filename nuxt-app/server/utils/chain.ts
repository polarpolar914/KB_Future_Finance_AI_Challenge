import { JsonRpcProvider, Contract, ContractFactory, Signer } from 'ethers'
import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

export const provider = new JsonRpcProvider(
    process.env.CHAIN_RPC_URL || 'http://localhost:8545',
)

function loadArtifact(relPath: string) {
    const fullPath = path.join(process.cwd(), 'artifacts', 'contracts', relPath)
    if (!fs.existsSync(fullPath)) {
        try {
            // Attempt to compile the contracts on-the-fly so development setups
            // that forgot to run ``hardhat compile`` still work.
            execSync('npx hardhat compile', { stdio: 'ignore' })
        } catch {
            // ignore errors; a missing artifact will be handled later
        }
    }
    return fs.existsSync(fullPath)
        ? JSON.parse(fs.readFileSync(fullPath, 'utf8'))
        : null
}

const escrowArtifact = loadArtifact(path.join('Escrow.sol', 'Escrow.json'))
const guaranteeArtifact = loadArtifact(path.join('GuaranteeVault.sol', 'GuaranteeVault.json'))
const insuranceArtifact = loadArtifact(path.join('InsurancePool.sol', 'InsurancePool.json'))
const claimArtifact = loadArtifact(path.join('ClaimNFT.sol', 'ClaimNFT.json'))

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
    contract.on('Deposit', (from, value) =>
        log('events.log', { event: 'Deposit', from, amount: value.toString() }),
    )
    contract.on('MilestoneConfirmed', (idx) =>
        log('events.log', { event: 'MilestoneConfirmed', index: Number(idx) }),
    )
    contract.on('Payout', (value) =>
        log('events.log', { event: 'Payout', amount: value.toString() }),
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
    contract.on('Payout', (dealId, to, amount) =>
        log('events.log', { event: 'Payout', dealId: dealId.toString(), to, amount: amount.toString() }),
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