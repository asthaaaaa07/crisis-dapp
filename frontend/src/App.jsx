import { useEffect, useMemo, useState } from 'react'
import { BrowserProvider, Contract, parseEther } from 'ethers'
import addresses from './addresses.json'
import aidVoucherAbiJson from './abis/AidVoucher.json'
import witnessStakingAbiJson from './abis/WitnessStaking.json'
import './App.css'
import Map from './components/Map'

const AMOY_PARAMS = {
	chainId: '0x13882', // 80002
	chainName: 'Polygon Amoy',
	nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
	rpcUrls: ['https://rpc-amoy.polygon.technology'],
	blockExplorerUrls: ['https://www.oklink.com/amoy']
}

function App() {
	const [provider, setProvider] = useState(null)
	const [signer, setSigner] = useState(null)
	const [account, setAccount] = useState('')
	const [chainId, setChainId] = useState('')
	const [status, setStatus] = useState('')
	const [error, setError] = useState('')
	const [mintTo, setMintTo] = useState('')
	const [redeemTokenId, setRedeemTokenId] = useState('')
	const [stakeAmount, setStakeAmount] = useState('')

	const aidVoucher = useMemo(() => {
		if (!signer) return null
		return new Contract(addresses.AidVoucher, aidVoucherAbiJson.abi, signer)
	}, [signer])

	const witnessStaking = useMemo(() => {
		if (!signer) return null
		return new Contract(addresses.WitnessStaking, witnessStakingAbiJson.abi, signer)
	}, [signer])

	useEffect(() => {
		if (!window.ethereum) return
		const prov = new BrowserProvider(window.ethereum)
		setProvider(prov)

		const handleChainChanged = () => window.location.reload()
		const handleAccountsChanged = (accs) => {
			if (accs && accs.length) setAccount(accs[0])
		}
		window.ethereum.on('chainChanged', handleChainChanged)
		window.ethereum.on('accountsChanged', handleAccountsChanged)
		return () => {
			if (!window.ethereum) return
			window.ethereum.removeListener('chainChanged', handleChainChanged)
			window.ethereum.removeListener('accountsChanged', handleAccountsChanged)
		}
	}, [])

	async function ensureAmoyChain() {
		if (!window.ethereum) throw new Error('MetaMask not found')
		try {
			await window.ethereum.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: AMOY_PARAMS.chainId }] })
		} catch (err) {
			if (err && err.code === 4902) {
				await window.ethereum.request({ method: 'wallet_addEthereumChain', params: [AMOY_PARAMS] })
			} else {
				throw err
			}
		}
	}

	async function connectWallet() {
		setError('')
		setStatus('')
		try {
			await ensureAmoyChain()
			const accs = await window.ethereum.request({ method: 'eth_requestAccounts' })
			const newProvider = new BrowserProvider(window.ethereum)
			const newSigner = await newProvider.getSigner()
			const network = await newProvider.getNetwork()
			setProvider(newProvider)
			setSigner(newSigner)
			setAccount(accs[0])
			setChainId(network.chainId.toString())
			setStatus('Connected')
		} catch (e) {
			setError(e.message || String(e))
		}
	}

	async function handleMint() {
		if (!aidVoucher) return
		setError('')
		setStatus('')
		try {
			const tx = await aidVoucher.mintVoucher(mintTo)
			setStatus('Minting... ' + tx.hash)
			const receipt = await tx.wait()
			setStatus('Minted. Block: ' + receipt.blockNumber)
		} catch (e) {
			setError(e.shortMessage || e.message || String(e))
		}
	}

	async function handleRedeem() {
		if (!aidVoucher) return
		setError('')
		setStatus('')
		try {
			const tokenId = BigInt(redeemTokenId)
			const tx = await aidVoucher.redeem(tokenId)
			setStatus('Redeeming... ' + tx.hash)
			const receipt = await tx.wait()
			setStatus('Redeemed. Block: ' + receipt.blockNumber)
		} catch (e) {
			setError(e.shortMessage || e.message || String(e))
		}
	}

	async function handleStake() {
		if (!witnessStaking) return
		setError('')
		setStatus('')
		try {
			const value = parseEther(stakeAmount || '0')
			const tx = await witnessStaking.stake({ value })
			setStatus('Staking... ' + tx.hash)
			const receipt = await tx.wait()
			setStatus('Staked. Block: ' + receipt.blockNumber)
		} catch (e) {
			setError(e.shortMessage || e.message || String(e))
		}
	}

	return (
		<div style={{ minHeight: '100%', maxWidth: 960, margin: '0 auto', padding: 24 }}>
			<h1 style={{ fontSize: 24, fontWeight: 700 }}>Aid Voucher & Witness Staking (Polygon Amoy)</h1>
			<div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
				<button onClick={connectWallet} style={{ padding: '8px 16px', borderRadius: 6, background: '#4f46e5', color: '#fff', border: 'none' }}>Connect MetaMask</button>
				{account && <span style={{ fontSize: 12, wordBreak: 'break-all' }}>{account}</span>}
				{chainId && <span style={{ fontSize: 12 }}>Chain: {chainId}</span>}
			</div>
			{status && <div style={{ padding: 12, borderRadius: 6, background: '#d1fae5', color: '#065f46', fontSize: 12 }}>{status}</div>}
			{error && <div style={{ padding: 12, borderRadius: 6, background: '#fee2e2', color: '#991b1b', fontSize: 12 }}>{error}</div>}

			<div style={{ display: 'grid', gap: 24, gridTemplateColumns: 'repeat( auto-fit, minmax(280px, 1fr) )' }}>
				<div style={{ padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', display: 'grid', gap: 12 }}>
					<h2 style={{ fontWeight: 600 }}>Mint AidVoucher</h2>
					<input type="text" placeholder="Redeemer address" value={mintTo} onChange={e => setMintTo(e.target.value)} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px' }} />
					<button onClick={handleMint} style={{ padding: '8px 16px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none' }}>Mint</button>
				</div>

				<div style={{ padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', display: 'grid', gap: 12 }}>
					<h2 style={{ fontWeight: 600 }}>Redeem AidVoucher</h2>
					<input type="number" placeholder="Token ID" value={redeemTokenId} onChange={e => setRedeemTokenId(e.target.value)} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px' }} />
					<button onClick={handleRedeem} style={{ padding: '8px 16px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none' }}>Redeem</button>
				</div>

				<div style={{ padding: 16, borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', display: 'grid', gap: 12 }}>
					<h2 style={{ fontWeight: 600 }}>Stake MATIC</h2>
					<input type="text" placeholder="Amount in MATIC" value={stakeAmount} onChange={e => setStakeAmount(e.target.value)} style={{ width: '100%', border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 12px' }} />
					<button onClick={handleStake} style={{ padding: '8px 16px', borderRadius: 6, background: '#2563eb', color: '#fff', border: 'none' }}>Stake</button>
				</div>
			</div>
			<div style={{ fontSize: 12, color: '#6b7280' }}>
				<div>AidVoucher: {addresses.AidVoucher}</div>
				<div>WitnessStaking: {addresses.WitnessStaking}</div>
			</div>
			<div>
				<Map />
			</div>
		</div>
	)
}

export default App
