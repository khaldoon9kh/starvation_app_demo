# Glossary Reference System Update

## Overview
The glossary system has been updated to use a reference-based lookup system. The Category field has been completely removed from the glossary database, and now the app uses the Reference field (English only) as the unique identifier for glossary terms.

## Database Field Structure

**Current Structure (with Reference):**
- `id`: Document ID (e.g., "ICC")
- `reference`: Unique English identifier (e.g., "ICC") - used for content linking
- `term`: English term name for display (e.g., "Rome Statute (ICC Statute)")
- `termArabic`: Arabic term name for display (e.g., "نظام روما الأساسي")
- `definition`: English definition text
- `definitionArabic`: Arabic definition text
- `order`: Sort order in the glossary
- `category`: (Removed - no longer used)

## Content Linking Format
References are used in content with the markdown format:
```markdown
[display text](reference)
```

**Examples:**
- `[International Human Rights Law](IHRL)` - Links to glossary term with reference "IHRL"
- `[malnutrition](malnutrition-1)` - Links to glossary term with reference "malnutrition-1"
- `[Rome Statute](ICC)` - Links to glossary term with reference "ICC"

## How It Works

### 1. Glossary Lookup (`findGlossaryTerm()`)
When content contains a glossary reference like `[display](ICC)`, the app:
1. Extracts the reference: `"ICC"`
2. Searches glossary terms by comparing the `reference` field (case-insensitive)
3. Returns the matching glossary term with its `term`, `termArabic`, `definition`, and `definitionArabic`
4. Falls back to searching by `id` field if reference not found

### 2. Modal Display
When a glossary link is clicked:
- **Title**: Displays `term` (English) or `termArabic` (Arabic)
- **Definition**: Shows `definition` or `definitionArabic` based on language

### 3. Search Indexing
The search system indexes glossary terms by:
1. **Reference field** (highest priority) - For direct reference matching
2. **Term fields** (term/termArabic) - For natural language searching
3. **Definition fields** - For content-based search

## Files Updated

- ✅ `src/screens/HomeScreen.jsx` - Uses `term`/`termArabic` for modal titles
- ✅ `src/screens/AboutScreen.jsx` - Uses `term`/`termArabic` for modal titles
- ✅ `src/screens/ArticleScreen.jsx` - Uses `term`/`termArabic` for modal titles
- ✅ `src/hooks/useFirebaseData.js` - Fallback data with `reference`, `term`, `termArabic`
- ✅ `src/services/dataService.js` - Search and fallback glossary updated
- ✅ `src/services/dataStore.js` - Search indexing updated
- ✅ `src/data/appData.js` - Fallback glossary and getter functions updated

## Glossary Term Structure Example

```javascript
{
  id: "ICC",
  reference: "ICC",
  term: "Rome Statute (ICC Statute)",
  termArabic: "نظام روما الأساسي (نظام المحكمة الجنائية الدولية الأساسي)",
  definition: "The Rome Statute of the International Criminal Court is the treaty...",
  definitionArabic: "نظام روما الأساسي للمحكمة الجنائية الدولية هو المعاهدة...",
  order: 1
}
```

## Usage in Content

In HomeScreen, AboutScreen, or ArticleScreen content:

```markdown
When violations of [international law](IHRL) occur, the [International Criminal Court](ICC) 
may intervene to investigate cases of [mass starvation](starvation).

This references glossary terms with:
- reference: "IHRL"
- reference: "ICC"  
- reference: "starvation"
```

## Backward Compatibility

The `findGlossaryTerm()` function attempts lookup in this order:
1. By `reference` field (case-insensitive)
2. By `id` field (case-insensitive) - Fallback

This ensures flexibility and compatibility.

## Testing the Changes

1. **Create a glossary term in Firebase:**
   ```
   reference: "testRef"
   term: "Test Term"
   termArabic: "مصطلح الاختبار"
   definition: "This is a test definition"
   definitionArabic: "هذا تعريف اختباري"
   ```

2. **Use in content:**
   ```markdown
   This is a [test glossary link](testRef) in the content.
   ```

3. **Verify:**
   - Link appears in red and bold text
   - Clicking opens glossary modal with term name and definition
   - Modal displays correct language based on app language setting

## Migration Notes

If you have existing glossary terms:
- Ensure each term has a unique `reference` field (recommend using ID or short code)
- The `term` and `termArabic` fields should contain the display names
- Remove any `category` field from terms
- Keep `definition` and `definitionArabic` with the definition text
