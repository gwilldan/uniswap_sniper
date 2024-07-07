import { ethers, JsonRpcProvider, Contract, Wallet } from "ethers";
import { checkReserve } from "./lib/checks.js";
import getMinAmount from "./lib/getMinAmount.js";
import dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const RPC_URL = process.env.RPC_URL;
const TOKEN_CA = process.env.TOKEN_CA;
const ETH_BUY = process.env.ETH_BUY;

const provider = new JsonRpcProvider(RPC_URL);
const wallet = new Wallet(PRIVATE_KEY, provider);

// target addresses
const addresses = {
	WETH: "0x4200000000000000000000000000000000000006",
	TOKEN_CA: TOKEN_CA, //change ONLY the Token_CA!!!
	factory: "0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6",
	router: "0x4752ba5DBc23f44D87826276BF6Fd6b1C372aD24",
};

const amountIn = ethers.parseUnits(ETH_BUY, "ether"); // the intended amount of purchase in eth

const Factory = new Contract(
	addresses.factory,
	[
		"event PairCreated(address indexed token0, address indexed token1, address pair, uint)",
	],
	wallet
);

const router = new Contract(
	addresses.router,
	[
		"function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut)",
		"function swapExactETHForTokens(uint256 amountOutMin, address[] calldata path, address to, uint256 deadline) external payable returns (uint256[] memory amounts)",
	],
	wallet
);

// const prepareSwap = async (weth, tokenOut, pair, reverse) => {
// 	console.log("Pair Spotted, Initiating buy...");

// 	if (reverse) {
// 		const [tokenReserve, wethReserve] = reserves;
// 		console.log(
// 			"The pair contains eth value of --- ",
// 			ethers.formatEther(wethReserve)
// 		);

// 		const tx = await router.swapExactETHForTokens(
// 			minAmount,
// 			[weth, tokenOut],
// 			wallet.address,
// 			Math.floor(Date.now() / 1000) * 60 * 3, //3 minutes
// 			{
// 				value: amountIn,
// 			}
// 		);
// 		const receipt = await tx.wait();
// 		console.log("Transaction receipt");
// 		console.log(receipt);
// 	} else {
// 		const [wethReserve, tokenReserve] = reserves;
// 		const AmountOut = await router.getAmountOut(
// 			amountIn,
// 			wethReserve,
// 			tokenReserve
// 		);

// 		console.log(
// 			"The pair contains eth value of --- ",
// 			ethers.formatEther(wethReserve)
// 		);
// 		console.log(
// 			`Swapping the value of ${ethers.formatEther(
// 				amountIn
// 			)} ETH would give us ${ethers.formatEther(AmountOut)} tokens`
// 		);

// 		const minAmount =
// 			AmountOut - (BigInt(AmountOut) - ethers.parseEther("0.2")); //taking 20% slippage set
// 		console.log(ethers.formatEther(minAmount));

// 		const tx = await router.swapExactETHForTokens(
// 			minAmount,
// 			[weth, tokenOut],
// 			wallet.address,
// 			Math.floor(Date.now() / 1000) * 60 * 3, //3 minutes
// 			{
// 				value: amountIn,
// 			}
// 		);
// 		const receipt = await tx.wait();
// 		console.log("Transaction receipt");
// 		console.log(receipt);
// 	}
// };

const main = async () => {
	console.log("Starting....");

	// Factory.on("PairCreated", async (token0, token1, pair, id) => {
	// 	console.log(new Date(), "NEW PAIR...", {
	// 		base: token0,
	// 		quote: token1,
	// 		pair: pair,
	// 		id: id,
	// 	});

	// 	if (token0 == addresses.WETH) {
	// 		// prepareSwap(token0, token1, pair);
	// 		const { tokenReserve, wethReserve } = await checkReserve(pair);
	// 		console.log("Eth in the pool is ", ethers.formatEther(wethReserve));
	// 		getMinAmount(wethReserve, tokenReserve);
	// 	}

	// 	if (token1 == addresses.WETH) {
	// 		// console.log("Pair spoted");
	// 		// prepareSwap(token1, token0, pair, "reverse");
	// 		const { tokenReserve, wethReserve } = await checkReserve(pair, "reverse");
	// 		console.log("Eth in the pool is ", ethers.formatEther(wethReserve));
	// 		getMinAmount(wethReserve, tokenReserve);
	// 	}
	// });

	const minAmount = await getMinAmount(
		"0x4200000000000000000000000000000000000006",
		"0x65665436a1b6a5cAB489344Dad4CE475CFce9D02"
	);
	console.log("Min amount", minAmount);
};
main();
