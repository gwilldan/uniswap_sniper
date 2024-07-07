import { ethers, Contract, JsonRpcProvider } from "ethers";
import { checkDecimals } from "./checks.js";
import dotenv from "dotenv";
dotenv.config();

const TOKEN_CA = process.env.TOKEN_CA;
const ETH_BUY = process.env.ETH_BUY;
const ROUTER_CA = process.env.ROUTER_CA;
const RPC_URL = process.env.RPC_URL;
const SLIPPAGE = process.env.SLIPPAGE;

const provider = new JsonRpcProvider(RPC_URL);

const router = new Contract(
	ROUTER_CA,
	[
		"function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut)",
		"function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external payable returns (uint256[] memory amounts)",
	],
	provider
);

const prepareAndSwap = async (wethReserve, tokenReserve) => {
	const amountIn = ethers.parseEther(ETH_BUY);

	const decimals = await checkDecimals(TOKEN_CA);
	const amountOut = await router.getAmountOut(
		amountIn,
		wethReserve,
		tokenReserve
	);

	const formattedAmount = ethers.formatUnits(amountOut, decimals);
	console.log(
		amountOut,
		formattedAmount,
		typeof amountOut,
		typeof formattedAmount
	);

	const minAmount = amountOut - (amountOut * BigInt(SLIPPAGE)) / 100n;

	return minAmount;
};

export default prepareAndSwap;
