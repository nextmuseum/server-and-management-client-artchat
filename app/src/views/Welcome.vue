<template>
  <div>
    <CRow>
      <CCol :md="12">
        <CCard class="mb-4">
          <CCardHeader> Welcome </CCardHeader>
          <CCardBody>
            <div>
              <h2>ARt chat admin panel</h2>
              <p>
                Die Management-App für ARt chat.
              </p>
            </div>
            <CRow>
              <CCol :xs="6" v-if="!$auth.loading.value">
                <CAlert v-if="$auth.isAuthenticated.value" color="info">Angemeldet als {{$auth.user.value.email}}</CAlert>
                <CButton color="primary" class="px-4" @click="login" v-if="!$auth.isAuthenticated.value"> Login </CButton>
                <CButton color="secondary" variant="outline" class="px-4" @click="logout" v-if="$auth.isAuthenticated.value"> Logout </CButton>
              </CCol>
            </CRow>
            <hr>
            <CRow>
              <CCol>
                <CAlert v-for="(error, index) in errors" :key="index" color="warning">{{error}}</CAlert>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>

export default {
  name: 'Welcome',
  components: {},
  data() {
    return {
      errors: []
    }
  },
  methods: {
    parseErrors(){
      let loginError = this.$route.query.loginError

      if(loginError == "missingUserPrivilege") {
        this.errors.push(`Dem Benutzer ${this.$route.query.loginUser} fehlen administrative Rechte zum Benutzen des Management-Bereichs.`)
      }
    },
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
    this.parseErrors()
  }
}
</script>
