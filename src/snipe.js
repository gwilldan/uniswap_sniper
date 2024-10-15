import {
	ethers,
	JsonRpcProvider,
	WebSocketProvider,
	Contract,
	Wallet,
	formatEther,
	parseEther,
} from "ethers";
import { checkReserve } from "./lib/checks.js";
import getMinAmount, { router } from "./lib/getMinAmount.js";
import dotenv from "dotenv";
dotenv.config();
import {
	ETH_BUY,
	FACTORY_CA,
	ROUTER_CA,
	SLIPPAGE,
	TOKEN_CA,
	WETH_CA,
	RPC_URL,
	WS_URL,
} from "../constants.js";
import color from "colors";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const provider = new JsonRpcProvider(RPC_URL);
const wsProvider = new WebSocketProvider(WS_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);

if (
	!RPC_URL ||
	!TOKEN_CA ||
	!ETH_BUY ||
	!FACTORY_CA ||
	!WETH_CA ||
	!PRIVATE_KEY
) {
	throw new Error(
		"Please set all required environment variables in the .env file"
	);
}

const amountIn = parseEther(ETH_BUY); // the intended amount of purchase in eth

const Factory = new Contract(
	FACTORY_CA,
	[
		"event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
		"function getPair(address , address ) external view returns (address )",
	],
	wsProvider
);

const swap = async (weth, tokenOut, minAmount) => {
	console.log("Pair spotted");
	console.log("Initiating buy...");
	try {
		const tx = await router.swapExactETHForTokens(
			minAmount,
			[weth, tokenOut],
			wallet.address,
			Math.floor(Date.now() / 1000) * 60 * 3, //3 minutes buy window!
			{
				value: amountIn,
			}
		);
		console.log("Buying...");
		const receipt = await tx.wait();
		console.log("Transaction Successfull!");
		console.log(receipt);
	} catch (error) {
		console.error(error);
	}
};

const main = async () => {
	console.log("Starting....");

	try {
		Factory.on("PairCreated", async (token0, token1, pair, id) => {
			console.log(new Date(), "NEW PAIR...", {
				base: token0,
				quote: token1,
				pair: pair,
				id: id,
			});
			if (token0 == WETH_CA) {
				const { tokenReserve, wethReserve } = await checkReserve(pair);
				console.log("Eth in this pool is ", formatEther(wethReserve));
				if (wethReserve > parseEther("2")) {
					const minAmount = await getMinAmount(wethReserve, tokenReserve);
					console.log("MINIMUM AMOUNT", formatEther(minAmount).green);
					swap(token0, token1, minAmount);
				}
			}
			if (token1 == WETH_CA) {
				const { tokenReserve, wethReserve } = await checkReserve(
					pair,
					"reverse"
				);
				console.log("Eth in the pool is ", formatEther(wethReserve));
				if (wethReserve > parseEther("2")) {
					const minAmount = await getMinAmount(wethReserve, tokenReserve);
					console.log("MINIMUM AMOUNT", formatEther(minAmount).green);
					swap(token1, token0, minAmount);
				}
			}
		});
	} catch (error) {
		console.error(error);
	}
};
main();
