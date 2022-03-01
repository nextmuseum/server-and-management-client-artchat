<template>
  <CFooter>
    <div>
      <CIcon icon="cil-code"/> Resource API: <b>{{ apiBase }}</b>
    </div>
    <div class="ms-auto">
      <span class="me-1" target="_blank">Powered by</span>
      <a href="https://vobe.digital" target="_blank">vobe.digital</a>
    </div>
  </CFooter>
</template>

<script>

import { apiConfig } from '@/components/apiConfig' 
export default {
  name: 'AppFooter',
  data: () => {
    return { apiBase: apiConfig.apiBasePath }
  }
}
</script>
