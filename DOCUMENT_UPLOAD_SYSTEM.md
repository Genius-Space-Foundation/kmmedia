# Enhanced Document Upload System

This document describes the enhanced document upload system implemented for the KM Media Training Institute application.

## Features Implemented

### 1. Drag-and-Drop Upload Component (`FileUpload`)

- **Location**: `src/components/ui/file-upload.tsx`
- **Features**:
  - Drag and drop file upload
  - Click to browse file selection
  - File type validation
  - File size validation
  - Upload progress indicators
  - Multiple file support
  - Real-time file preview
  - Error handling and display
  - Customizable file limits and restrictions

### 2. Document Management Interface (`DocumentManager`)

- **Location**: `src/components/ui/document-manager.tsx`
- **Features**:
  - Grid and list view modes
  - Search and filter functionality
  - Sort by name, date, size, or type
  - Category-based filtering
  - Document preview
  - Download functionality
  - Delete functionality
  - Upload dialog integration

### 3. Document Preview Component (`DocumentPreview`)

- **Location**: `src/components/ui/document-preview.tsx`
- **Features**:
  - Image preview
  - PDF preview (embedded)
  - Video preview with controls
  - Download and external link options
  - Responsive modal interface

### 4. Upload Hook (`useDocumentUpload`)

- **Location**: `src/lib/hooks/useDocumentUpload.ts`
- **Features**:
  - File upload management
  - Progress tracking
  - Error handling
  - Success/error callbacks
  - File deletion functionality

### 5. Upload API Endpoint

- **Location**: `src/app/api/upload/route.ts`
- **Features**:
  - File upload handling (POST)
  - File deletion handling (DELETE)
  - File type validation
  - File size validation
  - Unique filename generation
  - Error handling

### 6. Enhanced Application Form Integration

- **Location**: `src/components/forms/ApplicationForm.tsx`
- **Updates**:
  - Integrated FileUpload components for each document type
  - Real-time upload progress
  - Document categorization (resume, cover letter, portfolio, certificates)
  - Form validation with uploaded file URLs

## File Type Support

### Supported File Types:

- **Documents**: PDF, DOC, DOCX
- **Images**: JPG, JPEG, PNG, GIF
- **Videos**: MP4, MOV

### File Size Limits:

- **Resume/Cover Letter**: 5MB max
- **Portfolio**: 10MB max per file
- **Certificates**: 5MB max per file
- **General uploads**: 10MB max per file

## Usage Examples

### Basic File Upload

```tsx
import { FileUpload } from "@/components/ui/file-upload";
import { useDocumentUpload } from "@/lib/hooks/useDocumentUpload";

function MyComponent() {
  const { uploadFiles } = useDocumentUpload();

  return (
    <FileUpload
      maxFiles={5}
      maxSize={10}
      onUpload={uploadFiles}
      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
    />
  );
}
```

### Document Management

```tsx
import { DocumentManager } from "@/components/ui/document-manager";

function MyDocuments() {
  const [documents, setDocuments] = useState([]);

  return (
    <DocumentManager
      documents={documents}
      onUpload={handleUpload}
      onDelete={handleDelete}
      onPreview={handlePreview}
    />
  );
}
```

## API Usage

### Upload Files

```javascript
const formData = new FormData();
files.forEach((file) => formData.append("files", file));

const response = await fetch("/api/upload", {
  method: "POST",
  body: formData,
});

const result = await response.json();
```

### Delete File

```javascript
const response = await fetch(`/api/upload?filename=${filename}`, {
  method: "DELETE",
});
```

## Testing

A comprehensive test page is available at `/test-document-upload` which demonstrates:

- Basic file upload functionality
- Specialized upload areas for different document types
- Document management interface
- Integration examples

## Security Considerations

1. **File Type Validation**: Only allowed file types can be uploaded
2. **File Size Limits**: Configurable size limits prevent large file uploads
3. **Unique Filenames**: Generated unique filenames prevent conflicts
4. **Server-side Validation**: All validation is performed on both client and server
5. **Safe File Storage**: Files are stored in a dedicated uploads directory

## Configuration

### Environment Variables

No additional environment variables are required for basic functionality.

### File Storage

Files are stored in `public/uploads/documents/` directory by default.

### Customization

All components accept props for customization:

- File type restrictions
- Size limits
- Upload limits
- UI customization
- Callback functions

## Requirements Fulfilled

This implementation fulfills the following requirements from the user flow improvements spec:

- **Requirement 2.4**: Enhanced document upload with drag-and-drop functionality
- **Requirement 2.5**: File validation, progress indicators, and document management interface

## Integration Points

The document upload system integrates with:

1. **Application Form**: Step 4 document upload
2. **User Profile**: Document management
3. **Course Applications**: Supporting document uploads
4. **Admin Interface**: Document review and management

## Future Enhancements

Potential future improvements:

1. Cloud storage integration (AWS S3, Cloudinary)
2. Document versioning
3. Bulk upload operations
4. Advanced file processing (thumbnails, compression)
5. Document sharing and collaboration features
