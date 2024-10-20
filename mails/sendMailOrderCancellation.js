const nodemailer = require("nodemailer");

const sendMailOrderCancellation = async (userMail) => {
  const orderCancellationMail = `
    <h2>Annulation de commande sur Shoping-digital</h2>
    <br/>
    <p>Cher(e) ${userMail},</p>
    <br/>
    <p>Votre commande a été annulée avec succès.</p>
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
      subject: "Annulation de commande sur Shoping-digital ✔",
      text: "Votre commande a été annulée",
      html: orderCancellationMail,
    });
    console.log("Message sent: %s", info.messageId);
  }

  main().catch(console.error);
};

module.exports = sendMailOrderCancellation;
