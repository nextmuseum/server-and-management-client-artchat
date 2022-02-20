<template>
  <CHeader position="sticky" class="mb-4">
    <CContainer fluid>
      <CHeaderToggler class="ps-1" @click="$store.commit('toggleSidebar')">
        <CIcon icon="cil-menu" size="lg" />
      </CHeaderToggler>
      <CImage :src="artchatLogo" height="45" />
      
      <!-- <CHeaderToggler class="ps-1" @click="$store.commit('toggleSidebar')">
        <CIcon icon="cil-menu" size="lg" />
      </CHeaderToggler>
      
      <CHeaderNav class="d-none d-md-flex me-auto">
        <CNavItem>
          <CNavLink href="/dashboard"> Dashboard </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink href="#">Users</CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink href="#">Settings</CNavLink>
        </CNavItem>
      </CHeaderNav>-->
      <CHeaderNav style="margin-left: auto">
        <!-- <CNavItem>
          <CNavLink href="#">
            <CIcon class="mx-2" icon="cil-bell" size="lg" />
          </CNavLink>
        </CNavItem>
        <CNavItem>
          <CNavLink href="#">
            <CIcon class="mx-2" icon="cil-list" size="lg" />
          </CNavLink>
        </CNavItem>-->
        
        <CNavItem v-if="!$auth.loading.value">
          <CNavLink href="#" v-if="!$auth.isAuthenticated.value" @click="login">Login</CNavLink>
          <CNavLink href="#" v-if="$auth.isAuthenticated.value" @click="logout">Logout</CNavLink>
        </CNavItem> 
        <AppHeaderDropdownAccnt v-if="$auth.isAuthenticated.value" />
        
      </CHeaderNav>
    </CContainer>
    <CHeaderDivider />
    <CContainer fluid>
      <AppBreadcrumb />
    </CContainer>
  </CHeader>
</template>

<script>
import AppBreadcrumb from './AppBreadcrumb'
import AppHeaderDropdownAccnt from './AppHeaderDropdownAccnt'
import nextmuseumLogo from '@/assets/brand/nextmuseum_logo_teal.png'
import artchatLogo from '@/assets/brand/artchat_logo.png'

export default {
  name: 'AppHeader',
  components: {
    AppBreadcrumb,
    AppHeaderDropdownAccnt,
  },
  setup() {
    return {
      nextmuseumLogo,
      artchatLogo
    }
  },
  methods: {
    login() {
      this.$auth.loginWithRedirect();
    },
    logout() {
      this.$auth.logout({
        returnTo: window.location.origin + '/app'
      });
    }
  },
  mounted() {
    this.$store.commit('updateSidebarVisible', true)
  }
}
</script>
