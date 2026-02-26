# RCollab — Multi-Region Disaster Recovery Plan

## Regions

| Code | Name | Currency | Role |
|------|------|----------|------|
| ap-south | South Asia | PKR | Primary |
| us-east | North America | USD | Secondary |
| eu-west | Europe | EUR | Tertiary |

## Data Replication Strategy

- **Primary → Secondary**: Async replication with < 5 min lag
- Financial ledger entries replicated synchronously
- PII never leaves primary region boundary
- Aggregate analytics replicated as read-only materialized views

## Recovery Objectives

| Metric | Target |
|--------|--------|
| **RTO** (Recovery Time) | < 30 minutes |
| **RPO** (Recovery Point) | < 5 minutes |

## Failover Sequence

1. Health monitor detects primary region failure (3 consecutive checks)
2. Admin alert triggered via `platform_alerts`
3. DNS failover routes traffic to secondary region
4. Secondary region promoted to active
5. Stripe webhook endpoints updated to secondary account
6. All new transactions routed to secondary
7. Post-recovery: reconcile any in-flight transactions

## Stripe Failover

- Each region has independent Stripe account
- Webhook secrets isolated per region
- No cross-region payment routing
- In failover: pending payments queued until region restored

## Financial Data Integrity

- Double-entry ledger replicated atomically
- Escrow states frozen during failover window
- No milestone releases during recovery
- Post-recovery reconciliation mandatory before resuming

## Testing

- DR drill quarterly
- Chaos test monthly (random region degradation)
- Automated failover validation in staging
