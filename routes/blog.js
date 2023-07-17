const express = require("express");
const router = express.Router();
const RES = require("../common/response");
const db = require("../common/db").getInstance();
const errorHandler = require("../common/errorHandler");

router.get("/", (req, response) => {
   const query = `
   SELECT * FROM blog WHERE status = 1`;
   db.makeSqlQuery(query)
      .then((info) => {
         response.send(RES(1, info));
      })
      .catch((err) => {
         errorHandler.handleDbError(response, err);
      });
});

router.post("/", (req, response) => {
   var input = req.body;
   if (input.CID == null || input.title == null) {
      errorHandler.handleMissingInputParams(response);
      return;
   }
   const date = new Date();
   let day = date.getDate();
   let month = date.getMonth() + 1;
   let year = date.getFullYear();

   // This arrangement can be altered based on how we want the date's format to appear.
   let currentDate = `${day}-${month}-${year}`;

   const query = `
          Insert into blog
          (doctorId,doctorName,email,title, description,updateDate, createDate,status)
          values
          (?, ?, ?, ?, ?, ?, ?,?)`;

   const queryParams = [
      input.CID,
      input.doctorName,
      input.email,
      input.title,
      input.description,
      currentDate,
      currentDate,
      1
   ];


   db.makeSqlQuery(query, queryParams)
      .then((info) => {
         response.send(RES(1, "create blog"));
      })
      .catch((err) => {
         if (err.errno == 1452) {
            response.send(RES(-1, "invalid clinic"));
         } else {
            errorHandler.handleDbError(response, err);
         }
      });
});

router.put("/", (req, response) => {
   var input = req.body;
   if (input.id == null || input.title == null) {
      errorHandler.handleMissingInputParams(response);
      return;
   }
   const date = new Date();
   let day = date.getDate();
   let month = date.getMonth() + 1;
   let year = date.getFullYear();

   // This arrangement can be altered based on how we want the date's format to appear.
   let currentDate = `${day}-${month}-${year}`;

   const query = `
   UPDATE blog
   SET
    title = ?,
    description = ?,
    updateDate= ?
   WHERE id = ?;
   `;

   const queryParams = [input.title, input.description, currentDate, input.id];

   db.makeSqlQuery(query, queryParams)
      .then((info) => {
         response.send(RES(1, "update Blog"));
      })
      .catch((err) => {
         if (err.errno == 1452) {
            response.send(RES(-1, "invalid clinic"));
         } else {
            errorHandler.handleDbError(response, err);
         }
      });
});

router.delete("/", (req, response) => {
   var input = req.body;
   if (input.id == null) {
      errorHandler.handleMissingInputParams(response);
      return;
   }

   const query = `
   UPDATE blog
   SET
   status = 0
   WHERE id = ?;
   `;

   const queryParams = [input.id];

   db.makeSqlQuery(query, queryParams)
      .then((info) => {
         response.send(RES(1, "deleted blog"));
      })
      .catch((err) => {
         if (err.errno == 1452) {
            response.send(RES(-1, "invalid clinic"));
         } else {
            errorHandler.handleDbError(response, err);
         }
      });
});

module.exports = router;
