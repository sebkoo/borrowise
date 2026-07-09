# 1. Record architecture decisions

Date: 2026-07-09

## Status

Accepted

## Context

We need to record the architectural decisions made on this project, both to onboard
contributors quickly and to make the reasoning legible to reviewers — including hiring
teams evaluating this repository.

## Decision

We will use Architecture Decision Records, as described by Michael Nygard in
[Documenting Architecture Decisions](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions).

Each ADR is a short Markdown file in `docs/adr/`, numbered sequentially and never deleted.
When a decision is revisited, we add a new ADR that supersedes the old one rather than
editing history. Each record uses the same lightweight structure: Status, Context, Decision,
Consequences.

## Consequences

See Michael Nygard's article, linked above. A lightweight tool such as
[adr-tools](https://github.com/npryce/adr-tools) may be used to manage these files, but is
not required.
