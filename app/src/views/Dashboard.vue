<template>
  <div>
    <CRow>
      <CCol :md="12">
        <CCard class="mb-4">
          <CCardHeader> Statistik </CCardHeader>
          <CCardBody v-if="!err">
            <CRow>
              <CCol :sm="12" :lg="6">
                <CRow>
                  <CCol :sm="6">
                    <div
                      class="border-start border-start-4 border-start-info py-1 px-3 mb-3"
                    >
                      <div class="text-medium-emphasis small">Benutzer</div>
                      <div class="fs-5 fw-semibold">{{userCount}}</div>
                    </div>
                  </CCol>
                  <CCol :sm="6">
                    <div
                      class="border-start border-start-4 border-start-danger py-1 px-3 mb-3"
                    >
                      <div class="text-medium-emphasis small">Artworks</div>
                      <div class="fs-5 fw-semibold">{{artworkCount}}</div>
                    </div>
                  </CCol>
                </CRow>

              </CCol>
              <CCol :sm="12" :lg="6">
                <CRow>
                  <CCol :sm="6">
                    <div
                      class="border-start border-start-4 border-start-warning py-1 px-3 mb-3"
                    >
                      <div class="text-medium-emphasis small">Kommentare</div>
                      <div class="fs-5 fw-semibold">{{artworkCount}}</div>
                    </div>
                  </CCol>
                  <CCol :sm="6">
                    <div
                      class="border-start border-start-4 border-start-success py-1 px-3 mb-3"
                    >
                      <div class="text-medium-emphasis small">Nachrichten</div>
                      <div class="fs-5 fw-semibold">{{messageCount}}</div>
                    </div>
                  </CCol>
                </CRow>

              </CCol>
            </CRow>
            <br />
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  </div>
</template>

<script>

import {ai} from '@/_apicontroller'
import _ from 'lodash'

export default {
  name: 'Dashboard',
  components: {},
  data() {
    return {
      userCount: 0,
      artworkCount: 0,
      commentCount: 0,
      messageCount: 0,
      err : null
    }
  },
  methods: {
    fetchStats: async function() {
      try {
        this.userCount = _.get(await ai({
          method: 'get',
          url: '/users?count=1'
        }), 'data')

        this.artworkCount = _.get(await ai({
          method: 'get',
          url: '/artworks?count=1'
        }), 'data')

        this.commentCount = _.get(await ai({
          method: 'get',
          url: '/comments?count=1'
        }), 'data')

        this.messageCount = _.get(await ai({
          method: 'get',
          url: '/messages?count=1'
        }), 'data')
      } catch (err) {
        console.log(err)
        this.err = err
      }
    },
  },
  mounted() {
    this.fetchStats()
  }
}
</script>
