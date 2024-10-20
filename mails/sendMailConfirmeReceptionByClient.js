const nodemailer = require("nodemailer");

const sendMailOrderConfirmation = async (userMail) => {
  const confirmationThanksMail = `
    <h2>Confirmation de réception</h2>
    <br/>
    <p>Cher(e) ${userMail},</p>
    <br/>
    <p>Merci d'avoir confirmé la réception de votre commande sur Shoping-digital !</p>
    <br/>
    <p>Nous apprécions votre confiance et espérons que les produits répondent à vos attentes.</p>
    <br/>
    <p>N'hésitez pas à nous contacter si vous avez des questions.</p>
    <br/>
    <p>Merci encore et à bientôt sur Shoping-digital !</p>
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
      subject: "Confirmation de réception de commande sur Shoping-digital ✔",
      text: "Merci d'avoir confirmé la réception de votre commande",
      html: confirmationThanksMail,
    });
    console.log("Message envoyé : %s", info.messageId);
  }

  main().catch(console.error);
};

module.exports = sendMailOrderConfirmation;
