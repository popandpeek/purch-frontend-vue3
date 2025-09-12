<template>
  <div class="edit-page">
    <div class="page-header">
      <div class="header-content">
        <h1>{{ pageTitle }}</h1>
        <p>{{ pageDescription }}</p>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline" @click="goBack">
          <span class="btn-icon">←</span>
          Back
        </button>
        <button class="btn btn-primary" @click="saveChanges">
          <span class="btn-icon">💾</span>
          Save Changes
        </button>
      </div>
    </div>

    <div class="edit-content">
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Loading...</p>
      </div>

      <div v-else-if="error" class="error-state">
        <h3>Error</h3>
        <p>{{ error }}</p>
        <button class="btn btn-primary" @click="retry">Retry</button>
      </div>

      <div v-else class="form-container">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';

interface Props {
  pageTitle: string;
  pageDescription: string;
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
});

const emit = defineEmits<{
  save: [];
  retry: [];
}>();

const router = useRouter();
const route = useRoute();

const goBack = () => {
  // Navigate to vendor management page for vendor-related edit pages
  if (router.currentRoute.value.path.includes('/vendors/contacts/')) {
    router.push('/vendors');
  } else {
    // Fallback to browser back for other edit pages
    router.back();
  }
};

const saveChanges = () => {
  emit('save');
};

const retry = () => {
  emit('retry');
};
</script>

<style scoped>
.edit-page {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #ecf0f1;
}

.header-content h1 {
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-size: 2rem;
}

.header-content p {
  margin: 0;
  color: #7f8c8d;
  font-size: 1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.edit-content {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #7f8c8d;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #ecf0f1;
  border-top: 3px solid #3d008d;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-icon {
  font-size: 4rem;
  margin-bottom: 1rem;
}

.error-state h3 {
  margin: 0 0 0.5rem 0;
  color: #e74c3c;
}

.error-state p {
  margin: 0 0 1rem 0;
}

.form-container {
  max-width: 800px;
  margin: 0 auto;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #3d008d;
  color: white;
}

.btn-primary:hover {
  background: #2a0063;
  transform: translateY(-1px);
}

.btn-outline {
  background: white;
  color: #3d008d;
  border: 1px solid #3d008d;
}

.btn-outline:hover {
  background: #f8f9fa;
}

.btn-icon {
  font-size: 1rem;
}

@media (max-width: 768px) {
  .edit-page {
    padding: 1rem;
  }
  
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }
  
  .header-actions {
    width: 100%;
    justify-content: flex-start;
  }
}
</style>
