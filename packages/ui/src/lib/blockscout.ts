import { Address, Hex, encodeEventTopics, parseAbiItem } from "viem";

import {
  BLOBME_ADDRESSES,
  SUPPORTED_CHAIN_ID,
  BLOCKSCOUT_ENDPOINTS,
} from "@/config";
import { blobmeAbi } from "./blobme";
import { getClient } from "@wagmi/core";
import { wagmiConfig } from "./wagmi";
import { getLogs } from "viem/actions";

export interface NextPageParams {
  block_number: number;
  index: number;
  items_count: number;
}

export interface QueryLogsResponse {
  items: Log[];
  next_page_params: NextPageParams;
}

export interface Log {
  address: AddressParam;
  block_hash: Hex;
  block_number: number;
  data: Hex;
  // TODO: decoded
  index: number;
  smart_contract: AddressParam;
  topics: Hex[];
  tx_hash: Hex;
}

export interface AddressParam {
  hash: Address;
  implementation_name: string;
  name: string;
  is_contract: boolean;
  // TODO: private_tags
  // TODO: watchlist_names
  // TODO: public_tags
  is_verified: boolean;
}

export async function queryLogsLegacy(chainId: SUPPORTED_CHAIN_ID) {
  const blobmeAddress = BLOBME_ADDRESSES[chainId];

  if (chainId === 1337) {
    const client = getClient(wagmiConfig, { chainId }); // TODO

    const logs = await getLogs(client!, {
      address: blobmeAddress,
      event: parseAbiItem(
        "event Mine(address indexed miner, bytes32 blobHash)",
      ),
      strict: true,
      fromBlock: 0n,
    });
    return {
      items: logs.reverse().map((log) => ({
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
        address: log.address,
        topics: log.topics,
        data: log.data,
      })),
      next_page_params: null,
    };
  }

  const url = new URL(
    `/api/v2/addresses/${blobmeAddress}/logs`,
    BLOCKSCOUT_ENDPOINTS[chainId],
  );

  let logs: any[] = [];

  let nextPageParams: NextPageParams | null = null;

  do {
    if (nextPageParams) {
      const searchParams = new URLSearchParams({
        block_number: nextPageParams.block_number.toString(),
        index: nextPageParams.index.toString(),
        items_count: nextPageParams.items_count.toString(),
      });
      url.search = searchParams.toString();
    }

    const res = await fetch(url);

    const data: QueryLogsResponse = await res.json();

    const [topic] = encodeEventTopics({
      abi: blobmeAbi,
      eventName: "Mine",
    });

    logs = logs.concat(
      ...data.items
        .map((item) => ({
          transactionHash: item.tx_hash,
          blockNumber: item.block_number,
          address: item.address.hash,
          topics: [item.topics[0], item.topics[1]] as [Hex, Hex],
          data: item.data,
        }))
        .filter(({ topics }) => topics[0] === topic),
    );

    if (logs.length >= 100 || !data.next_page_params) break;

    nextPageParams = data.next_page_params;
  } while (true);

  return { items: logs, next_page_params: null };
}

export async function queryLogs(
  chainId: SUPPORTED_CHAIN_ID,
  nextPageParams?: NextPageParams | null,
) {
  const blobmeAddress = BLOBME_ADDRESSES[chainId];
  if (chainId === 1337) {
    const client = getClient(wagmiConfig, { chainId }); // TODO

    const logs = await getLogs(client!, {
      address: blobmeAddress,
      event: parseAbiItem(
        "event Mine(address indexed miner, bytes32 blobHash)",
      ),
      strict: true,
      fromBlock: 0n,
    });
    return {
      items: logs.map((log) => ({
        transactionHash: log.transactionHash,
        blockNumber: Number(log.blockNumber),
        address: log.address,
        topics: log.topics,
        data: log.data,
      })),
      next_page_params: null,
    };
  }

  const url = new URL(
    `/api/v2/addresses/${blobmeAddress}/logs`,
    BLOCKSCOUT_ENDPOINTS[chainId],
  );

  if (nextPageParams) {
    const searchParams = new URLSearchParams({
      block_number: nextPageParams.block_number.toString(),
      index: nextPageParams.index.toString(),
      items_count: nextPageParams.items_count.toString(),
    });
    url.search = searchParams.toString();
  }

  const res = await fetch(url);

  const data: QueryLogsResponse = await res.json();

  const [topic] = encodeEventTopics({
    abi: blobmeAbi,
    eventName: "Mine",
  });

  return {
    items: data.items
      .map((item) => ({
        transactionHash: item.tx_hash,
        blockNumber: item.block_number,
        address: item.address.hash,
        topics: [item.topics[0], item.topics[1]] as [Hex, Hex],
        data: item.data,
      }))
      .filter(({ topics }) => topics[0] === topic),
    next_page_params: data.next_page_params,
  };
}

export interface GetTransactionResponse extends Record<string, unknown> {
  burnt_blob_fee: string;
  tx_burnt_fee: string;
}

export async function getTransaction(
  chainId: SUPPORTED_CHAIN_ID,
  hash: Hex,
): Promise<GetTransactionResponse> {
  const url = new URL(
    `/api/v2/transactions/${hash}`,
    BLOCKSCOUT_ENDPOINTS[chainId],
  );
  const res = await fetch(url);

  return res.json();
}
