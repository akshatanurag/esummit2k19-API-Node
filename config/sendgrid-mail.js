const sgmail = require('@sendgrid/mail');
const log = require('./bunyan-config')

//set up api for mail
sgmail.setApiKey(
  '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'
);


  async function sendMail(token, to, host,route) {
    const msg_send = {
      to: to,
      from: 'esummit@ecell.org.in',
      subject: 'KIIT E-Cell email verify',
      text:
        'You are receiving this because you (or someone else) has registered your account.\n\n' +
        'Please click on the following link, or paste this into your browser to complete the verfication process:\n\n' +
        'http://' +
        host +
        '/api/'+ route + '/' +
        token +
        '\n\n' +
        'If you did not request this.\n'
    };
  
    try {
      await sgmail.send(msg_send);
      return true;
    } catch (e) {
      log.error(e)
      return false;
    }
  }
  module.exports = {sendMail}
