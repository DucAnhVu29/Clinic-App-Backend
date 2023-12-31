const express = require('express')
const router = express.Router()
const RES = require('../common/response')
const db = require('../common/db').getInstance()
const errorHandler = require('../common/errorHandler')

// get consultation for doctor
router.get('/record', (req, response) => {

  const queryRole = `
   SELECT role FROM clinic where cid = ?`

  db.makeSqlQuery(queryRole, [req.CID]).then(info => {
    const role = info[0].role;

    var query

    if (role == "Doctor") {
      query = `
      SELECT doctorName, patientName, diagnosis, medication, consultationFee, time, followUp 
      from consultation 
      where doctorId= ? 
      order by time desc
      limit 10`
    } else {
      query = `
      SELECT doctorName, patientName, diagnosis, medication, consultationFee, time, followUp 
      from consultation 
      where patientId= ? 
      order by time desc
      limit 10`
    }


    db.makeSqlQuery(query, [req.CID]).then(info => {
      response.send(RES(1, info))
    }).catch(err => {
      errorHandler.handleDbError(response, err)
    })
  })
})


// get consultation for appointment (for patient)
router.get('/appointment', (req, response) => {
  var input = req.body

  if (input.AppointmentId == null) {
    errorHandler.handleMissingInputParams(response)
    return
  }

  const query = `
  SELECT doctorName, patientName, diagnosis, medication, consultationFee, time, followUp 
  from consultation 
  where appointmentId = ?`

  db.makeSqlQuery(query, [input.AppointmentId]).then(info => {
    response.send(RES(1, info))
  }).catch(err => {
    errorHandler.handleDbError(response, err)
  })
})


// create consultation record
router.put('/create', (req, response) => {
  var input = req.body

  if (input.AppointmentId == null || input.Diagnosis == null || input.Time == null
    || input.Medication == null || input.ConsultationFee == null || input.FollowUp == null) {
    errorHandler.handleMissingInputParams(response)
    return
  }

  const appointmentQuery = `
  Select doctorName, patientId, patientName from appointment where id = ? and status = 1
  `

  db.makeSqlQuery(appointmentQuery, input.AppointmentId).then(info => {
    const names = info[0];

    if (typeof (names) == "undefined") {
      response.send(RES(-1, "Appointment already Cancel"))
      return
    }

    const query = `
    Insert into consultation
    (appointmentId ,doctorId, doctorName, patientId, patientName, diagnosis, medication, consultationFee, time, followUp)
    values
    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

    const queryParams = [
      input.AppointmentId, req.CID, names.doctorName, names.patientId, names.patientName, input.Diagnosis,
      input.Medication, input.ConsultationFee, input.Time, input.FollowUp
    ]


    db.makeSqlQuery(query, queryParams).then(info => {

      const queryChangeStatus = `
      Update appointment
      set status = 0
      where id = ?`

      db.makeSqlQuery(queryChangeStatus, input.AppointmentId).then(info => {
        return
      }).catch(err => {
        errorHandler.handleDbError(response, err)
      })

      response.send(RES(1, "create consultation record success"))
    }).catch(err => {
      console.log("ERRORRRRRRR")
      if (err.errno == 1452) {
        response.send(RES(-1, "invalid clinic"))
      } else {
        errorHandler.handleDbError(response, err)
      }
    })
  })
})

module.exports = router
