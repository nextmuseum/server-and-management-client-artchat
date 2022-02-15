<template>
  <CFooter>
    <div>
      <a href="https://nextmuseum.io" target="_blank">Nextmuseum.io</a>
      <span class="ms-1"
        >&copy; {{ new Date().getFullYear() }} Kunstpalast</span
      >
    </div>
    <div class="ms-auto">
      <span class="me-1" target="_blank">Powered by</span>
      <a href="https://vobe.digital" target="_blank">vobe.digital</a>
    </div>
  </CFooter>
</template>

<script>
export default {
  name: 'AppFooter',
}
</script>
