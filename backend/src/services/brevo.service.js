const brevo = require("@getbrevo/brevo");
const brevoConfig = require("../config/brevo.config");

const crearClienteBrevo = () => {
  if (!brevoConfig.apiKey || !brevoConfig.senderEmail) {
    throw new Error("Configura BREVO_API_KEY y BREVO_SENDER_EMAIL en el .env");
  }

  return new brevo.BrevoClient({
    apiKey: brevoConfig.apiKey,
  });
};

const enviarReciboCompra = async ({ usuario, recibo }) => {
  const client = crearClienteBrevo();

  return client.transactionalEmails.sendTransacEmail({
    sender: {
      name: brevoConfig.senderName,
      email: brevoConfig.senderEmail,
    },
    to: [
      {
        email: usuario.email,
        name: usuario.nombre,
      },
    ],
    subject: `Recibo de compra ${recibo.folio}`,
    htmlContent: `
      <p>Hola ${usuario.nombre},</p>
      <p>Gracias por comprar en ToolMarket. Adjuntamos tu recibo XML.</p>
      <p><strong>Folio:</strong> ${recibo.folio}</p>
    `,
    attachment: [
      {
        name: recibo.filename,
        content: Buffer.from(recibo.xml, "utf8").toString("base64"),
      },
    ],
  });
};

module.exports = { enviarReciboCompra };
