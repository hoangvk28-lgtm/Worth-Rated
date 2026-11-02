# Batch 23 writer round (WorthRated)

Read `scripts/batch9/WRITER-BRIEF.md` first; its Output format, Depth bar and Hard rules are binding, with these batch23 paths:
- briefs: `scripts/batch23/briefs/<range>.md` (your range is given in the task)
- research notes: `scripts/batch23/research/<seed-slug>.md`. Reuse if present. If missing for a seed, create it first from 2-4 WebSearch queries (how to choose, key specs and thresholds, common buyer mistakes, safety/compatibility gotchas). Real facts only.
- output: `scripts/batch23/content/<slug>.json`; skip any slug whose content file already exists.
- audit: after each article run `node scripts/batch23-audit.mjs <slug>` and fix until PASS (or justified skip).
- then run `python3 scripts/batch23-sim.py <slug>`: every value must be below 0.20. If not, rewrite the overlapping section in fresh words.

Extra rules:
- Every pick must truly match the article's angle (material, feature, brand or use only when the listing shows it). Skip accessories, refills, replacement parts. If fewer than 4 true matches exist, write {"skip": "reason"}.
- Budget (Under $N) articles: items are already within the cap; never state prices or dollar figures.
- No medical claims (arthritis, tremors, hearing loss): frame as ease of use and comfort; one FAQ may suggest asking a doctor or occupational therapist where relevant.
- Emergency lights: state runtime and battery only as the listing gives them. Do not call a product code-compliant or rated for commercial exit use unless the listing says so.
- Audience: active adults about 55-70 and family buying for them. No "we tested" language, no star ratings or review counts, no em or en dashes.
- Every description paragraph must be original prose: the build rejects paragraphs duplicated across any article in any batch.
- Do not edit files outside scripts/batch23/content and scripts/batch23/research. Do not run git. Never run tsc, build or dev (machine has little RAM).

## No generators (binding)
Write every article by hand with the Write tool. Never write or run a Python/JS script that assembles article prose from templates or sentence banks. Sibling articles (same seed, budget ladders) must not share sentences beyond product names and specs: different angles, examples and gotchas per article.

Final reply: only slugs written (PASS), slugs skipped with reason, research notes created.
