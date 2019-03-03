const sgmail = require('@sendgrid/mail');
const log = require('./bunyan-config');

//set up api for mail
sgmail.setApiKey(
  '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'
);

async function sendMail(to, camp_id) {
  const msg_send = {
    to: to,
    from: 'campuspreneur-register@ecell.org.in',
    subject: 'Campuspreneur ID',
    // text:
    //   'You are receiving this because you (or someone else) has registered your account.\n\n' +
    //   'Please click on the following link, or paste this into your browser to complete the verfication process:\n\n' +
    //   'http://' +
    //   host + '/' +
    //   route +
    //   '/' +
    //   token +
    //   '\n\n' +
    //   'If you did not request this.\n'
    html: `<html>
    <head>
    <title></title>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <style type="text/css">
      /* FONTS */
        @media screen {
        @font-face {
          font-family: 'Lato';
          font-style: normal;
          font-weight: 400;
          src: local('Lato Regular'), local('Lato-Regular'), url(https://fonts.gstatic.com/s/lato/v11/qIIYRU-oROkIk8vfvxw6QvesZW2xOQ-xsNqO47m55DA.woff) format('woff');
        }
        
        @font-face {
          font-family: 'Lato';
          font-style: normal;
          font-weight: 700;
          src: local('Lato Bold'), local('Lato-Bold'), url(https://fonts.gstatic.com/s/lato/v11/qdgUG4U09HnJwhYI-uK18wLUuEpTyoUstqEm5AMlJo4.woff) format('woff');
        }
        
        @font-face {
          font-family: 'Lato';
          font-style: italic;
          font-weight: 400;
          src: local('Lato Italic'), local('Lato-Italic'), url(https://fonts.gstatic.com/s/lato/v11/RYyZNoeFgb0l7W3Vu1aSWOvvDin1pK8aKteLpeZ5c0A.woff) format('woff');
        }
        
        @font-face {
          font-family: 'Lato';
          font-style: italic;
          font-weight: 700;
          src: local('Lato Bold Italic'), local('Lato-BoldItalic'), url(https://fonts.gstatic.com/s/lato/v11/HkF_qI1x_noxlxhrhMQYELO3LdcAZYWl9Si6vvxL-qU.woff) format('woff');
        }
        }
        
        /* CLIENT-SPECIFIC STYLES */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
    
        /* RESET STYLES */
        img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
    
        /* iOS BLUE LINKS */
        a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
        }
    
        /* ANDROID CENTER FIX */
        div[style*="margin: 16px 0;"] { margin: 0 !important; }
    </style>
    </head>
    <body style="background-color: #f4f4f4; margin: 0 !important; padding: 0 !important;">
    
    <!-- HIDDEN PREHEADER TEXT -->
    <div style="display: none; font-size: 1px; color: #fefefe; line-height: 1px; font-family: 'Lato', Helvetica, Arial, sans-serif; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden;">
    Open this email to get your Referral ID.
    </div>
    
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <!-- LOGO -->
        <tr>
            <td bgcolor="#7c72dc" align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="480" >
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 10px 40px 10px;">
                            <a href="https://ecell.org.in" target="_blank">
                                <img alt="Logo" src="https://ecell.org.in/esummit/assets/white.png" width="200" height="150" style="display: block;  font-family: 'Lato', Helvetica, Arial, sans-serif; color: #ffffff; font-size: 18px;" border="0">
                            </a>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <!-- HERO -->
        <tr>
            <td bgcolor="#7c72dc" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="480" >
                    <tr>
                        <td bgcolor="#ffffff" align="center" valign="top" style="padding: 40px 20px 20px 20px; border-radius: 4px 4px 0px 0px; color: #111111; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; letter-spacing: 4px; line-height: 48px;">
                          <h1 style="font-size: 32px; font-weight: 400; margin: 0;">Campuspreneur Registration</h1>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <!-- COPY BLOCK -->
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="480" >
                  <!-- COPY -->
                  <tr>
                    <td bgcolor="#ffffff" align="left" style="padding: 20px 30px 40px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                      <p style="margin: 0;">Hey Campuspreneurs,<br><br>

                      Thanks for registering! Here is your Referral id<br><br>

                      <b>Referral ID : ${camp_id}</b><br><br>
                      
                      Campuspreneur is our annual Campus Ambassador programme for KIIT E-Summit 2019. It’s an mini-competition testing your marketing & negotiation skills. Following are the guidelines for Campuspreneur ::<br><br>
                      
                      <ol>
                      <li>Pitch E-Summit 2019 to your friends & classmates. The perks of participating in KIIT E-Summit 2019 can be found on our Website, Facebook & Instagram handles.</li>
                      <li>A unique Referral Id will be generated for each candidate. You can use your code for referrals of your friends when they Register & Pay for KIIT E-Summit 2019. </li>
                      <li>The score of each Campuspreneur will be calculated based upon the No. of Payments on each referral Id. Only Payments count not just Registrations. </li>
                      <li>Numerous perks await you for the Top 10 Campuspreneurs!!</li>
                      </ol><br><br>
                      
                      The perks are ::-<br>
                      <ol>
                      <li>Certification will be provided to Top 10 Campuspreneurs</li>
                      <li>Top 3 Campuspreneurs get a Cool T-Shirt & Free Access to our premier event : INTERNSHIP CAMP 2019.</li>
                      <li>Campuspreneurs ranking from 4th-10th will get to sit for Extra 2 Companies.</li>
                      </ol><br>
                      <b>The Rules are Set! The Perks are laid! Game On Campuspreneurs! All the best!</b>
                      <br><br>
                      <b>For any queries contact</b><br>
                      <b>Bhaswati - 8910092228<br>
                      Simran - 8969978775</b>

                        

                    </td>
                  </tr>


        <!-- SUPPORT CALLOUT -->
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 30px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="480" >
                    <!-- HEADLINE -->
                    <tr>
                      <td bgcolor="#C6C2ED" align="center" style="padding: 30px 30px 30px 30px; border-radius: 4px 4px 4px 4px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 18px; font-weight: 400; line-height: 25px;" >
                        <h2 style="font-size: 20px; font-weight: 400; color: #111111; margin: 0;">Need more help?</h2>
                        <p style="margin: 0;"><a href="mailto:techies@ecell.org.in" target="_blank" style="color: #7c72dc;">We&rsquo;re here, ready to talk</a></p>
                      </td>
                    </tr>
                </table>
            </td>
        </tr>
        <!-- FOOTER -->
        <tr>
            <td bgcolor="#f4f4f4" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="480" >
                  
                  <!-- PERMISSION REMINDER -->
                  <tr>
                    <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;" >
                      <p style="margin: 0;">You received this email because you requested a password reset. If you did not, kindly ignore this.</p>
                    </td>
                  </tr>
                  
                  <!-- ADDRESS -->
                  <!-- <tr>
                    <td bgcolor="#f4f4f4" align="left" style="padding: 0px 30px 30px 30px; color: #666666; font-family: 'Lato', Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;" >
                      <p style="margin: 0;">185, Jiraeul-ro, Jijeong-myeon, Wonju-si, Gangwon-do</p>
                    </td>
                  </tr> -->
                </table>
            </td>
        </tr>
    </table>
    
    </body>
    </html>
    `
  };

  try {
    await sgmail.send(msg_send);
    return true;
  } catch (e) {
    log.error(e);
    return false;
  }
}
module.exports = {
  sendMail
};