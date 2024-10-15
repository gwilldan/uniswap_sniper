import { Contract, JsonRpcProvider } from "ethers";
import dotenv from "dotenv";
dotenv.config();
import { RPC_URL } from "../../constants.js";

const provider = new JsonRpcProvider(RPC_URL);

// ---------check the amount of weth and token in the liquidity pool
export const checkReserve = async (pair, reverse) => {
	const uniswapV2Pair = new Contract(
		pair,
		[
			"function getReserves() view returns(uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast)",
		],
		provider
	);

	const reserves = await uniswapV2Pair.getReserves();

	if (reverse) {
		const [tokenReserve, wethReserve] = reserves;
		return {
			wethReserve: wethReserve,
			tokenReserve: tokenReserve,
		};
	} else {
		const [wethReserve, tokenReserve] = reserves;
		return {
			wethReserve: wethReserve,
			tokenReserve: tokenReserve,
		};
	}
};

// ------------------------ GET TOKEN DECIMALS...
export const checkDecimals = async (tokenCA) => {
	const token = new Contract(
		tokenCA,
		["function decimals() external view returns (uint8)"],
		provider
	);

	const decimals = await token.decimals();
	return decimals;
};
