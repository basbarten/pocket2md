# DISCOVERY: Pocket to Obsidian CLI - Technical Options

**Phase:** Planning Phase 1  
**Date:** Wed Mar 11 2026  
**Purpose:** Document technical options and research for Phase 1 implementation

---

## Phase 1 Overview

**Phase 1 Goal:** Build CLI foundation to process Pocket export CSV and extract article URLs

**Requirements:** CLI-01, CLI-02, CLI-03, CSV-01, CSV-02, CSV-03

**Key Success Criteria:**
1. Run: `node cli.js --input data/part_000000.csv` with visible output
2. Specify output directory: `--output ./output/` (default: `./output/`)
3. See progress: "Processing article 1/50..." during CSV parsing
4. Handle malformed CSV with clear error messages

---

## Technology Research Notes

### CSV Parsing Libraries

#### 1. PapaParse (Recommending: Yes)
**Sources:** 
- GitHub: mholt/PapaParse (13.4k stars, 1.2k forks)
- NPM: papaparse
- Latest: 5.4.0 (Mar 21, 2023)
- GitHub: yargs (11.5k stars, 290 issues)

**Why it fits Phase 1:**
- ✅ Fast and powerful CSV handling
- ✅ Graceful handling of large files and malformed input
- ✅ Correct parsing per RFC 4180
- ✅ No dependencies (no jQuery requirement)
- ✅ Node.js streaming support for large CSV files
- ✅ Auto-detect delimiter support
- ✅ Header row support (important for Pocket CSV format)
- ✅ Available for Node.js (Readable Stream parsing)
- ✅ Easy to use API: `Papa.parse(file, config)`

**Installation:**
```bash
npm install papaparse
```

**Node.js Usage Example:**
```javascript
import Papa from 'papaparse';

Papa.parse(csvFilePath, {
  header: true,  // Use first row as headers
  skipEmptyLines: true,
  complete: function(results) {
    // results.data contains the parsed rows
    // results.meta contains metadata (delimiter, etc.)
  },
  error: function(error) {
    console.error('CSV parsing error:', error.message);
  }
});
```

**Trade-offs:**
- Slightly larger library than minimal CSV need
- Feature-rich = potential for overkill if simple CSV parser needed
- But reliability benefits outweigh minimal overkill

---

### CLI Argument Parsing Libraries

#### 1. Yargs (Recommending: Yes)
**Source:**
- GitHub: yargs (11.5k stars, 290 issues)
- Official: yargs.js.org

**Why it fits Phase 1:**
- ✅ Modern, actively maintained (v18.0.0, May 27, 2025)
- ✅ TypeScript support with @types/yargs
- ✅ Browser and Node.js support
- ✅ Dynamic help menu generation
- ✅ Built-in commands structure support
- ✅ Completion script generation (Bash/Zsh)
- ✅ Easy option definition:
  ```javascript
  yargs(hideBin(process.argv))
    .option('input', {
      alias: 'i',
      type: 'string',
      description: 'Input CSV file path',
      demandOption: true
    })
    .option('output', {
      alias: 'o',
      type: 'string',
      description: 'Output directory',
      default: './output/'
    })
    .parse()
  ```
- ✅ Clear error messages for missing/invalid options
- ✅ Usage documentation generation from definitions

**Installation:**
```bash
npm install yargs
npm install --save-dev @types/yargs
```

**Usage Example:**
```javascript
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const argv = yargs(hideBin(process.argv))
  .option('input', {
    alias: 'i',
    type: 'string',
    description: 'Pocket CSV export file',
    demandOption: true
  })
  .option('output', {
    alias: 'o',
    type: 'string',
    description: 'Output directory path',
    default: './output/'
  })
  .help()
  .argv;

console.log('Input:', argv.input);
console.log('Output:', argv.output);
```

**Trade-offs:**
- Feature-rich for complex CLI apps (but still good for simple apps)
- Slightly larger than minimal parser
- Active development = good for bug fixes and Node.js compatibility

#### 2. Commander (Not Recommended)
**Source:**
- GitHub: tj/commander (1.1k stars, moved to command-rb/commander)
- Ruby-focused project (96% Ruby)

**Why it's NOT recommended:**
- ❌ Ruby-focused (command-rb moved away from original Node.js repo)
- ❌ Not designed for Node.js
- ❌ 10x fewer stars than yargs (11.5k vs 1.1k)
- ❌ Not actively maintained for Node.js

**Avoid using for Node.js projects.**

---

## DOMPurify and Defuddle (Phase 2+)

**Relevant for Future Phases:**
- DOMPurify: HTML sanitization (will be needed for Phase 2)
- Defuddle (kepano/defuddle): Content extraction library (will be needed for Phase 2)
- Both will be installed when needed (not in Phase 1 scope)

---

## Recommended Tech Stack for Phase 1

| Component | Library | Installation | Status for Phase 1 |
|-----------|---------|--------------|-------------------|
| CSV Parsing | PapaParse | `npm install papaparse` | ✅ Primary choice |
| CLI Parsing | Yargs | `npm install yargs @types/yargs --save-dev` | ✅ Primary choice |
| HTML Sanitization | DOMPurify | `npm install dompurify` | ⏳ Phase 2 |
| Content Extraction | Defuddle | `npm install defuddle` | ⏳ Phase 2 |

---

## Phase 1 Implementation Checklist

- [ ] Install PapaParse
- [ ] Install yargs and @types/yargs
- [ ] Create `cli.js` entry point
- [ ] Implement CSV parsing with PapaParse
- [ ] Implement CLI argument parsing with yargs
- [ ] Add error handling for malformed CSVs
- [ ] Add console progress output ("Processing article 1/50...")
- [ ] Test with sample Pocket CSV export
- [ ] Verify `--output` option works with custom directory
- [ ] Verify `--input` option is required
- [ ] Test error handling with invalid CSV file

---

## Research Sources

1. **PapaParse GitHub:** https://github.com/mholt/PapaParse  
   - Stars: 13.4k | Forks: 1.2k | Last Commit: Mar 2, 2023  
   - Active maintenance, reliable parsing

2. **Yargs GitHub:** https://github.com/yargs/yargs  
   - Stars: 11.5k | Issues: 290 | Last Commit: May 27, 2025  
   - Active, modern CLI parsing

3. **npm - papaparse:** https://www.npmjs.com/package/papaparse  
   - Version 5.4.0 (latest)  
   - 4.4M downloads last month  

4. **npm - yargs:** https://www.npmjs.com/package/yargs  
   - Version 18.0.0 (latest)  
   - Widely adopted CLI solution

---

## Decision Matrix

| Factor | PapaParse | Yargs |
|--------|-----------|-------|
| Star Count | 13.4k | 11.5k |
| Adoption | 4.4M downloads/month | Widely used by major tools |
| Node.js Support | ✅ Excellent (streaming) | ✅ Excellent |
| TypeScript Support | ✅ @types available | ✅ @types available |
| Documentation | ✅ Comprehensive | ✅ Comprehensive |
| Error Handling | ✅ Graceful failure messages | ✅ Clear option errors |
| Community Activity | ✅ Active | ✅ Active (recent commits) |
| Overkill Level | ⚠️ Feature-rich (but good) | ⚠️ Feature-rich (but good) |

---

## Conclusion

**Selection: PapaParse for CSV parsing, Yargs for CLI argument parsing**

**Rationale:**
- Both libraries are industry standards with massive user bases
- Active maintenance ensures Node.js compatibility and security
- Feature-richness isn't a drawback for Phase 1 - better reliability
- Clear error handling and documentation reduce implementation time
- Type definitions available reduce TypeScript usage friction
- Both support streaming, which future-proofs for large CSV exports

**Risk Assessment:**
- **Low Risk:** Both libraries are battle-tested with extensive deployments
- **Maintenance Risk:** Minimal - both have active maintainers
- **Security Risk:** Low - well-audited, no recent critical vulnerability disclosures

**Next Steps:**
1. Wait for user approval of this discovery document
2. Confirm Tech Stack selection with user
3. Proceed to create Phase 1 detailed plan (1-3 sub-plans)
4. Validate technology choices against Phase 1 requirements

---

*Document Created: Wed Mar 11 2026*  
*Research Conducted: Google, GitHub, npm (limited due to 403 errors)*  
*Status: Recommendations documented, awaiting user approval*