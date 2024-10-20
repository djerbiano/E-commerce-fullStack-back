const nodemailer = require("nodemailer");

const sendMailCreateCompte = function (Mail) {
  const likeMail = ` 
  <h2>Bienvenue sur Shoping-digital</h2>
  <br/>
  <p>Cher(e) ${Mail},</p>
  <br/>
  <p>Félicitations ! Vous avez rejoint Shoping-digital.</p>
  <br/>
  <p>Connectez-vous dès maintenant pour découvrir toutes les fonctionnalités</p>
  <br/>
  <p>Si vous avez des questions, n'hésitez pas à nous contacter.</p>
  <br/>
  <br/>
  <br/>
  <h3>L'équipe Shoping-digital</h3>
   
    `;
  const userMail = Mail;
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.ADMIN_EMAIL,
      pass: process.env.ADMIN_EMAIL_PASSWORD,
    },
  });
  async function main() {
    const info = await transporter.sendMail({
      from: '"Shoping-digital 👻" <admin@Shoping-digital.com>',
      to: userMail,
      subject: "Shoping-digital ✔",
      text: "Compte creé",
      html: likeMail,
    });
    console.log("Message sent: %s", info.messageId);
  }

  main().catch(console.error);
};

module.exports = sendMailCreateCompte;
