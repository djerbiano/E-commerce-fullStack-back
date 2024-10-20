const nodemailer = require('nodemailer');

const sendMailContact = async (userMail, contactDetails) => {
  const contactMail = `
    <h2 style="text-align: center; color: #333;">Nous avons bien reçu votre message</h2>
    <br/>
    <p>De: ${contactDetails.nom} &lt;${contactDetails.email}&gt;</p>
    <br/>
    <p><strong>Message:</strong></p>
    <p>${contactDetails.message}</p>
    <br/>
    <p>Merci pour votre intérêt !</p>
    <h3>L'équipe Shoping-digital</h3>
  `;

  const user = process.env.ADMIN_EMAIL;
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
  });

  
  async function main() {
    const info = await transporter.sendMail({
      from: '"Shoping-digital 👻" <admin@Shoping-digital.com>',
      to: `${userMail}, ${user}`,
      bcc:process.env.MAIL_ADMIN_CONTACT_FORM,
      subject: 'Nouveau message de contact sur Shoping-digital',
      text: 'Nouveau message de contact',
      html: contactMail,
    });
    console.log('Message sent: %s', info.messageId);
  }

  main().catch(console.error);
};

module.exports = sendMailContact;
