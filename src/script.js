import { ethers, JsonRpcProvider, Contract, Wallet } from "ethers";
import { checkReserve } from "./lib/checks.js";
import getMinAmount, { router } from "./lib/getMinAmount.js";
import dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const TOKEN_CA = process.env.TOKEN_CA;
const ETH_BUY = process.env.ETH_BUY;
const FACTORY_CA = process.env.FACTORY_CA;
const WETH_CA = process.env.WETH_CA;

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);

const amountIn = ethers.parseUnits(ETH_BUY, "ether"); // the intended amount of purchase in eth

const Factory = new Contract(
	FACTORY_CA,
	[
		"event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
	],
	wallet
);

const swap = async (weth, tokenOut, minAmount) => {
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

	Factory.on("PairCreated", async (token0, token1, pair, id) => {
		console.log(new Date(), "NEW PAIR...", {
			base: token0,
			quote: token1,
			pair: pair,
			id: id,
		});

		if (token0 == WETH_CA) {
			const { tokenReserve, wethReserve } = await checkReserve(pair);
			console.log("Eth in this pool is ", ethers.formatEther(wethReserve));
			if (token1 == TOKEN_CA) {
				const minAmount = await getMinAmount(wethReserve, tokenReserve);
				swap(token0, token1, minAmount);
			}
		}

		if (token1 == WETH_CA) {
			const { tokenReserve, wethReserve } = await checkReserve(pair, "reverse");
			console.log("Eth in the pool is ", ethers.formatEther(wethReserve));
			if (token0 == TOKEN_CA) {
				const minAmount = await getMinAmount(wethReserve, tokenReserve);
				swap(token1, token0, minAmount);
			}
		}
	});
};
main();
