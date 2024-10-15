import { ethers, JsonRpcProvider, Contract, Wallet } from "ethers";
import { checkReserve } from "./lib/checks.js";
import getMinAmount, { router } from "./lib/getMinAmount.js";
import dotenv from "dotenv";
dotenv.config();
import {
	ETH_BUY,
	FACTORY_CA,
	TOKEN_CA,
	WETH_CA,
	RPC_URL,
} from "../constants.js";

const PRIVATE_KEY = process.env.PRIVATE_KEY;

const provider = new JsonRpcProvider(RPC_URL);
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

const amountIn = ethers.parseEther(ETH_BUY);

const Factory = new Contract(
	FACTORY_CA,
	[
		"event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
		"function getPair(address , address ) external view returns (address )",
	],
	provider
);

const main = async () => {
	console.log("Starting the normal Buy script...");
	const pair = await Factory.getPair(WETH_CA, TOKEN_CA);
	const { tokenReserve, wethReserve } = await checkReserve(pair);
	console.log("Eth in this pool is ", ethers.formatEther(wethReserve));
	const minAmount = await getMinAmount(wethReserve, tokenReserve);
	console.log(ethers.formatEther(minAmount));
	try {
		const tx = await router.swapExactETHForTokens(
			minAmount,
			[WETH_CA, TOKEN_CA],
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

main();
