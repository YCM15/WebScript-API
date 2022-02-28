const express = require('express');
const passport = require('passport');
const router = express.Router();

router.get("/", passport.authenticate('jwt'),(req, res)=>{
    if(!req.user){
      return res.status(401).send("WebScrip API")
    } 
  
    return  res.send("WebScript API");
  })

module.exports = router;