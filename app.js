const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer()
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const mongoose = require('mongoose')
const faker = require('faker')
const config = require('./config')

mongoose.connect(`mongodb://${config.db.user}:${config.db.password}@ds111072.mlab.com:11072/expressmovies`)
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection failed gros'))
db.once('open', () => {
  console.log('connected !!!!')
})

const moviesSchema = mongoose.Schema({
  movietitle: String,
  movieyear: Number
})

const Movie = mongoose.model('Movie', moviesSchema)


const PORT = 3000 
const secret = 'qsdjS12ozehdoIJ123DJOZJLDSCqsdeffdg123ER56SDFZedhWXojqshduzaohduihqsDAqsdq'

let films = []

app.use('/public', express.static('public'))
const jsonParser = bodyParser.json()
const urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(expressJwt({ secret: secret }).unless({ path: ['/', '/movies', '/s', '/login', new RegExp('/movies.*/', 'i')] }))

app.set('views', './views')
app.set('view engine', 'ejs')


app.get('/movies', (req, res) => {

  Movie.find((err, movies) => {
    if (err) {
      console.log('error finding movies')
      res.sendStatus(500)
    } else {
      films = movies
      res.render('movies', {movies: films})
    }
  })
})
// app.post('/movies', urlencodedParser, (req, res) => {
//   const newFilm = {title: req.body.title, year: req.body.year}
//   films = [...films, newFilm]
//   console.log(films)
//   res.sendStatus(201)
// })
app.post('/movies', upload.fields([]), (req, res) => {
  if (req.body) {
    const data = req.body
    const myMovie = new Movie({movietitle: req.body.title, movieyear: req.body.year})
    myMovie.save((err, savedMovie) => {
      if (err) {
        console.log(err)
      } else {
        return res.sendStatus(201)
      }
    })
  } else {
    return res.sendStatus(500)
  }
})
app.get('/movies/:id', (req, res) => {
  const id = req.params.id
  Movie.findById(id, (err, movie) => {
    if (err) {
      res.sendStatus(404)
    } else {
      res.render(`movie-details`, {movie: movie})
    }
  })
})

app.post('/movies/:id', upload.fields([]), (req, res) => {
  if (req.body) {
    const id = req.params.id
    Movie.findByIdAndUpdate(id, {$set: {movietitle: req.body.movietitle, movieyaer: req.body.movieyear}}, {new: true}, (err, movie) => {
      if (err) {
        console.log('err', err)
        return res.send('Not udpate sorry')
      } 
      res.redirect('/movies')
    })
  } else {
    return res.sendStatus(500)
  }
})

app.get('/s', (req, res) => {
  res.render('s')
})
app.get('/login', (req, res) => {
  res.render('login', {title: 'connexion'})
})

const fakeUser = {email: 'kev@kev.com', pwd: 'azerty'}

app.post('/login', urlencodedParser, (req, res) => {
  if (req.body) {
    const credientials = {email: req.body.email, pwd: req.body.password}
    if (credientials.email === fakeUser.email && credientials.pwd === fakeUser.pwd) {
      const myToken = jwt.sign({iss: 'http://expressmovie.com', user: 'sami', role: 'modo'}, secret)
      res.json(myToken)
    } else {
      res.sendStatus(401)
    }
  } else {
    res.sendStatus(500)
  }
})
app.get('/', (req, res) => {
  res.render('index') 
})

app.get('/member-only', (req, res) => {
  console.log('req.user', req.user)
  res.send(req.user)
})

app.listen(PORT, () => {
  console.log(`App is running on port ${PORT}`)
})