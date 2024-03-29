import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import CoreuiVue from '@coreui/vue'
import CIcon from '@coreui/icons-vue'
import { iconsSet as icons } from '@/assets/icons'
import DocsCallout from '@/components/DocsCallout'
import DocsExample from '@/components/DocsExample'

// Import the plugin here
import authConfig from './auth/authOptions.js'
import { setupAuth } from './auth'

let app = createApp(App)
app.use(store)
app.use(router)
app.use(CoreuiVue)
app.provide('icons', icons)
app.component('CIcon', CIcon)
app.component('DocsCallout', DocsCallout)
app.component('DocsExample', DocsExample)

function callbackRedirect(appState, authPlugin) {

  // check for user permissions
  if (authPlugin.user.value[authConfig.audience + "/roles"].indexOf("admin") == -1 )
    return authPlugin.logout({
      returnTo: window.location.origin + `/app?loginError=missingUserPrivilege&loginUser=${authPlugin.user.value.name}`
    });

  router.push(
    appState && appState.targetUrl
      ? appState.targetUrl
      : '/'
  );
}

setupAuth(authConfig, callbackRedirect).then((auth) => {
  app.use(auth).mount('#app')
})

export default app