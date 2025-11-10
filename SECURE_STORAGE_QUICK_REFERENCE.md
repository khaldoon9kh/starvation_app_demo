# Secure Firebase Storage - Quick Reference

## 🎯 For App Developers

### Where to Generate Secure URLs

**Rule of Thumb**: Generate URLs **right before using** the file (lazy loading)

```javascript
// ✅ CORRECT: Generate URL when needed
const diagram = await getDiagrams()[0];
const diagramWithUrl = await transformDiagramWithSecureUrl(diagram);
displayImage(diagramWithUrl.imageUrl);

// ❌ WRONG: Don't store URLs permanently, they expire
const url = await getDiagramImageUrl(diagram.imageFilePath);
await AsyncStorage.setItem('imageUrl', url);  // URL will expire!
```

### Common Patterns

#### Pattern 1: Display Single Diagram

```javascript
import { transformDiagramWithSecureUrl } from '../services/dataService';
import { Image } from 'react-native';

const MyComponent = ({ diagramId }) => {
  const [diagram, setDiagram] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);

  useEffect(() => {
    const loadDiagram = async () => {
      const d = await getDiagram(diagramId);
      setDiagram(d);
      
      // Generate URL when needed
      const transformed = await transformDiagramWithSecureUrl(d);
      setImageUrl(transformed.imageUrl);
    };
    loadDiagram();
  }, []);

  return (
    <Image 
      source={{ uri: imageUrl }} 
      style={{ width: 300, height: 400 }}
    />
  );
};
```

#### Pattern 2: Display Multiple Templates

```javascript
import { transformTemplatesWithSecureUrls } from '../services/dataService';
import * as Sharing from 'expo-sharing';

const MyComponent = () => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const loadTemplates = async () => {
      const allTemplates = await getTemplates();
      
      // Batch transform all at once
      const withUrls = await transformTemplatesWithSecureUrls(allTemplates);
      setTemplates(withUrls);
    };
    loadTemplates();
  }, []);

  const handleDownload = async (template) => {
    await Sharing.shareAsync(template.pdfUrl);
  };

  return (
    <ScrollView>
      {templates.map(t => (
        <TouchableOpacity key={t.id} onPress={() => handleDownload(t)}>
          <Text>{t.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
};
```

#### Pattern 3: Offline Cache Handling

```javascript
import { transformDiagramWithSecureUrl } from '../services/dataService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const loadDiagramFromCache = async (diagramId) => {
  try {
    const cached = await AsyncStorage.getItem('app_content_data');
    const contentData = JSON.parse(cached);
    
    const diagram = contentData.diagrams.find(d => d.id === diagramId);
    if (!diagram) return null;
    
    // Transform to get URL (will generate or use fallback)
    const transformed = await transformDiagramWithSecureUrl(diagram);
    return transformed;
  } catch (error) {
    console.error('Error loading from cache:', error);
    return null;
  }
};
```

## 📋 Firestore Document Checklist

### For Diagrams
```javascript
// Required for new system
✓ imageFilePath: "diagrams/diagram_123_1699056000000.jpg"
✓ imageFileName: "diagram_123_1699056000000.jpg"
✓ imageOriginalName: "Legal_Framework.jpg"
✓ imageSize: 245680

// Optional (for fallback)
✓ imageUrl: "https://..."  // Keep during migration
```

### For Templates
```javascript
// Required for new system
✓ pdfFilePath: "templates/template_456_1699056000000.pdf"
✓ pdfFileName: "template_456_1699056000000.pdf"
✓ pdfOriginalName: "Witness_Checklist.pdf"
✓ pdfSize: 1024000
✓ fileType: "application/pdf"
✓ fileExtension: "pdf"

// Optional (for fallback)
✓ pdfUrl: "https://..."  // Keep during migration
```

## 🔍 Debugging

### Check if Diagram Has New Fields
```javascript
import dataStore from '../services/dataStore';

const state = dataStore.getState();
const diagram = state.diagrams[0];

console.log('Has imageFilePath:', !!diagram.imageFilePath);
console.log('Has imageUrl:', !!diagram.imageUrl);
console.log('Full keys:', Object.keys(diagram));
```

### Generate URL Manually
```javascript
import { getDiagramImageUrl } from '../services/firebase';

const url = await getDiagramImageUrl('diagrams/diagram_123_timestamp.jpg');
console.log('Generated URL:', url);
console.log('URL is valid:', url && url.includes('firebasestorage.googleapis.com'));
```

### Check Cache Contents
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

const cached = await AsyncStorage.getItem('app_content_data');
const data = JSON.parse(cached);

console.log('Cached diagrams:', data.diagrams.length);
console.log('Sample diagram:', {
  id: data.diagrams[0].id,
  title: data.diagrams[0].title,
  hasImageFilePath: !!data.diagrams[0].imageFilePath,
  hasImageUrl: !!data.diagrams[0].imageUrl
});
```

## 🚨 Error Cases

### Case 1: imageFilePath is null
```javascript
// App will automatically fall back to imageUrl
const diagram = { title: 'Test', imageFilePath: null, imageUrl: 'https://...' };
const transformed = await transformDiagramWithSecureUrl(diagram);
// Result: Uses imageUrl from Firestore
```

### Case 2: File doesn't exist in Storage
```javascript
// getDiagramImageUrl will return null
const url = await getDiagramImageUrl('diagrams/nonexistent.jpg');
console.log(url);  // null

// Transformation returns original
const transformed = await transformDiagramWithSecureUrl(diagram);
console.log(transformed.imageUrl);  // Falls back to old imageUrl
```

### Case 3: No Internet Connection
```javascript
// Both new and old URLs will fail
// Check internet before attempting to load
import NetInfo from '@react-native-community/netinfo';

const netInfo = await NetInfo.fetch();
if (!netInfo.isConnected) {
  console.log('Offline - use locally cached version');
}
```

## 📊 Performance Tips

### ✅ Good Practices
```javascript
// ✅ Batch transform all templates at once
const templates = await getTemplates();
const withUrls = await transformTemplatesWithSecureUrls(templates);  // Parallel

// ✅ Cache transformed results in component state
const [diagramsWithUrls, setDiagramsWithUrls] = useState([]);

// ✅ Use lazy loading for large lists
const onViewableItemsChanged = async ({ viewableItems }) => {
  for (const item of viewableItems) {
    const transformed = await transformDiagramWithSecureUrl(item);
    updateCachedUrl(item.id, transformed.imageUrl);
  }
};
```

### ❌ Bad Practices
```javascript
// ❌ Don't regenerate URLs in render function
render() {
  return (
    <Image source={{ uri: generateUrlSync(this.state.diagram) }} />
  );
}

// ❌ Don't store URLs in AsyncStorage expecting them to persist
const url = await getDiagramImageUrl(path);
await AsyncStorage.setItem('cached_url', url);  // URL will expire!

// ❌ Don't transform the same items repeatedly
templates.forEach(t => {
  await transformTemplateWithSecureUrl(t);  // Do this once!
});
```

## 🔗 API Reference

### Firebase Service Functions
```javascript
import { getDiagramImageUrl, getTemplateDocumentUrl } from '../services/firebase';

// Generate URL for diagram image
const imageUrl = await getDiagramImageUrl(imageFilePath);
// Returns: "https://firebasestorage.googleapis.com/..." or null

// Generate URL for template PDF
const pdfUrl = await getTemplateDocumentUrl(pdfFilePath);
// Returns: "https://firebasestorage.googleapis.com/..." or null
```

### DataService Transform Functions
```javascript
import { 
  transformDiagramWithSecureUrl,
  transformTemplateWithSecureUrl,
  transformDiagramsWithSecureUrls,
  transformTemplatesWithSecureUrls
} from '../services/dataService';

// Transform single diagram
const diagram = await transformDiagramWithSecureUrl(diagramData);
// Result: { ...diagramData, imageUrl: "https://...", imagePath: "diagrams/..." }

// Transform single template
const template = await transformTemplateWithSecureUrl(templateData);
// Result: { ...templateData, pdfUrl: "https://...", pdfPath: "templates/..." }

// Transform multiple (parallel)
const diagrams = await transformDiagramsWithSecureUrls(diagramArray);
const templates = await transformTemplatesWithSecureUrls(templateArray);
```

## 📱 Component Integration Examples

### Example: Diagram Viewer
```javascript
import React, { useState, useEffect } from 'react';
import { View, Image, ActivityIndicator } from 'react-native';
import { transformDiagramWithSecureUrl } from '../services/dataService';

export const DiagramViewer = ({ diagramId }) => {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDiagram = async () => {
      try {
        const diagram = await getDiagram(diagramId);
        const transformed = await transformDiagramWithSecureUrl(diagram);
        setImageUrl(transformed.imageUrl);
      } catch (err) {
        setError('Failed to load diagram');
      } finally {
        setLoading(false);
      }
    };
    loadDiagram();
  }, [diagramId]);

  if (loading) return <ActivityIndicator />;
  if (error) return <Text>{error}</Text>;
  
  return <Image source={{ uri: imageUrl }} style={{ flex: 1 }} />;
};
```

### Example: Template List
```javascript
import React, { useState, useEffect } from 'react';
import { FlatList, TouchableOpacity, Text } from 'react-native';
import { transformTemplatesWithSecureUrls } from '../services/dataService';
import * as Sharing from 'expo-sharing';

export const TemplateList = () => {
  const [templates, setTemplates] = useState([]);

  useEffect(() => {
    const loadTemplates = async () => {
      const allTemplates = await getTemplates();
      const withUrls = await transformTemplatesWithSecureUrls(allTemplates);
      setTemplates(withUrls);
    };
    loadTemplates();
  }, []);

  const handleShare = async (template) => {
    if (template.pdfUrl) {
      await Sharing.shareAsync(template.pdfUrl);
    }
  };

  return (
    <FlatList
      data={templates}
      renderItem={({ item }) => (
        <TouchableOpacity onPress={() => handleShare(item)}>
          <Text>{item.title}</Text>
          <Text>{item.description}</Text>
        </TouchableOpacity>
      )}
      keyExtractor={item => item.id}
    />
  );
};
```

## 🎓 Learning Path

1. **Basic**: Understand new field names (`imageFilePath`, `pdfFilePath`)
2. **Intermediate**: Use transformation functions in components
3. **Advanced**: Implement efficient caching strategies
4. **Expert**: Optimize for offline-first architecture

---

**Questions?** Check SECURE_FILE_STORAGE.md for detailed documentation
