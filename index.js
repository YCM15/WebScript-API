const mongoose = require('mongoose');
const express = require('express');
const passport = require('passport');
const session = require('express-session');
const cors = require('cors');

//settings
const app = express();
const port = 3000;
const DirDB = 'mongodb+srv://yunior_unah:rn7KY0fYh9M9AVhD@cluster0.vqmmq.mongodb.net/Webscript?retryWrites=true&w=majority';
const db = mongoose.connection;

//DATABASE
mongoose.connect(DirDB, {useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true}).catch(err=>console.log(err));
mongoose.set('useFindAndModify', false);

db.on('error', function(err){
  throw err;
  process.exit(1);
});

db.on('open', function(){
  console.log("conected to database ", DirDB);
});

app.use(cors());
app.set('trust proxy', 1);

app.use(session({
	secret: 'supersecret',
	resave: true,
	saveUninitialized: true,
	cookie: {
		sameSite: 'none',
		secure: false,
        maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
    }
  }));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(passport.initialize());
app.use(passport.session());

//global variables



app.use(require('./routes/index'));
app.use(require('./routes/user'));
app.use(require('./routes/proyects'));
app.use(require('./routes/snippets'));
app.use(require('./routes/carpetas'));
app.use(require('./routes/admin'));


app.listen(process.env.PORT || port, () => {
  console.log(`Servidor levantado, puerto: ${port}`);
});







