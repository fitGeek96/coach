//jshint esversion:6

const express = require("express");
const exphbs = require("express-handlebars");
const Handlebars = require("handlebars");
const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");
const methodOverride = require("method-override");
const flash = require("connect-flash");
const session = require("express-session");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require("bcryptjs");

const path = require("path");
const moment = require("moment");
const {
  ensureAuthenticated
} = require("./helpers/auth");

// Map global promise - get rid of warning
mongoose.Promise = global.Promise;
const app = express();

// Load membre Model
require("./models/Membre");
const Membre = mongoose.model("membres");



// Load Emploi Model
require("./models/Emploi");
const Emploi = mongoose.model("jours");

// Load User Model
require("./models/User");
const User = mongoose.model("users");


// Load User Model
require("./models/Programme");
const Programme = mongoose.model("programmes");

// DB Config
const db = require("./config/database");

var current = moment();

// Connect to mongoose

mongoose
  .connect("mongodb+srv://admin-tahar:test123@cluster0-esdss.mongodb.net/coachBDD", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Base de donnees Connected..."))
  .catch((err) => console.log(err));

require("./config/passport")(passport);

// Handlebars Middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "handlebars");

app.use(express.static(path.join(__dirname, "views")));

// Body parser middleware
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);
app.use(bodyParser.json());

// Method override middleware
app.use(methodOverride("_method"));

// Express session midleware
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// passport middlewqre
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

// Global variables
app.use(function (req, res, next) {
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Index Route
app.get("/", ensureAuthenticated, (req, res) => {
  const title = "Bienvenue au Salle des sports Anti-Stress";
  res.render("index", {
    title: title,
  });
});

// membre Index Page
app.get("/membres", ensureAuthenticated, (req, res) => {
  Membre.find({})
    .sort({
      date: "desc",
    })
    .then((membres) => {
      membres.forEach((membre) => {


        if (membre.jours <= 0) {
          membre.green = true;
        } else {
          membre.green = false;
        }
      });

      res.render("membres/membres", {
        membres: membres
      });


    });

});











// Produits Index Page
app.get("/programmes", ensureAuthenticated, (req, res) => {
  Programme.find({})
    .sort({
      date: "desc",
    })
    .then((programmes) => {
      res.render("programmes/programmes", {
        programmes: programmes,
      });
    });
});

// emplois  Page
app.get("/emplois", ensureAuthenticated, (req, res) => {
  Emploi.find({})
    .sort({
      date: "desc",
    })
    .then((jours) => {
      res.render("emplois/emploi", {
        jours: jours,
      });
    });
});

// // Add membre Form
app.get("/membres/add", ensureAuthenticated, (req, res) => {
  res.render("membres/add");
});

// EMPLOI DU TEMPS

app.get("/programmes/add", ensureAuthenticated, (req, res) => {
  res.render("programmes/add");
});

// EMPLOI DU TEMPS

app.get("/emplois/add", ensureAuthenticated, (req, res) => {
  const title = "Modification d'Emploi du temps d'entrainement";

  res.render("emplois/add", {
    tit: title,
  });
});

// Edit membre Form
app.get("/membres/edit/:id", ensureAuthenticated, (req, res) => {
  Membre.findOne({
    _id: req.params.id,
  }).then((membre) => {
    res.render("membres/edit", {
      membre: membre,
    });
  });
});

// Edit produit Form
app.get("/programmes/edit/:id", ensureAuthenticated, (req, res) => {
  Programme.findOne({
    _id: req.params.id,
  }).then((programmes) => {
    res.render("programmes/edit", {
      programmes: programmes,
    });
  });
});

// Edit emploi Form
app.get("/emplois/edit/:id", ensureAuthenticated, (req, res) => {
  Emploi.findOne({
    _id: req.params.id,
  }).then((jour) => {
    res.render("emplois/edit", {
      jour: jour,
    });
  });
});

// Trouver membre Form
app.get("/trouver", ensureAuthenticated, (req, res) => {
  const userID = req.query.q;

  if (userID) {
    Membre.find({
        ID: userID,
      },
      function (err, foundmembres) {
        if (err) {
          console.log(err);
        } else {
          res.render("trouver", {
            membres: foundmembres,
          });
        }
      }
    );
  }
});

// MEMBRE Process Form

app.post("/membres", ensureAuthenticated, (req, res) => {
  const newUser = {
    ID: req.body.ID,
    nom: req.body.nom,
    prenom: req.body.prenom,
    email: req.body.email,
    ddn: req.body.ddn,
    jours: req.body.jours,
    phone: req.body.tele,
    typeS: req.body.typeS,
    typeC: req.body.typeC,
    sexe: req.body.sexe,
    avatar: req.body.avatar,
  };

  newUser.ddn = moment(req.body.ddn).format("D-MM-YYYY");
  var date_abonn = moment(newUser.jours);
  var jours_restes = date_abonn.diff(current, 'days');
  newUser.jours = jours_restes;



  new Membre(newUser).save().then((membre) => {
    res.redirect("/membres");
  });
});

// Produit Process Form

app.post("/programmes", ensureAuthenticated, (req, res) => {
  const newProgramme = {
    nom_programme: req.body.nom_programme,
    duree_ent: req.body.duree_ent,
    num_ex_total: req.body.num_ex_total,

    num_ex_01: {
      nom_ex: req.body.num_ex_01_nom_ex,
      num_ser: req.body.num_ex_01_num_ser,
      num_rep: req.body.num_ex_01_num_rep,
    },
    num_ex_02: {
      nom_ex: req.body.num_ex_02_nom_ex,
      num_ser: req.body.num_ex_02_num_ser,
      num_rep: req.body.num_ex_02_num_rep,
    },
    num_ex_03: {
      nom_ex: req.body.num_ex_03_nom_ex,
      num_ser: req.body.num_ex_03_num_ser,
      num_rep: req.body.num_ex_03_num_rep,
    },
    num_ex_04: {
      nom_ex: req.body.num_ex_04_nom_ex,
      num_ser: req.body.num_ex_04_num_ser,
      num_rep: req.body.num_ex_04_num_rep,
    },

    niveau: req.body.niveau,
    programme_img: req.body.programme_img

  };

  new Programme(newProgramme).save().then((programme) => {
    res.redirect("/programmes");
  });
});

// Emploi Process Form

app.post("/emplois", ensureAuthenticated, (req, res) => {
  const newTraining = {
    timeD: {
      debut: req.body.timeDd,
      fin: req.body.timeDf,
    },
    sportD: req.body.sportD,
    timeL: {
      debut: req.body.timeLd,
      fin: req.body.timeLf,
    },
    sportL: req.body.sportL,
    timeM: {
      debut: req.body.timeMd,
      fin: req.body.timeMf,
    },
    sportM: req.body.sportM,
    timeMer: {
      debut: req.body.timeMerd,
      fin: req.body.timeMerf,
    },
    sportMer: req.body.sportMer,
    timeJ: {
      debut: req.body.timeJd,
      fin: req.body.timeJf,
    },
    sportJ: req.body.sportJ,
    timeV: {
      debut: req.body.timeVd,
      fin: req.body.timeVf,
    },
    sportV: req.body.sportV,
    timeS: {
      debut: req.body.timeSd,
      fin: req.body.timeSf,
    },
    sportS: req.body.sportS,
  };

  new Emploi(newTraining).save().then((jour) => {
    res.redirect("/emplois");
  });
});

// // Edit Form process
app.put("/membres/:id", ensureAuthenticated, (req, res) => {
  Membre.findOne({
    _id: req.params.id,
  }).then((membre) => {

    var date_abonn = moment(req.body.jours);
    var jours_restes = date_abonn.diff(current, 'days');
    // new values
    membre.ID = req.body.ID;
    membre.nom = req.body.nom;
    membre.prenom = req.body.prenom;
    membre.ddn = moment(req.body.ddn).format("D-MM-YYYY");
    membre.jours = jours_restes;
    membre.email = req.body.email;
    membre.phone = req.body.tele;
    membre.typeS = req.body.typeS;
    membre.typeC = req.body.typeC;
    membre.sexe = req.body.sexe;

    membre.save().then((membre) => {
      res.redirect("/membres");
    });
  });
});

// // Edit Form process Produits
app.put("/programmes/:id", ensureAuthenticated, (req, res) => {
  Programme.findOne({
    _id: req.params.id,
  }).then((programme) => {
    // new values

    programme.nom_programme = req.body.nom_programme;
    programme.num_ex_total = req.body.num_ex_total;
    programme.duree_ent = req.body.duree_ent;

    programme.num_ex_01.nom_ex = req.body.num_ex_01_nom_ex;
    programme.num_ex_01.num_ex_01_num_ser = req.body.num_ex_01_num_ser;
    programme.num_ex_01.num_ex_01_num_rep = req.body.num_ex_01_num_rep;

    programme.num_ex_02.nom_ex = req.body.num_ex_02_nom_ex;
    programme.num_ex_02.num_ex_02_num_ser = req.body.num_ex_02_num_ser;
    programme.num_ex_02.num_ex_02_num_rep = req.body.num_ex_02_num_rep;

    programme.num_ex_03.nom_ex = req.body.num_ex_03_nom_ex;
    programme.num_ex_03.num_ex_01_num_ser = req.body.num_ex_03_num_ser;
    programme.num_ex_03.num_ex_01_num_rep = req.body.num_ex_03_num_rep;

    programme.num_ex_04.nom_ex = req.body.num_ex_04_nom_ex;
    programme.num_ex_04.num_ex_01_num_ser = req.body.num_ex_04_num_ser;
    programme.num_ex_04.num_ex_01_num_rep = req.body.num_ex_04_num_rep;


    programme.niveau = req.body.niveau;



    programme.save().then((programme) => {
      res.redirect("/programmes");
    });
  });
});

// // Edit Form process Produits
app.put("/emplois/:id", ensureAuthenticated, (req, res) => {
  Emploi.findOne({
    _id: req.params.id,
  }).then((jour) => {
    // new values

    jour.timeD.debut = req.body.timeDd;
    jour.timeD.fin = req.body.timeDf;
    jour.sportD = req.body.sportD;

    jour.timeL.debut = req.body.timeLd;
    jour.timeL.fin = req.body.timeLf;
    jour.sportL = req.body.sportL;

    jour.timeM.debut = req.body.timeMd;
    jour.timeM.fin = req.body.timeMf;
    jour.sportM = req.body.sportM;

    jour.timeMer.debut = req.body.timeMerd;
    jour.timeMer.fin = req.body.timeMerf;
    jour.sportMer = req.body.sportMer;

    jour.timeJ.debut = req.body.timeJd;
    jour.timeJ.fin = req.body.timeJf;
    jour.sportJ = req.body.sportJ;

    jour.timeV.debut = req.body.timeVd;
    jour.timeV.fin = req.body.timeVf;
    jour.sportV = req.body.sportV;

    jour.timeS.debut = req.body.timeSd;
    jour.timeS.fin = req.body.timeSf;
    jour.sportS = req.body.sportS;

    jour.save().then((jour) => {
      res.redirect("/emplois");
    });
  });
});

// // Delete membre
app.delete("/membres/:id", ensureAuthenticated, (req, res) => {
  Membre.remove({
    _id: req.params.id,
  }).then(() => {
    res.redirect("/membres");
  });
});

// // Delete Produit
app.delete("/programmes/:id", ensureAuthenticated, (req, res) => {
  Programme.remove({
    _id: req.params.id,
  }).then(() => {
    res.redirect("/programmes");
  });
});

// user login route

app.get("/users/login", (req, res) => {
  res.render("users/login");
});

// user register route

app.get("/users/register", (req, res) => {
  res.render("users/register");
});

// login form post
app.post("/users/login", (req, res, next) => {
  passport.authenticate("local", {
    successRedirect: "/",
    failureRedirect: "/users/login",
    failureFlash: true,
  })(req, res, next);
});

// user register form post

app.post("/users/register", (req, res) => {
  let errors = [];

  if (req.body.password != req.body.password_2) {
    errors.push({
      text: "Les mots de passe ne correspondent pas",
    });
  }
  if (req.body.password.length < 4) {
    errors.push({
      text: "le mot de passe doit contenir au moins 4 caractères",
    });
  }

  if (errors.length > 0) {
    res.render("users/register", {
      errors: errors,
      username: req.body.username,
      password: req.body.password,
      password_2: req.body.password_2,
    });
  } else {
    User.findOne({
      username: req.body.username,
    }).then((user) => {
      if (user) {
        errors.push({
          text: "Ce nom d'utilisateur est déjà enregistré.",
        });
        res.render("users/register", {
          errors: errors,
        });
      } else {
        const newUser = {
          username: req.body.username,
          password: req.body.password,
        };

        bcrypt.genSalt(10, function (req, salt) {
          bcrypt.hash(newUser.password, salt, function (err, hash) {
            if (err) throw err;
            newUser.password = hash;
            new User(newUser).save().then((user) => {
              res.redirect("/users/login");
            });
          });
        });
      }
    });
  }
});

// LOG OUT USER

app.get("/logout", function (req, res) {
  req.logOut();
  res.redirect("/users/login");
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});