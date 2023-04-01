const pug = require('pug');
const htmlToText = require('html-to-text');
const nodemailer = require('nodemailer');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstname = user.name.split(' ')[0];
    this.url = url;
    this.from = `Chandan<${process.env.EMAIL_FROM}>`;
  }
  newTransport() {
    if (process.env.NODE_ENV === 'production') {
      return nodemailer.createTransport({
        service:'SendGrid',
        auth:{
          user: process.env.SENDGRID_USERNAME,
          pass: process.env.SENDGRID_PASSWORD,
        }
      })
    }
    return nodemailer.createTransport({
      // service: 'Gmail',
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },

      //activate in gmail "less secure app" option
    });
  }
  async send(template, subject) {
    //render htm based on pug template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstname: this.firstname,
      url: this.url,
      subject,
    });

    //define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: htmlToText.fromString(html),
    };

    //create template and send email

    await this.newTransport().sendMail(mailOptions);
  }
  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours family');
  }
  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'YOur password reset token valid only for 10 minute'
    );
  }
};

const sendEmail = async (options) => {
  //create transporter
  // const transporter = nodemailer.createTransport({
  //   // service: 'Gmail',
  //   host: process.env.EMAIL_HOST,
  //   port: process.env.EMAIL_PORT,
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },

  //   //activate in gmail "less secure app" option
  // });
  const mailOptions = {
    name: 'Chandan Singh <chandan.uidevops@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };
  //actually send the email

  await transporter.sendMail(mailOptions);
};
// module.exports = sendEmail;
