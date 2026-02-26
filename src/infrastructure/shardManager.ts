/**
 * Shard Manager — deterministic shard resolution for data partitioning.
 *
 * Shards by: user_id hash, organization_id, or region.
 * Ensures co-located data for related entities.
 */

export type ShardKey = "user" | "org" | "region";

interface ShardResult {
  shardId: number;
  shardKey: ShardKey;
  entityId: string;
  partition: string;
}

const SHARD_COUNT = 16;

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

export function resolveShard(entityId: string, key: ShardKey = "user"): ShardResult {
  const shardId = hashString(entityId) % SHARD_COUNT;
  return {
    shardId,
    shardKey: key,
    entityId,
    partition: `shard_${key}_${shardId}`,
  };
}

export function resolveUserShard(userId: string): ShardResult {
  return resolveShard(userId, "user");
}

export function resolveOrgShard(orgId: string): ShardResult {
  return resolveShard(orgId, "org");
}

export function areCoLocated(entityA: string, entityB: string, key: ShardKey = "user"): boolean {
  return resolveShard(entityA, key).shardId === resolveShard(entityB, key).shardId;
}

export function getShardForPartition(partition: string): number {
  const match = partition.match(/shard_\w+_(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

export function getAllShardIds(): number[] {
  return Array.from({ length: SHARD_COUNT }, (_, i) => i);
}
