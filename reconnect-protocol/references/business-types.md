# Business-Type Adaptations

How to adapt the reconnect protocol for different business types.

## Music / Audio Production

```json
{ "type": "compose_track", "agent": "MusicAgent", "payload": { "genre": "trap", "bpm": 140 } }
{ "type": "mix_session", "agent": "MusicAgent", "payload": { "sessionId": "abc123" } }
{ "type": "mint_nft", "agent": "MusicAgent", "payload": { "blockchain": "tezos", "trackId": "xyz" } }
```

Missed task notification:
```
🎵 BACK ONLINE — 2 Missed Tasks

  1. compose_track — MusicAgent (trap beat was scheduled ~14:00)
  2. mint_nft — MusicAgent (Tezos mint was scheduled ~15:00)

How would you like to catch up?
• one — finish tracks one at a time
• all  — complete everything now
```

## Finance / Payments

```json
{ "type": "process_payment", "agent": "FinanceAgent", "payload": { "amount": 1, "currency": "USD" } }
{ "type": "reconcile", "agent": "FinanceAgent", "payload": { "date": "2026-03-30" } }
```

Missed task notification:
```
💰 BACK ONLINE — 1 Missed Task

  1. process_payment — FinanceAgent ($1.00 payment was scheduled ~09:00)

⚠️ This involves real money. Run it now?
• one — process one at a time
• all  — process all pending
• skip — defer for now
```

## Healthcare

```json
{ "type": "send_reminder", "agent": "HealthAgent", "payload": { "patientId": "p123", "reminderType": "appointment" } }
{ "type": "process_claim", "agent": "HealthAgent", "payload": { "claimId": "c456" } }
```

Missed task notification:
```
🏥 BACK ONLINE — 1 Missed Task

  1. send_reminder — HealthAgent (patient appointment reminder was scheduled ~08:00)

How would you like to catch up?
• one — send reminders one at a time
• all  — send all pending
• skip — defer
```

## Retail / E-Commerce

```json
{ "type": "send_receipt", "agent": "RetailAgent", "payload": { "orderId": "o789" } }
{ "type": "update_inventory", "agent": "RetailAgent", "payload": { "sku": "ITEM-001", "delta": -1 } }
```

Missed task notification:
```
🛒 BACK ONLINE — 2 Missed Tasks

  1. send_receipt — RetailAgent (order #1042 receipt was scheduled ~10:00)
  2. update_inventory — RetailAgent (SKU-A update was scheduled ~10:05)

How would you like to catch up?
• one — handle one at a time
• all  — process all now
```

## SaaS / DevOps

```json
{ "type": "run_backup", "agent": "OpsAgent", "payload": { "target": "database", "strategy": "incremental" } }
{ "type": "deploy_update", "agent": "OpsAgent", "payload": { "version": "2.1.0", "env": "staging" } }
```

Missed task notification:
```
⚙️ BACK ONLINE — 1 Missed Task

  1. run_backup — OpsAgent (DB backup was scheduled ~02:00)

How would you like to catch up?
• one — run one backup at a time
• all  — run all pending backups
• skip — defer
```

## Agency / Marketing

```json
{ "type": "post_social", "agent": "SocialAgent", "payload": { "platform": "moltbook", "content": "..." } }
{ "type": "send_newsletter", "agent": "MarketingAgent", "payload": { "campaignId": "nl-42" } }
```

Missed task notification:
```
📣 BACK ONLINE — 3 Missed Tasks

  1. post_moltbook — SocialAgent (scheduled ~07:00)
  2. post_clawk   — SocialAgent (scheduled ~07:00)
  3. send_newsletter — MarketingAgent (scheduled ~09:00)

How would you like to catch up?
• one — post one at a time
• all  — post everything now
• skip — defer all
```

## Custom / Any Business

The protocol is business-type agnostic. Replace task types and agent names to match any vertical:

```json
{
  "type": "your_task_type",
  "agent": "YourAgentName",
  "payload": { }
}
```

The notification template stays the same — only the content changes.
