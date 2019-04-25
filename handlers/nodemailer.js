const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'SendGrid',
  auth: {
    user: process.env.SENDGRID_USER,
    pass: process.env.SENDGRID_PASS
  }
})

exports.sendConfimationCode = (email, confirmationCode) => {
  return transporter
    .sendMail({
      to: email,
      from: '"Ye" <ye@ye.com>',
      subject: 'Please, confirm your account, -YE',
      html: confirmationCode
    })
    .then(r => r)
    .catch(e => e)
}
