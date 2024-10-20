const nodemailer = require("nodemailer");
const Product = require("../models/Product");

const sendMailOrderConfirmation = async (userMail, orderDetails) => {
  let productsHtml = "";
  for (const product of orderDetails.products) {
    const productName = await Product.findById(product.product);
    productsHtml += `
      <tr style="background-color: #f2f2f2;">
        <td style="text-align: center; padding: 8px; border: 1px solid #dddddd;">${productName.title}</td>
        <td style="text-align: center; padding: 8px; border: 1px solid #dddddd;">${product.color}</td>
        <td style="text-align: center; padding: 8px; border: 1px solid #dddddd;">${product.size}</td>
        <td style="text-align: center; padding: 8px; border: 1px solid #dddddd;">${product.price} €</td>
        <td style="text-align: center; padding: 8px; border: 1px solid #dddddd;">${product.quantity}</td>
      </tr>
    `;
  }
  const orderMail = `
    <h2 style="text-align: center; color: #333;">Confirmation de commande sur Shoping-digital</h2>
    <br/>
    <p>Cher(e) ${userMail},</p>
    <br/>
    <p>Merci pour votre commande sur Shoping-digital. Voici les détails de votre commande :</p>
    <br/>
    <table style="width:80%; margin:auto; border-collapse: collapse; border: 1px solid #dddddd;">
      <tr>
        <th style="text-align: center; padding: 12px; border: 1px solid #dddddd;">Produit</th>
        <th style="text-align: center; padding: 12px; border: 1px solid #dddddd;">Couleur</th>
        <th style="text-align: center; padding: 12px; border: 1px solid #dddddd;">Taille</th>
        <th style="text-align: center; padding: 12px; border: 1px solid #dddddd;">Prix</th>
        <th style="text-align: center; padding: 12px; border: 1px solid #dddddd;">Quantité</th>
      </tr>
      ${productsHtml}
    </table>
    <br/>
    <p style="text-align: center; color: #333;">Total de la commande: ${orderDetails.total} €</p>
    <br/>
    <p>Adresse de livraison: ${orderDetails.shippingAddress}</p>
    <p>Adresse de facturation: ${orderDetails.billingAddress}</p>
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
      subject: "Confirmation de commande sur Shoping-digital ✔",
      text: "Votre commande a été confirmée",
      html: orderMail,
    });
    console.log("Message sent: %s", info.messageId);
  }

  main().catch(console.error);
};

module.exports = sendMailOrderConfirmation;
