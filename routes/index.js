const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get("/", (req, res)=>{
    return  res.send("<h1>WebScript API</h1>");
  })

module.exports = router;