import { http, createConfig, webSocket } from "wagmi";
import { mainnet, sepolia, holesky, localhost } from "wagmi/chains";

import { ALCHEMY_API_KEY } from "@/env";
import { SUPPORTED_CHAINS } from "@/config";

export const wagmiConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: {
    [holesky.id]: http(`https://ethereum-holesky-rpc.publicnode.com`),
    [localhost.id]: http(),
  },
});

export const wagmiWebsocketConfig = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: {
    [holesky.id]: webSocket("wss://ethereum-holesky-rpc.publicnode.com"),
    [localhost.id]: webSocket("ws://localhost:8545"),
  },
});

export const wagmiConfigForGetBlobBaseFee = createConfig({
  chains: SUPPORTED_CHAINS,
  transports: {
    [holesky.id]: http("https://rpc-holesky.rockx.com"),
    [localhost.id]: http(),
  },
});
