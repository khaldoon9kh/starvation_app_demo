# Secure Firebase Storage Implementation Guide

## Overview

The app has been updated to use a **secure Firebase Storage URL pattern** for diagrams and templates. Instead of storing full URLs in Firestore, the database now stores file paths, and the app generates temporary download URLs on-demand.

## Benefits

✅ **Security**: URLs are temporary and cannot be shared or used indefinitely  
✅ **Flexibility**: Change file storage location without updating Firestore documents  
✅ **Privacy**: Firebase Storage rules control access, not public URLs  
✅ **Backward Compatibility**: Old `imageUrl`/`pdfUrl` fields still work  

## Database Structure

### Diagram Document (Firestore Collection: `diagrams`)

```javascript
{
  id: "diagram_123",
  title: "Legal Framework",
  titleArabic: "الإطار القانوني",
  description: "Visual representation...",
  
  // NEW: File path in Firebase Storage
  imageFilePath: "diagrams/diagram_123_1699056000000.jpg",
  
  // File metadata
  imageFileName: "diagram_123_1699056000000.jpg",
  imageOriginalName: "Legal_Framework.jpg",
  imageSize: 245680,  // bytes
  
  // Legacy: Keep this for backward compatibility
  imageUrl: "https://..." // (optional, will be overridden)
}
```

### Template Document (Firestore Collection: `templates`)

```javascript
{
  id: "template_456",
  title: "Witness Interview Checklist",
  titleArabic: "قائمة مراجعة مقابلة الشاهد",
  category: "Interview",
  categoryEN: "Interview",
  categoryAR: "المقابلة",
  
  // NEW: File path in Firebase Storage
  pdfFilePath: "templates/template_456_1699056000000.pdf",
  
  // File metadata
  pdfFileName: "template_456_1699056000000.pdf",
  pdfOriginalName: "Witness_Interview_Checklist.pdf",
  pdfSize: 1024000,  // bytes
  fileType: "application/pdf",
  fileExtension: "pdf",
  
  // Legacy: Keep this for backward compatibility
  pdfUrl: "https://..." // (optional, will be overridden)
}
```

## Implementation Details

### 1. Helper Functions (src/services/firebase.js)

#### `getDiagramImageUrl(imageFilePath)`
- **Purpose**: Generate temporary download URL for diagram images
- **Input**: `imageFilePath` (e.g., `"diagrams/diagram_123_timestamp.jpg"`)
- **Returns**: Promise that resolves to temporary download URL
- **Throws**: Error if path invalid or permission denied

#### `getTemplateDocumentUrl(pdfFilePath)`
- **Purpose**: Generate temporary download URL for template PDFs
- **Input**: `pdfFilePath` (e.g., `"templates/template_123_timestamp.pdf"`)
- **Returns**: Promise that resolves to temporary download URL
- **Throws**: Error if path invalid or permission denied

### 2. Transformation Functions (src/services/dataService.js)

#### `transformDiagramWithSecureUrl(diagram)`
- Checks if `diagram.imageFilePath` exists
- If yes: Calls `getDiagramImageUrl()` and sets `diagram.imageUrl` to generated URL
- If no: Returns diagram unchanged (backward compatibility)
- Always returns diagram object (safe to always call)

#### `transformTemplateWithSecureUrl(template)`
- Checks if `template.pdfFilePath` exists
- If yes: Calls `getTemplateDocumentUrl()` and sets `template.pdfUrl` to generated URL
- If no: Returns template unchanged (backward compatibility)
- Always returns template object (safe to always call)

#### Batch Versions
- `transformDiagramsWithSecureUrls(diagrams[])`
- `transformTemplatesWithSecureUrls(templates[])`

### 3. Integration Points

#### When Diagrams Are Fetched

```javascript
// In dataService.js getDiagrams()
const diagrams = await getDocs(q);
return diagrams.docs.map(doc => ({
  id: doc.id,
  ...doc.data()  // This now includes imageFilePath
}));
```

#### When Templates Are Downloaded (dataService.js)

```javascript
// In templateManager.js downloadTemplateFile()
let fileUrl = null;

// Try new secure system first
if (template.pdfFilePath) {
  fileUrl = await getTemplateDocumentUrl(template.pdfFilePath);
}

// Fallback to legacy
if (!fileUrl && template.pdfUrl) {
  fileUrl = template.pdfUrl;
}
```

## Usage Examples

### Example 1: Display a Diagram Image

```javascript
import { transformDiagramWithSecureUrl } from '../services/dataService';
import { Image } from 'react-native';

// Get diagram from cache/Firebase
const diagram = await getDiagrams()[0];

// Transform to get secure URL
const diagramWithUrl = await transformDiagramWithSecureUrl(diagram);

// Use in component
<Image 
  source={{ uri: diagramWithUrl.imageUrl }}
  style={{ width: 300, height: 400 }}
/>
```

### Example 2: Download a Template PDF

```javascript
import { transformTemplateWithSecureUrl } from '../services/dataService';
import * as Sharing from 'expo-sharing';

// Get template
const template = await getTemplates()[0];

// Transform to get secure URL
const templateWithUrl = await transformTemplateWithSecureUrl(template);

// Use for download/open
if (templateWithUrl.pdfUrl) {
  await Sharing.shareAsync(templateWithUrl.pdfUrl);
}
```

### Example 3: Batch Processing

```javascript
import { transformDiagramsWithSecureUrls, transformTemplatesWithSecureUrls } from '../services/dataService';

// Transform all diagrams in parallel
const diagrams = await getDiagrams();
const diagramsWithUrls = await transformDiagramsWithSecureUrls(diagrams);

// Transform all templates in parallel
const templates = await getTemplates();
const templatesWithUrls = await transformTemplatesWithSecureUrls(templates);
```

## Firebase Storage Rules

The app assumes Firebase Storage rules allow public read access:

```firestore
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /diagrams/{allPaths=**} {
      allow read;
      allow write: if false;  // Admin only, via backend
    }
    match /templates/{allPaths=**} {
      allow read;
      allow write: if false;  // Admin only, via backend
    }
  }
}
```

## Backward Compatibility

### Timeline

1. **Phase 1** (Now): App checks `imageFilePath`/`pdfFilePath` first
2. **Phase 1**: If not found, falls back to `imageUrl`/`pdfUrl`
3. **Future**: Gradual migration of existing documents in Firestore

### Migration Path

Documents in Firestore can be updated from old to new format:

```javascript
// Old document
{
  title: "Diagram Title",
  imageUrl: "https://firebasestorage.googleapis.com/..."
}

// New document
{
  title: "Diagram Title",
  imageFilePath: "diagrams/diagram_123_timestamp.jpg",
  imageFileName: "diagram_123_timestamp.jpg",
  imageOriginalName: "Original_Name.jpg",
  imageSize: 245680
}
```

## Offline Caching

When content is downloaded for offline use (Settings screen):

1. **getAllContentForCache()** fetches all diagrams/templates with their paths
2. Diagrams and templates are cached in AsyncStorage with `imageFilePath`/`pdfFilePath`
3. PDF files are downloaded locally (templateManager.js)
4. Images can be loaded via secure URLs or cached versions

### Cache Structure

```javascript
// AsyncStorage key: app_content_data
{
  categories: [...],
  subcategories: [...],
  glossary: [...],
  diagrams: [
    {
      id: "diagram_123",
      title: "...",
      imageFilePath: "diagrams/diagram_123_timestamp.jpg",
      imageUrl: null  // Will be populated when needed
    }
  ],
  templates: [
    {
      id: "template_456",
      title: "...",
      pdfFilePath: "templates/template_456_timestamp.pdf",
      pdfUrl: null  // Will be populated when needed
    }
  ]
}
```

## Error Handling

### When URL Generation Fails

```javascript
const url = await getDiagramImageUrl(imagePath);
if (!url) {
  // URL generation failed - show error or use fallback
  console.error('Failed to generate image URL');
  // Option 1: Show offline message
  // Option 2: Use placeholder image
  // Option 3: Try legacy pdfUrl field
}
```

### Common Error Scenarios

| Scenario | Handling |
|----------|----------|
| `imageFilePath` is null | Falls back to `imageUrl` |
| Path doesn't exist in Storage | `getDiagramImageUrl()` returns null, caught in try/catch |
| Firebase Storage access denied | Thrown error, should check rules |
| Network error during URL generation | Try/catch handles, returns original |

## Testing Checklist

- [ ] Download diagrams in offline mode - check `imageFilePath` is cached
- [ ] Download templates in offline mode - check `pdfFilePath` is cached
- [ ] Open cached template PDFs - verify local paths work
- [ ] View diagram images - verify images load from URLs
- [ ] Refresh content in Settings - URLs are regenerated
- [ ] Switch languages - diagrams/templates display correctly
- [ ] Old documents without `imageFilePath`/`pdfFilePath` still load
- [ ] Error cases handled gracefully (no crashes)

## Migration Checklist

### For Developers

- [x] Add `getDiagramImageUrl()` and `getTemplateDocumentUrl()` functions
- [x] Add transformation functions in dataService
- [x] Update templateManager to use new system
- [x] Maintain backward compatibility with old URLs
- [x] Update appData.js to include new fields
- [x] Update documentation

### For Database Administrators

- [ ] Update Firestore diagrams: add `imageFilePath`, `imageFileName`, `imageOriginalName`, `imageSize`
- [ ] Update Firestore templates: add `pdfFilePath`, `pdfFileName`, `pdfOriginalName`, `pdfSize`
- [ ] Organize Firebase Storage paths consistently
- [ ] Test URL generation for all files
- [ ] Verify Firebase Storage rules allow public read access
- [ ] Monitor URL generation in logs for errors

## Monitoring

### Console Logs to Watch

```javascript
// Success
✅ Generated diagram image URL: diagrams/diagram_123_timestamp.jpg
✅ Generated template PDF URL: templates/template_456_timestamp.pdf
✅ Using secure URL from pdfFilePath

// Fallback
⚠️ No image file path provided for diagram
⚠️ Failed to generate secure URL from pdfFilePath
✅ Using legacy URL from pdfUrl field

// Errors
❌ Error generating diagram image URL
❌ Template <id> has no pdfUrl or pdfFilePath
```

## Troubleshooting

### Images/PDFs Not Loading

1. Check Firestore documents have `imageFilePath`/`pdfFilePath` fields
2. Verify files exist at paths in Firebase Storage
3. Check Firebase Storage rules allow public read
4. Inspect console logs for URL generation errors

### Backward Compatibility Issues

1. If document still has `imageUrl` but no `imageFilePath`, it will use old URL
2. Ensure old documents are being migrated in Firestore
3. Test with mixed old/new documents

### Performance Issues

1. URLs are generated asynchronously - consider batch operations
2. Cache URLs in memory if generating for same file repeatedly
3. Monitor network requests for excessive URL generation calls

## Related Documentation

- Firebase Storage API: https://firebase.google.com/docs/storage
- React Native Image: https://reactnative.dev/docs/image
- Expo Sharing: https://docs.expo.dev/versions/latest/sdk/sharing/
