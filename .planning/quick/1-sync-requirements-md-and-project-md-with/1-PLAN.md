---
phase: quick-sync
plan: 1
type: execute
wave: 1
depends_on: []
files_modified: ['.planning/REQUIREMENTS.md', '.planning/ROADMAP.md']
autonomous: true
requirements: ['SYNC-01']
must_haves:
  truths:
    - "REQUIREMENTS.md reflects actual completion status of phases 1-3"
    - "ROADMAP.md shows phases 1-3 as completed with checkmarks"
    - "Traceability tables show correct status for completed requirements"
  artifacts:
    - path: ".planning/REQUIREMENTS.md"
      provides: "Updated requirement completion status"
      contains: "Complete status for CLI, CSV, FETCH, API, MD requirements"
    - path: ".planning/ROADMAP.md" 
      provides: "Updated roadmap progress tracking"
      contains: "Completed checkmarks for phases 1-3"
  key_links:
    - from: ".planning/STATE.md"
      to: ".planning/REQUIREMENTS.md"
      via: "completion status sync"
      pattern: "completed_phases: 3"
    - from: "phases/*/SUMMARY.md files"
      to: "ROADMAP.md progress table"
      via: "plan completion tracking"
      pattern: "Plans Complete.*Status.*Completed"
---

<objective>
Sync REQUIREMENTS.md and ROADMAP.md with current project state to accurately reflect the completion of phases 1-3.

Purpose: Ensure planning documents reflect actual progress - STATE.md shows 3 completed phases but REQUIREMENTS.md and ROADMAP.md still show everything as "Pending"
Output: Updated requirements and roadmap files with correct completion status
</objective>

<execution_context>
@$HOME/.config/Claude/get-shit-done/workflows/execute-plan.md
@$HOME/.config/Claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/REQUIREMENTS.md
@.planning/ROADMAP.md
</context>

<tasks>

<task type="auto">
  <name>task 1: Update REQUIREMENTS.md completion status</name>
  <files>.planning/REQUIREMENTS.md</files>
  <action>
    Update the traceability table (lines 77-95) to mark Phase 1-3 requirements as "Complete":
    - Phase 1 requirements (CLI-01, CLI-02, CLI-03, CSV-01, CSV-02, CSV-03): Change status from "Pending" to "Complete"
    - Phase 2 requirements (FETCH-01, FETCH-02, FETCH-03, API-01, API-02, API-03, API-04): Change status from "Pending" to "Complete" 
    - Phase 3 requirements (MD-01, MD-02, MD-03): Change status from "Pending" to "Complete"
    - Keep MD-04 as "Complete" (already marked)
    
    Also update the checkboxes in the main requirements sections (lines 12-37) to mark completed items with [x].
    
    Update the last updated timestamp at the bottom to today's date (Mar 19 2026).
  </action>
  <verify>grep -c "Complete" .planning/REQUIREMENTS.md shows 17 completed requirements</verify>
  <done>REQUIREMENTS.md shows all Phase 1-3 requirements as completed with correct checkboxes</done>
</task>

<task type="auto">
  <name>task 2: Update ROADMAP.md progress tracking</name>
  <files>.planning/ROADMAP.md</files>
  <action>
    Update the roadmap to reflect completed phases:
    1. Phase list (lines 12-15): Mark phases 1-3 as completed with [x] checkboxes
    2. Individual phase plans (lines 37-38, 60-61, 81-82): Already marked as completed, verify they remain correct
    3. Progress table (lines 108-113): Update to show actual completion:
       - Phase 1: Change from "0/4" to "2/2" plans complete, status "Complete", add completion date
       - Phase 2: Change from "0/6" to "2/2" plans complete, status "Complete", add completion date  
       - Phase 3: Change from "0/4" to "2/2" plans complete, status "Complete", add completion date
       - Phase 4: Keep as "0/X" Not started
    4. Traceability table (lines 119-137): Mark Phase 1-3 requirements as "Complete"
    5. Update last updated timestamp (line 159) to today's date
  </action>
  <verify>grep -c "Complete" .planning/ROADMAP.md shows phases 1-3 marked as complete</verify>
  <done>ROADMAP.md accurately reflects 3 completed phases with updated progress tracking</done>
</task>

<task type="auto">
  <name>task 3: Verify sync consistency</name>
  <files>N/A</files>
  <action>
    Run verification checks to ensure documents are properly synchronized:
    1. Confirm STATE.md completed_phases (3) matches marked phases in ROADMAP.md
    2. Confirm all Phase 1-3 requirements marked "Complete" in both REQUIREMENTS.md and ROADMAP.md 
    3. Confirm completion dates are consistent and realistic (phases completed before today)
    4. Verify requirement counts match between documents (17 total v1 requirements)
  </action>
  <verify>
    <automated>grep -E "(Complete|completed)" .planning/REQUIREMENTS.md .planning/ROADMAP.md | wc -l</automated>
  </verify>
  <done>All planning documents show consistent completion status for phases 1-3</done>
</task>

</tasks>

<verification>
- REQUIREMENTS.md shows 17 requirements with proper completion status
- ROADMAP.md shows phases 1-3 marked as completed with checkboxes
- Progress table accurately reflects 2/2 plans completed for each finished phase
- Traceability between documents is consistent
</verification>

<success_criteria>
- All Phase 1-3 requirements marked as "Complete" in both REQUIREMENTS.md and ROADMAP.md
- ROADMAP.md phase list shows [x] checkboxes for completed phases 1-3
- Progress tracking table shows accurate plan completion counts
- Timestamps updated to reflect current sync date
- Document consistency verified between STATE.md, REQUIREMENTS.md, and ROADMAP.md
</success_criteria>

<output>
After completion, create `.planning/quick/1-sync-requirements-md-and-project-md-with/1-SUMMARY.md`
</output>