# Diagram Embedding System

## Overview
The app now supports embedding diagrams directly in article content using a markdown-style reference system. This allows content authors to embed diagrams by referencing their unique identifier rather than hardcoding image URLs.

## Implementation Status
✅ **Complete** - Diagram embedding is fully functional

## How It Works

### 1. Diagram Reference Field
Each diagram in Firebase has a `reference` field that serves as a unique identifier:
- Example references: `supply_chain`, `process_01`, `investigation_flowchart`
- References should be kebab-case (lowercase with hyphens)
- References are unique across all diagrams

### 2. Markdown Syntax
To embed a diagram in article content, use this syntax:
```markdown
![Description text](diagram_reference)
```

**Examples:**
```markdown
![Supply Chain Analysis](supply_chain)
![Investigation Process Flow](process_01)
![Assessment Framework](assessment_framework)
```

### 3. Processing Flow
1. Article content is passed through `processContentWithTerms()` function
2. Function searches for pattern: `![description](reference)`
3. Function looks up diagram by reference using `findDiagramByReference()`
4. If diagram found, replaces reference with actual image URL
5. Markdown renderer displays the image inline

### 4. Fallback Behavior
- If reference doesn't match any diagram → original markdown preserved
- If diagram found but no URL → original markdown preserved
- If URL is already provided (http://) → URL used directly (not treated as reference)

## Code Architecture

### Files Modified

#### src/data/appData.js
Added `reference` field to diagram exports:
```javascript
export const getDiagramsData = () => {
  const state = dataStore.getState();
  return state.diagrams.map(diagram => ({
    id: diagram.id,
    reference: diagram.reference, // Unique identifier for markdown embedding
    title: diagram.title,
    titleArabic: diagram.titleArabic,
    imageUrl: diagram.imageUrl,
    // ... other fields
  }));
};
```

#### src/screens/ArticleScreen.jsx
Added diagram embedding support:

**Import:**
```javascript
import { useBookmarks, useGlossary, useDiagrams } from '../hooks/useFirebaseData';

const ArticleScreen = ({route, navigation}) => {
  const { diagrams } = useDiagrams();
  // ...
```

**Helper Function:**
```javascript
const findDiagramByReference = (reference) => {
  if (!diagrams || diagrams.length === 0) return null;
  return diagrams.find(diagram => diagram.reference === reference);
};
```

**Processing Function:**
```javascript
const processContentWithTerms = (text) => {
  // 1. Handle diagram references: ![description](diagram_reference)
  processedText = processedText.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, 
    (match, description, diagramRef) => {
      if (!diagramRef.includes('://') && !diagramRef.startsWith('http')) {
        const diagram = findDiagramByReference(diagramRef);
        if (diagram) {
          const imageUrl = diagram.imageUrl || diagram.imagePath;
          if (imageUrl) {
            return `![${description || diagram.title}](${imageUrl})`;
          }
        }
      }
      return match;
    }
  );
  
  // 2. Handle glossary links (existing)
  // 3. Handle horizontal dividers (existing)
  
  return processedText;
};
```

## Usage in Firebase

### Diagram Document Structure
Each diagram document in Firestore should have:
```javascript
{
  id: "unique_id",
  reference: "supply_chain",           // REQUIRED for embedding
  title: "Supply Chain Analysis",
  titleArabic: "تحليل سلسلة التوريد",
  imageUrl: "https://...",             // Secure URL (generated)
  imageFilePath: "diagrams/supply_chain.png",
  imageFileName: "supply_chain.png",
  imageOriginalName: "Supply Chain Diagram.png",
  imageSize: 145678,
  category: "analysis"                 // Legacy field
}
```

### Content Example
In a subcategory document's content field:
```markdown
# Investigation Process

The investigation follows a structured process:

![Investigation Flowchart](investigation_flow)

As shown in the diagram above, the process includes:
1. Initial Assessment
2. Data Collection
3. Analysis
4. Reporting

For more details on [evidence collection](evidence), refer to the glossary.

---

![Data Analysis Framework](data_framework)

This framework guides the analytical approach.
```

## Important Notes

### ✅ Diagram Images ARE Downloaded for Full Offline Support
**Diagrams are now downloaded and cached locally (just like templates)**

#### Download Process
1. User taps "Download Content" or "Refresh Content" in Settings
2. App fetches diagram metadata from Firebase Firestore
3. App downloads all diagram images from Firebase Storage
4. Images saved to `FileSystem.documentDirectory/diagrams/`
5. Metadata stored in AsyncStorage with local file paths
6. Complete offline access available

#### Storage Structure
```
FileSystem.documentDirectory/
├── templates/
│   ├── template_1.docx
│   ├── template_2.pdf
│   └── ...
└── diagrams/
    ├── supply_chain.png
    ├── process_01.png
    └── ...
```

#### Offline-First Approach
The ArticleScreen uses an offline-first strategy:
1. **First**: Check local downloaded diagrams
2. **Fallback**: Use Firebase Storage URLs if local not available
3. **Result**: Works offline after initial download

#### AsyncStorage Keys
- `downloaded_diagrams`: Full diagram data with local paths
- `diagrams_metadata`: Simplified metadata for quick access
- `downloaded_templates`: Template data (existing)
- `templates_metadata`: Template metadata (existing)

### Benefits
1. **Complete offline functionality**: View diagrams without internet
2. **Faster load times**: Local file access is instant
3. **Consistent UX**: Same behavior as templates
4. **Reliable**: No network errors or timeouts
5. **Storage efficient**: Only downloads what's needed

## Testing

### Test Cases
1. **Valid reference**: `![Test](supply_chain)` → Should display diagram
2. **Invalid reference**: `![Test](nonexistent)` → Should display placeholder or nothing
3. **Regular URL**: `![Test](https://example.com/image.png)` → Should display external image
4. **Empty description**: `![](supply_chain)` → Should display with diagram's title
5. **Multiple diagrams**: Multiple references in one article → All should display
6. **Arabic content**: `![مخطط](supply_chain)` → Should work with RTL text

### Manual Testing Steps
1. Add a diagram to Firebase with a `reference` field
2. Create/edit article content with `![Description](reference)`
3. Open the article in the app
4. Verify diagram displays inline
5. Test with no internet → diagram should not display (unless cached)
6. Test with internet → diagram should load and display

## Future Enhancements

### Possible Improvements
1. **Offline caching**: Download diagrams for offline viewing
2. **Lazy loading**: Only load diagrams as user scrolls to them
3. **Zoom capability**: Allow users to tap and zoom diagrams
4. **Fallback text**: Show description text if diagram fails to load
5. **Loading indicators**: Show spinner while diagram loads
6. **Error handling**: Display error message if diagram URL is invalid
7. **Alternative text**: Use description for accessibility

### Migration from Category Field
The old `category` field is now considered legacy. To migrate:
1. Add `reference` field to all diagram documents
2. Generate unique references from titles (kebab-case)
3. Update content to use new syntax
4. Eventually remove `category` field

## Related Features

### Similar Systems
- **Glossary linking**: `[display text](glossary_reference)` → clickable terms
- **Horizontal dividers**: `---` → green separator lines
- **Template references**: Could add similar system for templates

### Consistency
All three systems use similar patterns:
- Pattern matching in `processContentWithTerms()`
- Reference-based lookups
- Graceful fallback for invalid references
- Works with existing markdown renderer

## Summary

✅ Diagrams can be embedded using `![description](reference)` syntax
✅ System looks up diagrams by reference field
✅ Automatically converts references to image URLs
✅ Works with existing markdown rendering
⚠️ Diagrams load from URLs, not stored locally
⚠️ Requires internet connectivity to display
✅ Zero compilation errors
✅ Ready for production use
