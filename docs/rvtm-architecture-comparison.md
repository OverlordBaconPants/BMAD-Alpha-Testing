# RVTM Architecture Comparison

## Quick Decision Guide

| Aspect | JavaScript Approach | MD/YAML Approach |
|--------|-------------------|------------------|
| **Philosophy** | ❌ External scripts | ✅ BMAD-native |
| **Dependencies** | ❌ Node.js, npm packages | ✅ None |
| **Transparency** | ⚠️ Need to read JS code | ✅ Plain English instructions |
| **Customization** | ⚠️ Fork JS code | ✅ Override MD file |
| **Debugging** | ⚠️ JavaScript debugging | ✅ Read/edit markdown |
| **Learning Curve** | ❌ Need JS knowledge | ✅ Read markdown |
| **Performance** | ✅ Fast (native JS) | ⚠️ LLM execution |
| **Maintainability** | ⚠️ Code complexity | ✅ Simple instructions |
| **Portability** | ❌ Node.js required | ✅ Any LLM |
| **Version Control** | ⚠️ Code diffs | ✅ YAML diffs |

## Current State (JavaScript)

### What You Have Now:

```
bmad/core/lib/rvtm/
├── rvtm-manager.js (585 lines)
└── rvtm-hooks/
    ├── base-hook.js (80 lines)
    ├── extract-requirements.js (250 lines)
    ├── link-story-requirements.js (220 lines)
    ├── register-tests.js (280 lines)
    └── update-story-status.js (270 lines)

Total: ~1,685 lines of JavaScript
```

### Workflow Integration:
```markdown
<action>node bmad/core/lib/rvtm/rvtm-hooks/extract-requirements.js --prd-file=...</action>
```

### Data Storage:
```json
// .rvtm/matrix.json
{
  "requirements": {
    "REQ-001": { "id": "REQ-001", ... }
  }
}
```

### Pros:
✅ **Already working** - Fully implemented
✅ **Fast execution** - Native JavaScript
✅ **Proven** - Tested and documented
✅ **Complete** - All features implemented

### Cons:
❌ **Not BMAD-native** - Requires external script execution
❌ **Node.js dependency** - Needs runtime installed
❌ **Black box** - Can't see what happens without reading code
❌ **Harder to customize** - Need to modify JavaScript
❌ **JSON storage** - Less human-readable than YAML

---

## Proposed State (MD/YAML)

### What You Would Have:

```
bmad/core/tasks/rvtm/
├── extract-requirements.md (~200 lines of instructions)
├── link-story-requirements.md (~180 lines)
├── register-tests.md (~200 lines)
└── update-story-status.md (~150 lines)

Total: ~730 lines of markdown instructions
```

### Workflow Integration:
```xml
<invoke-task path="bmad/core/tasks/rvtm/extract-requirements.md">
  <param name="prd_file">{{default_output_file}}</param>
</invoke-task>
```

### Data Storage:
```yaml
# .rvtm/matrix.yaml
requirements:
  REQ-001:
    id: REQ-001
    text: "User authentication required"
    type: functional
```

### Pros:
✅ **BMAD-native** - Pure MD/YAML, no external scripts
✅ **No dependencies** - LLM executes directly
✅ **Transparent** - Read instructions in plain English
✅ **Easy to customize** - Edit markdown file
✅ **YAML storage** - Human-readable diffs
✅ **Portable** - Works with any LLM

### Cons:
⚠️ **Needs implementation** - Requires building MD tasks
⚠️ **LLM execution** - Potentially slower than native JS
⚠️ **New pattern** - Less proven in production
⚠️ **LLM dependent** - Quality depends on LLM capabilities

---

## Hybrid Approach (Recommended)

Start with what you have, transition gradually:

### Phase 1: Keep JavaScript Working ✅
**Status:** Already done!
- Current JS hooks continue to work
- All workflows use JS hooks
- Fully functional RVTM

### Phase 2: Add MD Tasks (Parallel Support) 🔄
**Effort:** 2-3 weeks
- Create MD task files
- Update workflows to check for MD tasks first
- Fall back to JS hooks if MD not found
- Users can opt-in to MD approach

```markdown
<step n="13" goal="Extract requirements">
  <check>If MD task exists → Use MD task</check>
  <check>Else → Use JS hook (legacy)</check>
</step>
```

### Phase 3: Full MD/YAML (Optional) 🎯
**Effort:** 1 week
- Remove JavaScript hooks
- Keep only MD tasks
- Migrate data to YAML
- Full BMAD-native

---

## Real-World Comparison

### Scenario: User wants custom requirement format

**JavaScript Approach:**
1. User must fork `extract-requirements.js`
2. Modify JavaScript regex patterns
3. Test JavaScript code
4. Maintain custom version

```javascript
// Custom JS hook
parseRequirements(content) {
  // Need to modify this JavaScript code
  const reqPattern = /MY-CUSTOM-\d+:?\s*(.+)/gm;
  // ... more JS code
}
```

**MD/YAML Approach:**
1. User copies MD task to project config
2. Edits markdown instructions
3. Adds custom pattern
4. Works immediately

```markdown
<!-- Custom MD task in project -->
<step n="3.5" goal="Extract company requirements">
  <pattern>MY-CUSTOM-\d+:?\s*(.+)</pattern>
  <action>Search for MY-CUSTOM-XXX format</action>
</step>
```

**Winner:** MD/YAML (much simpler for users)

---

## Performance Comparison

### JavaScript Hook:
```
Extract requirements: ~50-100ms
Parse + update JSON: ~20-50ms
Total: ~70-150ms
```

### MD/YAML Task (estimated):
```
LLM reads MD task: ~100-200ms
LLM executes instructions: ~500-1000ms
Parse + update YAML: ~50-100ms
Total: ~650-1300ms
```

**Winner:** JavaScript (5-10x faster)

**But:** For RVTM operations that run once per PRD/Story, the extra ~1 second is negligible compared to the benefits of transparency and customization.

---

## Storage Comparison

### JSON (Current):
```json
{
  "requirements": {
    "REQ-001": {
      "id": "REQ-001",
      "text": "Users must be able to register",
      "type": "functional",
      "created_date": "2025-09-30T10:00:00Z"
    }
  }
}
```

**Pros:** Compact, fast to parse
**Cons:** No comments, harder to diff, no native dates

### YAML (Proposed):
```yaml
requirements:
  REQ-001:
    id: REQ-001
    text: "Users must be able to register"
    type: functional
    created_date: 2025-09-30T10:00:00Z
    # Added in Sprint 1 - Login Epic
    priority: high  # Changed from medium on 2025-10-01
```

**Pros:** Comments, better diffs, native dates, more readable
**Cons:** Slightly larger file size, indentation-sensitive

**Winner:** YAML (for human collaboration)

---

## Recommendation

### For Your Current Project:

**Option 1: Stay with JavaScript (Conservative)** ⭐ RECOMMENDED SHORT-TERM
- ✅ Already working
- ✅ Fully tested
- ✅ Good documentation
- ✅ Fast execution
- ⚠️ Not BMAD-native
- ⚠️ Harder for users to customize

**Best if:** You want to ship now and iterate later.

---

**Option 2: Transition to MD/YAML (Progressive)** ⭐ RECOMMENDED LONG-TERM
- ✅ BMAD-native philosophy
- ✅ Easier for users
- ✅ More transparent
- ✅ Better customization
- ⚠️ Needs implementation time
- ⚠️ Slightly slower

**Best if:** You have 2-3 weeks for transition and want long-term maintainability.

---

**Option 3: Hybrid Approach (Pragmatic)** ⭐⭐ RECOMMENDED
- ✅ Keep JS working now
- ✅ Add MD tasks gradually
- ✅ Users choose which to use
- ✅ Smooth transition path
- ⚠️ Maintain both temporarily

**Best if:** You want the best of both worlds during transition.

---

## My Recommendation: Hybrid Approach

### Timeline:

**Week 1:** Create MD tasks (proof of concept)
- Build extract-requirements.md
- Test with planning workflow
- Validate it works as expected

**Week 2:** Add parallel support
- Update workflows to check for MD task first
- Fall back to JS hook if not found
- Document both approaches

**Week 3:** Complete MD tasks
- Build remaining MD tasks
- Convert data to YAML option
- Create migration utility

**Week 4+:** Deprecate JS (optional)
- Mark JS hooks as deprecated
- Encourage MD/YAML usage
- Eventually remove JS

### Result:
- ✅ Users get BMAD-native approach
- ✅ Current JS keeps working during transition
- ✅ Smooth migration path
- ✅ Best of both worlds

---

## Questions to Consider

1. **How important is BMAD-native philosophy vs pragmatism?**
   - If philosophy is critical → Go MD/YAML
   - If "get it done" is priority → Stay JavaScript

2. **Do you expect users to customize RVTM patterns?**
   - If yes → MD/YAML is much easier
   - If no → JavaScript is fine

3. **How much time do you have?**
   - 2-3 weeks available → Transition to MD/YAML
   - Need to ship now → Stay JavaScript

4. **What's your maintenance bandwidth?**
   - Want simplicity → MD/YAML
   - Comfortable with code → JavaScript

5. **Is performance critical?**
   - Need <100ms → JavaScript
   - 1-2 seconds ok → MD/YAML

---

## My Personal Recommendation

**Start with hybrid approach:**

1. ✅ Keep current JavaScript working (it's great!)
2. ✅ Build MD/YAML version in parallel
3. ✅ Let users choose which to use
4. ✅ Gradually shift to MD/YAML as default
5. ✅ Deprecate JS after 6-12 months

**Why?**
- Respects work already done
- Gives users choice
- Smooth transition
- No breaking changes
- Aligns with BMAD philosophy long-term

**The MD/YAML approach is the "right" way for BMAD, but the JavaScript approach is working and valuable right now. No need to throw it away - just evolve toward the goal!** 🎯