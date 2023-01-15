<template>
  <base-input-list-item>
    <h4>Upload Invoice
      <input type="file" @change="handleFileUpload($event)" />
    </h4>
    <base-button v-on:click="submitFile()">Submit</base-button>
  </base-input-list-item>
</template>

<script setup>
import { ref } from 'vue';
import instance from '@/http-common';


const file = ref(null)

const handleFileUpload = (event) => {
  file.value = event.target.files[0];
}

const submitFile = () => {
  let formData = new FormData();

  formData.append('file', file.value);
  instance.post('/single-file',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    }
  ).then(function () {
    console.log('SUCCESS!!');
    // reroute to vendor invoices page

  })
    .catch(function () {
      console.log('FAILURE!!');
      // print error to screen
    });

}

</script>

<style scoped>
li {
  /* margin: 1rem 0; */
  border: 1px solid #424242;
  border-radius: 12px;
  padding: 1rem;
}

h3 {
  font-size: 1.5rem;
}

h3,
h4 {
  margin: 0.5rem 0;
}

div {
  margin: 0.5rem 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
}
</style>
