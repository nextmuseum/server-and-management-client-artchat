<template>
  <CTable striped hover>
    <CTableHead>
      <CTableRow>
        <CTableHeaderCell scope="col">#</CTableHeaderCell>
        <CTableHeaderCell scope="col">Datum</CTableHeaderCell>
        <CTableHeaderCell scope="col">Kommentar/Nachricht</CTableHeaderCell>
        <CTableHeaderCell scope="col">Autor</CTableHeaderCell>
        <CTableHeaderCell scope="col">Meldungen</CTableHeaderCell>
        <CTableHeaderCell scope="col"></CTableHeaderCell>
      </CTableRow>
    </CTableHead>
    <CTableBody>
      <CTableRow v-for='(elem, index) in parsedReportedObjects' :color="( elem.reports.length > 1 ) ? 'warning' : ''" :key="elem.id">
        <CTableHeaderCell scope="row">{{ index }}</CTableHeaderCell>
        <CTableDataCell>{{ elem.date }}</CTableDataCell>
        <CTableDataCell>{{ elem.text }}</CTableDataCell>
        <CTableDataCell>{{ elem.userName }}</CTableDataCell>
        <CTableDataCell>{{ elem.reports.length }}</CTableDataCell>
        <CTableDataCell><CIcon @click="initiateDelete(elem._id)" icon="cil-trash"/></CTableDataCell>
      </CTableRow>
    </CTableBody>
  </CTable>
  <CModal :visible="Object.keys(deletingObject).length !== 0" backdrop="static" @close="() => { deletingObject = {} }">
    <CModalHeader>
      <CModalTitle>Kommentar/Nachricht löschen</CModalTitle>
    </CModalHeader>
    <CModalBody>
      {{ deletingObject.text }}
      <hr>
      von Benutzer <b>{{ deletingObject.userName }}</b>
      <hr>
      {{ deletingObject.reports.length }}x berichtet von: <br>
      <span v-for="report in deletingObject.reports" :key="report._id">
        {{ report.userName || report.userId }} am {{ parseDate(report.date) }}<br>
      </span>
    </CModalBody>
    <CModalFooter>
      <CButton color="secondary" @click="() => { deletingObject = {} }">
        Abbrechen
      </CButton>
      <CButton color="primary" @click="deleteObject(deletingObject)">Löschen</CButton>
    </CModalFooter>
  </CModal>
  <CToaster placement="top-end">
    <CToast v-for="(toast, index) in toasts" :key="index" :color="toast.color">
      <CToastHeader closeButton>
      <span class="me-auto fw-bold">{{toast.title}}</span>
      </CToastHeader>
      <CToastBody>
        {{ toast.content }}
      </CToastBody>  
    </CToast>
  </CToaster>
</template>

<script>
  import _ from 'lodash'
  import { ai } from '@/_apicontroller'

  export default {
    name: 'Reports',
    data() {
      return {
        reportedObjects: [],
        deletingObject: {},
        toasts: []
      }
    },
    methods: {
      initiateDelete: function(id) {
        console.log("delete " + id)
        this.deletingObject = this.reportedObjects.filter((el) => el._id == id)[0]
      },
      deleteObject: async function(object) {
        console.log(object)
        let type = (object.commentId) ? "messages" : "comments"
        let _this = this

        await ai({
          method: 'delete',
          url: `${type}/${object._id}`
        }).then((response) => {
          console.log(response)
          if (response.status == 204) 
            _this.createToast({title:"Gelöscht", color: "success", content: `Kommentar/Nachricht "${object.text}" wurde gelöscht`})
        }).catch((err) => {
          _this.createToast({title:"Fehler beim Löschen", color: "danger", content: err.toString()})
        })

        this.deletingObject = {}
        this.fetchReports()
      },
      resolveReport: async function(userId) {
        try {
          let user = await ai({
            method: 'get',
            url: 'users/userId'
          })
          return user.appdata.userName + ' (' + user.email + ')'
        } catch (err) {
          console.log(err)
          return "Fehler beim Auflösen von userId:" + userId
        }
      },
      fetchReports: async function () {
        let comments,
            messages

        try {
          messages = await ai({
            method: 'get',
            url: 'messages?limit=999&reported=1'
          })

          comments = await ai({
            method: 'get',
            url: 'comments?limit=999&reported=1'
          })
        } catch (err) {
          return new Error(err)
        }

        let combinedResult = comments.data.concat(messages.data);

        this.reportedObjects = _.sortBy(combinedResult, ['date'])
      },
      parseDate: function(ISOdate) {
          return new Date(ISOdate).toLocaleString()
      },
      createToast: function(input) {
        this.toasts.push({
          title: input.title,
          content: input.content,
          color: input.color
        })
      }
    },
    computed: {
      parsedReportedObjects() {
        let _this = this
        return this.reportedObjects.map(function (el){
          el.date = _this.parseDate(el.date)
          return el
        })
      }
    },
    mounted() { 
      this.fetchReports()
    }
  }
</script>