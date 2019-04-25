const router = require('express').Router()
const passport = require('../handlers/passport')
const User = require('../models/User')
const { sendConfimationCode } = require('../handlers/nodemailer')
const uploadCloud = require('../handlers/cloudinary')

router.get('/signup', (req, res, next) => {
  const config = { title: 'Sign up', action: '/signup', sign: true }
  res.render('auth/sign', config)
})

router.get('/login', (req, res, next) => {
  const config = { title: 'Log in', action: '/login' }
  res.render('auth/sign', config)
})

router.post('/signup', uploadCloud.single('photoURL'), (req, res, next) => {
  User.register(
    { ...req.body, photoURL: req.file.secure_url },
    req.body.password
  )
    .then(user => {
      confirmationCode = `${user._id}${user.email}`
      User.findByIdAndUpdate(user._id, { confirmationCode }, { new: true })
        .then(({ email, confirmationCode }) => {
          sendConfimationCode(
            email,
            `<a href="http://localhost:3000/activate/${confirmationCode}"> Click me </a>`
          )
            .then(() => res.send('Correo enviado'))
            .catch(err => next(err))
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
})

router.post('/login', passport.authenticate('local'), (req, res, next) => {
  res.redirect('/profile')
})

router.get('/profile', isActive, (req, res, next) => {
  res.send(`
    <img src="${req.user.photoURL}" />
  `)
})

router.get('/activate/:confirmationCode', (req, res, next) => {
  const { confirmationCode } = req.params
  User.findOneAndUpdate(
    { confirmationCode },
    { status: 'Active' },
    { new: true }
  )
    .then(() => {
      res.redirect('/login')
    })
    .catch(err => next(err))
})

function isActive(req, res, next) {
  if (!req.isAuthenticated()) return res.redirect('/login')
  if (req.user.status !== 'Active')
    return res.send('Por favor confirma tu cuenta en tu correo')
  next()
}

module.exports = router
