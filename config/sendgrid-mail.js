const sgmail = require('@sendgrid/mail');

//set up api for mail
sgmail.setApiKey(
  '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'
);

async function sendMail(token, to, host) {
  const msg_send = {
    to: to,
    from: 'KIIT E-Cell',
    subject: 'KIIT E-Cell email verify',
    text:
      'You are receiving this because you (or someone else) has registered your account.\n\n' +
      'Please click on the following link, or paste this into your browser to complete the verfication process:\n\n' +
      'http://' +
      host +
      '/api/verify/' +
      token +
      '\n\n' +
      'If you did not request this.\n'
  };

  try {
    await sgmail.send(msg_send);
    return true;
  } catch (e) {
    console.log('ERROR SENDING MAIL');
    return false;
  }
}

module.exports = sendMail;