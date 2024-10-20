const nodemailer = require("nodemailer");

const sendMailOrderStatusUpdate = async (userMail, newStatus) => {
  const orderStatusMail = `
    <h2>Mise à jour du statut de votre commande sur Shoping-digital</h2>
    <br/>
    <p>Cher(e) ${userMail},</p>
    <br/>
    <p>Le statut de votre commande a été mis à jour :</p>
    <br/>
    <p>Nouveau statut : ${newStatus}</p>
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
      subject: "Mise à jour du statut de commande sur Shoping-digital ✔",
      text: "Le statut de votre commande a été mis à jour",
      html: orderStatusMail,
    });
    console.log("Message sent: %s", info.messageId);
  }

  main().catch(console.error);
};

module.exports = sendMailOrderStatusUpdate;
