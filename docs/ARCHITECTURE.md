# Architecture

POD Product Clone is a standalone application.

## Isolation boundary
- independent GitHub repository
- independent deploy
- independent MCP endpoint
- independent Supabase project/schema
- independent admin UI
- independent plugin/app registration
- no Creative DNA tables or resolver fallback

## Data model
Cases contain raw competitor evidence and generated product directions.
Knowledge nodes contain reusable, approved learnings only.
Proposals are review objects and never affect production memory until explicitly merged.

## Lifecycle
DRAFT CASE -> ANALYSIS -> USER REVIEW -> PACKAGE REQUEST -> PENDING PROPOSAL -> ADMIN REVIEW -> ACCEPTED -> EXPLICIT MERGE -> CANONICAL KNOWLEDGE
