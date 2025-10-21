COMBINEDPATTERN REFACTOR — Plan and rollout

Goal
----
Make `CombinedPattern` the canonical colorwork carrier across the codebase. Composer produces a `CombinedPattern` and downstream systems (StitchPlan, InstructionGenerator, exporters, UI) consume it directly. Remove bespoke colorwork mapping types and consolidate logic to reduce duplication and improve correctness.

Scope
-----
Files to change (high-priority):
- `src/models/PanelColorworkComposer.ts` — confirm `combinePatterns` returns a `CombinedPattern` instance and export the type.
- `src/models/StitchPlan.ts` — change `colorworkMapping` to store `CombinedPattern | null` and update/setter to accept `CombinedPattern`.
- `src/models/CombinedPattern.ts` (if a dedicated file doesn't exist, create one) — canonical type + serialization helpers.
- `src/models/ColorworkStitchPlanService.ts` / `src/models/StitchPlanGenerator.ts` — adapt to accept `CombinedPattern` for colorwork-aware generation.
- `src/components/ColorworkPanelEditor.tsx` — where the composer and InstructionGenerator are used; ensure wiring passes `CombinedPattern` through.
- `src/utils/libraryMergeColorwork.ts` — no functional change expected, but update comments to reference CombinedPattern as the canonical carrier for composed data.
- Tests: all tests touching StitchPlan colorwork mapping, composer outputs, and instruction generation.

API changes
-----------
- PanelColorworkComposer.combinePatterns(panel, pattern, options) -> CombinedPattern
  - Ensure `CombinedPattern` includes: `panel`, `colorworkPattern`, `mappedRows`, `stitchPlan`.
- StitchPlan:
  - `colorworkMapping?: CombinedPattern | null`
  - `setColorworkMapping(combined: CombinedPattern): void`
  - `generateColorworkInstructions()` consumes `this.colorworkMapping.mappedRows`

Migration strategy
------------------
1. Add `CombinedPattern` type file and export it.
2. Make non-breaking changes where possible:
   - Add new `colorworkMappingCombined?: CombinedPattern | null` alongside the old field.
   - Change `setColorworkMapping(...)` to accept `CombinedPattern` but keep old setter overloaded (if used in many places) for a short transitional period.
3. Update callers one-by-one:
   - Update `ColorworkPanelEditor` to call composer.combinePatterns(...) and pass the CombinedPattern directly to `stitchPlan.setColorworkMapping(combined)`.
   - Update `InstructionGenerator` usages to accept `CombinedPattern` where necessary. Prefer `combined.stitchPlan` when needing shaping-only logic.
4. Remove deprecated fields and old setter overloads after all callers are migrated.
5. Run tests and add targeted tests for the new contract.

Testing
-------
- Unit tests:
  - `PanelColorworkComposer` -> assert `combinePatterns` returns `CombinedPattern` with mappedRows length matching panel stitchPlan.rows length.
  - `StitchPlan.generateColorworkInstructions()` -> when `colorworkMapping` is set to a CombinedPattern produce expected per-row sequences.
- Integration tests:
  - `ColorworkPanelEditor` flow: composer -> instruction generator -> runner output unchanged compared to previous behavior.
  - Regression tests around short rows, shaping, and pattern alignment.

Migration checklist (concrete)
-----------------------------
- [ ] Create `src/models/CombinedPattern.ts` (type + fromJSON/toJSON)
- [ ] Update `PanelColorworkComposer` exports to reference CombinedPattern
- [ ] Update `StitchPlan` to store CombinedPattern (add new field, then migrate usages)
- [ ] Update `InstructionGenerator` to accept CombinedPattern in generateInstructions (if not already)
- [ ] Update `ColorworkPanelEditor` wiring
- [ ] Update tests and add new unit tests
- [ ] Remove deprecated mapping types and cleanup

Rollout and risk mitigation
---------------------------
- Rollout in small commits, each committing one file-level change plus test adjustments.
- Keep the old mapping field (deprecated) for one interim release with console warnings if used (helps library consumers).
- Encourage reviewers to run `yarn test`/`npm test` and run the interactive editor locally (manual smoke test with a known project manifest).

Estimated effort
----------------
- Core code edits: 1-2 dev days (composer, stitchplan, combined type)
- Tests & migrations: 1 day
- Review & cleanup: 0.5-1 day

Notes
-----
- This refactor centralizes behavior and reduces the likelihood of mismatches between the composer and instruction generator. It slightly tightens the coupling between components (they now share CombinedPattern) but reduces duplication and improves type safety.

If you'd like I can start by creating `src/models/CombinedPattern.ts` (a compact canonical class with fromJSON/toJSON) and then open follow-up commits to migrate `StitchPlan` and `PanelColorworkComposer` concretely.