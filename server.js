const express = require("express");
const app = express();
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('express-flash');

mongoose.connect('mongodb://localhost/capybara_dashboard', {useNewUrlParser: true});

const CapybaraSchema = new mongoose.Schema({
    name: {type: String, required: true, minLength: 1},
    weight: {type: Number, required: true, min: 0},
    desc: String
   }, {timestamps: true})
   // create an object to that contains methods for mongoose to interface with MongoDB
   const Capybara = mongoose.model('Capybara', CapybaraSchema);

app.use(express.static(__dirname + "/static"));
app.use(express.urlencoded({extended: true}));
app.use(flash());
app.use(session({
  secret: 'keyboardkitteh',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 60000 }
}))

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.get('/', (req, res) => {  
    Capybara.find()
    .then(data => res.render("index", {capybaras: data}))
    .catch(err => res.json(err));  
});

app.get('/capybaras/new', (req, res) => {
    res.render("add");
});

app.get('/capybaras/destroy/:id', (req, res) => {
    Capybara.remove({"_id": req.params.id})
        .then(data => res.redirect("/"))
        .catch(err => res.json(err));  
});

app.post('/capybaras', (req,res) => {
    const capybara = new Capybara();
    capybara.name = req.body.name;
    capybara.weight = parseInt(req.body.weight, 10);
    capybara.desc = req.body.desc;
    capybara.save()
      .then(newUserData => {
        console.log('capybara created: ', newUserData)
        res.redirect('/');
        })
      .catch(err => {
        console.log("We have an error!", err);
        for (var key in err.errors) {
            req.flash('registration', err.errors[key].message);
        }
        res.redirect('/capybaras/new');
      });
});

app.get('/capybaras/edit/:id', (req, res) => {
    Capybara.findOne({"_id": req.params.id})
        .then(data => res.render("edit", {capybara: data}))
        .catch(err => res.json(err));  
});

app.get('/capybaras/:id', (req, res) => {
    Capybara.findOne({"_id": req.params.id})
        .then(data => res.render("details", {capybara: data}))
        .catch(err => res.json(err));  
  });

app.post('/capybaras/:id', (req, res) => {
    Capybara.update({"_id": req.params.id}, {$set: {
        name: req.body.name,
        weight: req.body.weight,
        desc: req.body.desc
    }})
    .then(data => res.redirect("/capybaras/" + req.params.id))
    .catch(err => {
        console.log("We have an error!", err);
        for (var key in err.errors) {
            req.flash('registration', err.errors[key].message);
        }
        res.redirect('/capybaras/edit' + req.params.id);
      });  
});

app.listen(8000, () => console.log("listening on port 8000"));