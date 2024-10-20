const nodemailer = require("nodemailer");
const admin = "saberghoudi2222@gmail.com";
const sendMailReclamationConfirmation = async (
  userMail,
  reclamationDetails
) => {
  const reclamationMail = `
    <h2 style="text-align: center; color: #333;">Confirmation de réclamation sur Shoping-digital</h2>
    <br/>
    <p>Cher(e) ${userMail},</p>
    <br/>
    <p>Votre réclamation a été envoyée. Voici les détails :</p>
    <br/>
    <p><strong>Nom:</strong> ${reclamationDetails.nom}</p>
    <p><strong>Email:</strong> ${reclamationDetails.email}</p>
    <p><strong>Numéro de commande:</strong> ${reclamationDetails.commande}</p>
    <p><strong>Message:</strong> ${reclamationDetails.message}</p>
    <br/>
    <p>Nous vous remercions pour votre confiance !</p>
    <h3>L'équipe Shoping-digital</h3>
  `;

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
      bcc: process.env.MAIL_ADMIN_RECLAMATION,
      subject: "Confirmation de réclamation sur Shoping-digital ✔",
      text: "Votre réclamation a été confirmée",
      html: reclamationMail,
    });
    console.log("Message sent: %s", info.messageId);
  }

  main().catch(console.error);
};

module.exports = sendMailReclamationConfirmation;
