const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get("/", (req, res)=>{
    return  res.send("WebScript API");
  })

module.exports = router;