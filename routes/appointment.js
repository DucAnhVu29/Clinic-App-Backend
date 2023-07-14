const express = require('express')
const router = express.Router()
const RES = require('../common/response')
const db = require('../common/db').getInstance()
const errorHandler = require('../common/errorHandler')

router.get('/record', (req, response) => {
   var start = req.query.from
   var end = req.query.to

   if (start == null || end == null) {
      errorHandler.handleMissingInputParams(response)
      return
   }

   const queryRole = `
   SELECT role FROM clinic where cid = ?`

   db.makeSqlQuery(queryRole, [req.CID]).then(info => {
      console.log("🚀 ~ file: appointment.js:22 ~ db.makeSqlQuery ~ info:", info)

      const role = info[0].role;
      console.log("🚀 ~ file: appointment.js:23 ~ db.makeSqlQuery ~ role:", role)

      var query

      if (role == "Doctor") {
         query = `
         SELECT id, doctorName, patientName, time
         from appointment 
         where doctorId= ? and time >= ? and time <= ?  and status = 1
         order by time asc
         limit 10`
      } else {
         query = `
      SELECT id, doctorName, patientName, time
      from appointment 
      where patientId= ? and time >= ? and time <= ? and status = 1
      order by time asc
      limit 10`
      }

      console.log(query)

      db.makeSqlQuery(query, [req.CID, start, end]).then(info => {
         response.send(RES(1, info))
      }).catch(err => {
         errorHandler.handleDbError(response, err)
      })
   })
})

router.put('/create', (req, response) => {
   var input = req.body
   if (input.DoctorId == null || input.Time == null) {
      errorHandler.handleMissingInputParams(response)
      return
   }

   const queryPatient = `
   SELECT role, clinicName FROM clinic where cid = ?`

   db.makeSqlQuery(queryPatient, [req.CID]).then(info => {

      var patientInfo = info[0]

      if (patientInfo.role == "Doctor") {
         response.send(RES(-1, "Doctor cannot create appointment"))
         return
      }

      console.log("🚀 ~ file: appointment.js:59 ~ db.makeSqlQuery ~ patientInfo:", patientInfo)

      const queryDoctor = `
      SELECT role, clinicName FROM clinic where cid = ?`

      db.makeSqlQuery(queryDoctor, [input.DoctorId]).then(info => {

         var doctorInfo;

         if (info.length > 0) {
            doctorInfo = info[0];
         } else {
            response.send(RES(-1, "No doctor info"))
         }

         console.log("🚀 ~ file: appointment.js:74 ~ db.makeSqlQuery ~ doctorInfo:", doctorInfo)


         const query = `
         Insert into appointment
         (doctorId, doctorName, patientId, patientName, time, status)
         values
         (?, ?, ?, ?, ?, ?)`

         const queryParams = [
            input.DoctorId, doctorInfo.clinicName, req.CID, patientInfo.clinicName, input.Time, true
         ]

         db.makeSqlQuery(query, queryParams).then(info => {
            response.send(RES(1, "create appointment record success"))
         }).catch(err => {
            if (err.errno == 1452) {
               response.send(RES(-1, "invalid clinic"))
            } else {
               errorHandler.handleDbError(response, err)
            }
         })
      })
   })
})

router.put('/cancel', (req, response) => {
   var input = req.body
   if (input.Id == null) {
      errorHandler.handleMissingInputParams(response)
      return
   }

   const query = `
   Update appointment
   set status = 0
   where id = ?`

   db.makeSqlQuery(query, [input.Id]).then(info => {
      response.send(RES(1, "cancel appointment success"))
   }).catch(err => {
      if (err.errno == 1452) {
         response.send(RES(-1, "invalid appointment"))
      } else {
         errorHandler.handleDbError(response, err)
      }
   })
})



module.exports = router