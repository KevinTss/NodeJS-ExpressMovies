const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const multer = require('multer')
const upload = multer()
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')
const mongoose = require('mongoose')

mongoose.connect('mongodb://kevin:Xxrv2ayn@ds111072.mlab.com:11072/expressmovies')
const db = mongoose.connection
db.on('error', console.error.bind(console, 'connection failed gros'))
db.once('open', () => {
  console.log('connected !!!!')
})

const PORT = 3000 
const secret = 'qsdjS12ozehdoIJ123DJOZJLDSCqsdeffdg123ER56SDFZedhWXojqshduzaohduihqsDAqsdq'

let films = []

app.use('/public', express.static('public'))
const urlencodedParser = bodyParser.urlencoded({ extended: false })
app.use(expressJwt({ secret: secret }).unless({ path: ['/', '/movies', '/s', '/login'] }))

app.set('views', './views')
app.set('view engine', 'ejs')


app.get('/movies', (req, res) => {
  res.render('movies', {movies: films})
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
    console.log('res', data)
    const newFilm = {title: req.body.title, year: req.body.year}
    films = [...films, newFilm]
    return res.sendStatus(201)
  } else {
    return res.sendStatus(500)
  }
})
app.get('/movies/add', (req, res) => {
  res.send(`add a movie`)
})
app.get('/movies/:id', (req, res) => {
  const id = req.params.id
  res.render(`movie-details`, {movieId: id})
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