const express = require('express')
const router = express.Router()
const RES = require('../common/response')
const db = require('../common/db').getInstance()
const errorHandler = require('../common/errorHandler')

router.get('/record', (req, response) => {

   const queryRole = `
   SELECT role FROM clinic where cid = ?`

   db.makeSqlQuery(queryRole, [req.CID]).then(info => {
      const role = info[0].role;

      var query

      if (role == "Doctor") {
         query = `
         SELECT id, doctorName, patientName, time, status
         from appointment 
         where doctorId= ? and status = 1
         order by time asc
         limit 10`
      } else {
         query = `
      SELECT id, doctorName, patientName, time, status
      from appointment 
      where patientId= ?
      order by time desc
      limit 10`
      }

      db.makeSqlQuery(query, [req.CID]).then(info => {

         if (role != "Doctor") {
            const appointmentList = info.filter(element => {
               return element.status != 0;
            });

            const queryCheckConsul = `
         SElECT id from consultation where appointmentId = ?`

            info.forEach(element => {
               if (element.status == 0) {
                  db.makeSqlQuery(queryCheckConsul, [element.id]).then(info => {
                     if (info.length > 0) {
                        appointmentList.push(element)
                     }
                  })
               }
            });

            setTimeout(() => { response.send(RES(1, appointmentList)) }, 100);
         } else {
            response.send(RES(1, info))
         }
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

   const queryTime = `
   SElECT * From appointment where time = ?`

   db.makeSqlQuery(queryTime, [input.Time]).then(info => {
      if (info.length > 0) {
         response.send(RES(-1, "Time slot is not available"))
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

         const queryDoctor = `
         SELECT role, clinicName FROM clinic where cid = ?`

         db.makeSqlQuery(queryDoctor, [input.DoctorId]).then(info => {

            var doctorInfo;

            if (info.length > 0) {
               doctorInfo = info[0];
            } else {
               response.send(RES(-1, "No doctor info"))
            }

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