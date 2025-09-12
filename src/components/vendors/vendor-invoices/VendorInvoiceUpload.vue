<template>
  <div class="invoice-upload-component">
    <div class="upload-section">
      <div class="section-header">
        <h3>File Upload</h3>
        <p>Upload an invoice file for processing</p>
      </div>
      
      <div class="upload-area" 
           :class="{ 'drag-over': isDragOver, 'has-file': file }" 
           @drop="handleFileDrop" 
           @dragover.prevent="isDragOver = true" 
           @dragleave="isDragOver = false"
           @click="triggerFileInput">
        <div v-if="!file" class="upload-placeholder">
          <div class="upload-icon">📄</div>
          <h4>Drop invoice file here</h4>
          <p>or click to browse</p>
          <input 
            ref="fileInput" 
            type="file" 
            @change="handleFileUpload" 
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            style="display: none"
          />
        </div>
        <div v-else class="file-selected">
          <div class="file-info">
            <div class="file-icon">📄</div>
            <div class="file-details">
              <h4>{{ file.name }}</h4>
              <p>{{ formatFileSize(file.size) }}</p>
            </div>
          </div>
          <button class="remove-file" @click.stop="removeFile">×</button>
        </div>
      </div>
      
      <div v-if="file" class="upload-actions">
        <button class="btn btn-secondary" @click="removeFile">
          Remove File
        </button>
        <button class="btn btn-primary" @click="submitFile" :disabled="isUploading">
          <span v-if="isUploading" class="loading-spinner"></span>
          {{ isUploading ? 'Uploading...' : 'Upload File' }}
        </button>
      </div>
    </div>
    
    <!-- Upload Status -->
    <div v-if="uploadStatus" class="upload-status" :class="uploadStatus.type">
      <div class="status-icon">
        <span v-if="uploadStatus.type === 'success'">✅</span>
        <span v-else-if="uploadStatus.type === 'error'">❌</span>
        <span v-else>ℹ️</span>
      </div>
      <div class="status-message">
        <h4>{{ uploadStatus.title }}</h4>
        <p>{{ uploadStatus.message }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import instance from '@/http-common';

// Props
const props = defineProps({
  onUploadSuccess: {
    type: Function,
    default: null
  },
  onUploadError: {
    type: Function,
    default: null
  }
});

// Emits
const emit = defineEmits(['upload-success', 'upload-error']);

// Reactive data
const file = ref(null);
const isDragOver = ref(false);
const isUploading = ref(false);
const fileInput = ref(null);
const uploadStatus = ref(null);

// Methods
const triggerFileInput = () => {
  fileInput.value?.click();
};

const handleFileUpload = (event) => {
  const selectedFile = event.target.files[0];
  if (selectedFile) {
    file.value = selectedFile;
    clearStatus();
  }
};

const handleFileDrop = (event) => {
  event.preventDefault();
  isDragOver.value = false;
  const droppedFile = event.dataTransfer.files[0];
  if (droppedFile) {
    file.value = droppedFile;
    clearStatus();
  }
};

const removeFile = () => {
  file.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
  clearStatus();
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const clearStatus = () => {
  uploadStatus.value = null;
};

const showStatus = (type, title, message) => {
  uploadStatus.value = { type, title, message };
  setTimeout(() => {
    uploadStatus.value = null;
  }, 5000);
};

const submitFile = async () => {
  if (!file.value) return;
  
  isUploading.value = true;
  clearStatus();
  
  try {
    const formData = new FormData();
    formData.append('file', file.value);
    
    const response = await instance.post('/single-file', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    showStatus('success', 'Upload Successful', 'File uploaded successfully!');
    
    // Emit success event
    emit('upload-success', response.data);
    if (props.onUploadSuccess) {
      props.onUploadSuccess(response.data);
    }
    
    // Clear file after successful upload
    removeFile();
    
  } catch (error) {
    console.error('Upload failed:', error);
    
    const errorMessage = error.response?.data?.message || 'Upload failed. Please try again.';
    showStatus('error', 'Upload Failed', errorMessage);
    
    // Emit error event
    emit('upload-error', error);
    if (props.onUploadError) {
      props.onUploadError(error);
    }
  } finally {
    isUploading.value = false;
  }
};
</script>

<style scoped>
.invoice-upload-component {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.section-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #2c3e50;
  margin: 0 0 0.5rem 0;
}

.section-header p {
  color: #6c757d;
  margin: 0;
  font-size: 0.9rem;
}

/* Upload Area */
.upload-area {
  border: 2px dashed #dee2e6;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #fafbfc;
  margin-bottom: 1rem;
}

.upload-area:hover {
  border-color: #3d008d;
  background: #f8f9ff;
}

.upload-area.drag-over {
  border-color: #3d008d;
  background: #f0f2ff;
  transform: scale(1.02);
}

.upload-area.has-file {
  border-color: #28a745;
  background: #f8fff9;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.upload-icon {
  font-size: 2.5rem;
  opacity: 0.6;
}

.upload-placeholder h4 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #495057;
  margin: 0;
}

.upload-placeholder p {
  color: #6c757d;
  margin: 0;
  font-size: 0.85rem;
}

.file-selected {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #28a745;
}

.file-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.file-icon {
  font-size: 1.5rem;
}

.file-details h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
  color: #2c3e50;
}

.file-details p {
  margin: 0;
  color: #6c757d;
  font-size: 0.8rem;
}

.remove-file {
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 1.75rem;
  height: 1.75rem;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s ease;
}

.remove-file:hover {
  background: #c82333;
}

/* Upload Actions */
.upload-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.6rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2a0063;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(61, 0, 141, 0.3);
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
  transform: translateY(-1px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.loading-spinner {
  width: 0.9rem;
  height: 0.9rem;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Upload Status */
.upload-status {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid;
}

.upload-status.success {
  background: #d4edda;
  border-left-color: #28a745;
  color: #155724;
}

.upload-status.error {
  background: #f8d7da;
  border-left-color: #dc3545;
  color: #721c24;
}

.upload-status.info {
  background: #cce5ff;
  border-left-color: #007bff;
  color: #004085;
}

.status-icon {
  font-size: 1.25rem;
}

.status-message h4 {
  margin: 0 0 0.25rem 0;
  font-size: 0.95rem;
  font-weight: 600;
}

.status-message p {
  margin: 0;
  font-size: 0.85rem;
  opacity: 0.9;
}

/* Responsive Design */
@media (max-width: 768px) {
  .upload-actions {
    flex-direction: column;
  }
  
  .btn {
    width: 100%;
    justify-content: center;
  }
  
  .upload-area {
    padding: 1.5rem 1rem;
  }
}
</style>
