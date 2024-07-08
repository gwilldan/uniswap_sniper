import { ethers, Contract, JsonRpcProvider, Wallet } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// const TOKEN_CA = process.env.TOKEN_CA;
const ETH_BUY = process.env.ETH_BUY;
const ROUTER_CA = process.env.ROUTER_CA;
const RPC_URL = process.env.RPC_URL;
const SLIPPAGE = process.env.SLIPPAGE;
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!RPC_URL || !ROUTER_CA || !ETH_BUY || !PRIVATE_KEY || !SLIPPAGE) {
	throw new Error(
		"Please set all required environment variables in the .env file"
	);
}

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);

export const router = new Contract(
	ROUTER_CA,
	[
		"function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut)",
		"function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external payable returns (uint256[] memory amounts)",
	],
	wallet
);

const getMinAmount = async (wethReserve, tokenReserve) => {
	const amountIn = ethers.parseEther(ETH_BUY);

	const amountOut = await router.getAmountOut(
		amountIn,
		wethReserve,
		tokenReserve
	);

	const minAmount = amountOut - (amountOut * BigInt(SLIPPAGE)) / 100n;

	return minAmount;
};

export default getMinAmount;
