<template>
  <div>
    <CRow :xs="{ cols: 1, gutter: 4 }" :md="{ cols: 3}">
      <CCol xs v-for='(elem) in parsedReportedObjects'  :key="elem.id" >
        <CCard class="mb-3 border-top-3" :class="[{'border-top-warning' : (elem.reports.length > 1)}, {'border-top-danger' : (elem.reports.length > 2)}]">
          <CCardHeader><small><b>{{ elem.reports.length }} Meldung{{ (elem.reports.length > 1) ? "en" : '' }}</b>, #{{ elem._id }}</small></CCardHeader>
          <CCardBody>
            <CCardTitle>{{ elem.userName }}</CCardTitle>
            <CCardText>{{ elem.text }}<br><small class="text-muted">{{ elem.date }}</small></CCardText>
            <CCardFooter>
              
              <CButton size="sm" color="secondary" variant="outline" @click="initiateDelete(elem._id)" ><CIcon icon="cil-trash"/> Nachricht löschen</CButton>&nbsp;
              <CButton size="sm" color="success" variant="outline" @click="cleanseReport(elem)"><CIcon icon="cil-report-slash"/> Meldungen ignorieren</CButton>

            </CCardFooter>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
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
  </div>
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
          console.log(err)
          _this.createToast({title:"Fehler beim Löschen", color: "danger", content: err.toString()})
        })

        this.deletingObject = {}
        this.fetchReports()
      },
      cleanseReport: async function(report) {

        let _this = this,
            reportId = report._id,
            reportText = report.text

        await ai({
          method: 'delete',
          url: 'reports',
          headers: { "Content-Type": "application/json" },
          data: {
            "objectId": reportId
          }
        }).then((response) => {
          console.log(response)
          if (response.status == 204) {
            _this.createToast({title:"Meldungen ignoriert", color: "success", content: `Meldungen zu Kommentar/Nachricht "${reportText}" wurden gelöscht`})
            this.fetchReports()
          }
        }).catch((err) => {
          console.log(err)
          _this.createToast({title:"Fehler beim Ignorieren", color: "danger", content: err.toString()})
        })
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