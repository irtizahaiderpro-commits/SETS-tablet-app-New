# TODO: Aerial image captions inconsistent with visible block counts

**Date raised:** 2026-06-10
**Status:** Deferred — do not fix yet
**Asset:** `public/sets-aerial-bay-layout.jpeg`

## Issue

The plot captions baked into the aerial yard image are inconsistent with the
actual visible block counts in the same image. The hotspot status data
(`src/data/aerialHotspots.ts`, fixed in commit `dc086e3`) is derived from the
visible block colours, which are the source of truth, so the Selected Bay
panel counts the real blocks and disagrees with the baked captions for two
plots.

## Current mismatch

| Plot | Baked image caption | Actual visible blocks |
| ---- | ------------------- | --------------------- |
| D    | 11 booked / 4 available (15 total) | 14 booked / 4 available (18 blocks: 8 orange + 6 purple + 4 grey) |
| F    | 24 booked / 11 available (35 total) | 29 booked / 11 available (40 blocks: 19 orange + 10 purple + 11 grey) |

Plots A, B, C, and E are consistent (captions match visible blocks).

## Later fix

Update/regenerate the aerial image labels so the captions match the actual
visible blocks, or provide a corrected image asset. Until then, leave the
Plot D and Plot F panel counts based on the real visible block colours — do
not fake the UI counts to match the incorrect captions, and do not change the
hotspot status data again.
