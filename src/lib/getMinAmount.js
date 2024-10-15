import { Contract, JsonRpcProvider, Wallet, parseEther } from "ethers";
import { ETH_BUY, ROUTER_CA, SLIPPAGE, RPC_URL } from "../../constants.js";

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(process.env.PRIVATE_KEY, provider);

export const router = new Contract(
	ROUTER_CA,
	[
		"function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut)",
		"function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external payable returns (uint256[] memory amounts)",
	],
	wallet
);

const getMinAmount = async (wethReserve, tokenReserve) => {
	const amountIn = parseEther(ETH_BUY);

	const amountOut = await router.getAmountOut(
		amountIn,
		wethReserve,
		tokenReserve
	);

	const minAmount = amountOut - (amountOut * BigInt(SLIPPAGE)) / 100n;

	return minAmount;
};

export default getMinAmount;
