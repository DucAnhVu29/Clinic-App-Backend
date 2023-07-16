const express = require("express");
const router = express.Router();
const RES = require("../common/response");
const db = require("../common/db").getInstance();
const errorHandler = require("../common/errorHandler");

router.get("/", (req, response) => {
   const query = `
    SELECT * FROM feedback WHERE blogId = ?`;

   db.makeSqlQuery(query, [req.CID])
      .then((info) => {
         response.send(RES(1, info));
      })
      .catch((err) => {
         errorHandler.handleDbError(response, err);
      });
});

router.get("/:blogId", (req, response) => {
   const query = `
    SELECT * FROM feedback WHERE blogId = ?`;

   db.makeSqlQuery(query, [req.params.blogId])
      .then((info) => {
         response.send(RES(1, info));
      })
      .catch((err) => {
         errorHandler.handleDbError(response, err);
      });
});

router.post("/", (req, response) => {
   var input = req.body;
   if (input.message == null) {
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
          Insert into feedback
          (patientId,createDate, message, blogId,status)
          values
          (?, ?, ?, ?, 1)`;

   const queryParams = [input.CID, currentDate, input.message, input.blogId];

   db.makeSqlQuery(query, queryParams)
      .then((info) => {
         response.send(RES(1, "create feedback"));
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
   if (input.id == null || input.message == null) {
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
    Update feedback
    set message = ?
    where id = ?`;

   const queryParams = [input.message, input.id];

   db.makeSqlQuery(query, queryParams)
      .then((info) => {
         response.send(RES(1, "update feedback"));
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
    DELETE FROM feedback
     where id = ?`;

   const queryParams = [input.id];

   db.makeSqlQuery(query, queryParams)
      .then((info) => {
         response.send(RES(1, "deleted feedback"));
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
