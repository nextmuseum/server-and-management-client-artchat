<template>
  <CSidebar
    position="fixed"
    :unfoldable="sidebarUnfoldable"
    :visible="sidebarVisible"
    @visible-change="
      (event) =>
        $store.commit({
          type: 'updateSidebarVisible',
          value: true,
        })
    "
  >
    <CSidebarBrand style="background-color: #cafff3">
      <CImage fluid :src="nextmuseumLogo" style="height:60px" />
    </CSidebarBrand>
    <CSidebarNav v-if="!$auth.loading.value">
      <CNavItem href="./welcome">
        <CIcon customClassName="nav-icon" icon="cil-bell"/> Welcome
      </CNavItem>
      <CNavItem href="./dashboard" v-if="$auth.isAuthenticated.value">
        <CIcon customClassName="nav-icon" icon="cil-speedometer"/> Dashboard
      </CNavItem>
      <CNavItem href="./reports" v-if="$auth.isAuthenticated.value">
        <CIcon customClassName="nav-icon" icon="cil-report-slash"/> Reports
      </CNavItem>
      
    </CSidebarNav>
    <!-- <CSidebarToggler
      class="d-none d-lg-flex"
      @click="$store.commit('toggleUnfoldable')"
    /> -->
  </CSidebar>
</template>

<script>
import { computed } from 'vue'
import { useStore } from 'vuex'
import nextmuseumLogo from '@/assets/brand/nextmuseum_logo_teal.png'
import { sygnet } from '@/assets/brand/sygnet'

export default {
  name: 'AppSidebar',
  components: {
  },
  setup() {
    const store = useStore()
    return {
      sygnet,
      nextmuseumLogo,
      sidebarUnfoldable: computed(() => store.state.sidebarUnfoldable),
      sidebarVisible: computed(() => store.state.sidebarVisible),
    }
  },
}
</script>
