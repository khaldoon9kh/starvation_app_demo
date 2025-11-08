# Enhanced Content Processing System

## Overview
The app now features an enhanced content processing system with two key improvements:
1. **Flexible Glossary Linking** - More natural way to reference glossary terms
2. **Green Horizontal Dividers** - Visual content separators

## 1. Enhanced Glossary Linking

### New Format: `[display text](glossary_reference)`

### Syntax
```markdown
[display text](glossary_reference)
```

### Examples
- `[International Human Rights Law](IHRL)` - Shows "International Human Rights Law" but links to "IHRL" glossary term
- `[malnutrition](malnutrition-1)` - Shows "malnutrition" but links to "malnutrition-1" glossary term
- `[investigation procedures](Investigation)` - Shows "investigation procedures" but links to "Investigation" glossary term

### Benefits
1. **Flexible Display Text**: Use any text while linking to the correct glossary term
2. **Better UX**: More natural reading flow with contextual text
3. **Consistent References**: Multiple terms can reference the same glossary entry
4. **Backwards Compatible**: Regular markdown links still work normally

## Implementation Details

### Content Processing
The `processContentWithTerms()` function in `ArticleScreen.jsx`:
1. Scans for the pattern `[display text](glossary_reference)`
2. Checks if the reference exists in the glossary
3. Converts valid references to internal `glossary://term/` protocol
4. Preserves regular HTTP/HTTPS links unchanged

### Link Handling
The `onLinkPress` handler:
1. Intercepts `glossary://term/` protocol links
2. Opens the glossary modal for the referenced term
3. Allows normal links to function as expected

### Glossary Reference Validation
- References are validated against the glossary database
- Non-existent references are left as plain text
- Regular URLs (http://, https://, mailto:) are preserved

## Migration from Old Format

### Old Format (Deprecated)
```markdown
{Term} - Direct term reference in curly braces
```

### New Format
```markdown
[Term](Term) - Same display and reference
[Custom Display Text](Term) - Custom display text with term reference
```

## Usage Guidelines

1. **Use descriptive display text** that fits naturally in the content flow
2. **Reference the exact glossary ID** in parentheses
3. **Keep references consistent** across the application
4. **Test references** to ensure they exist in the glossary database

## Example Content

```markdown
When conducting an [investigation](Investigation), it's important to identify cases of [malnutrition](malnutrition-1) early. 

Understanding [International Human Rights Law](IHRL) is crucial for [legal accountability](legal-accountability) in cases of mass starvation.
```

This produces natural-reading text with proper glossary linking functionality.

## 2. Green Horizontal Dividers

### Syntax
```markdown
---
```

### Usage
- Use `---` on its own line to create a visual separator
- Appears as a green horizontal line (matching app theme)
- Automatically includes proper spacing above and below
- Works in both LTR and RTL languages

### Example
```markdown
Some content here...

---

New section after the divider

---

Another section
```

### Visual Result
- **Height:** 2px green line
- **Color:** #4CAF50 (app's primary green)
- **Margins:** 16px top and bottom
- **Style:** Slightly rounded corners

This creates clear visual separation between content sections, perfect for separating key information, sources, or different topics within an article.