const express = require("express");
const router = express.Router();
const RES = require("../common/response");
const db = require("../common/db").getInstance();
const errorHandler = require("../common/errorHandler");

router.get("/", (req, response) => {
   const query = `
   SELECT * FROM blog WHERE doctorId = ? and status = 1`;
   console.log(req.CID);
   db.makeSqlQuery(query, [req.CID])
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
          (doctorId, title, description,updateDate, createDate)
          values
          (?, ?, ?, ?, ?)`;

   const queryParams = [
      input.CID,
      input.title,
      input.description,
      currentDate,
      currentDate,
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
