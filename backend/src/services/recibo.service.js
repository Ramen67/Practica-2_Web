const escapeXml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const formatMoney = (value) => Number(value || 0).toFixed(2);

const generarFolio = () =>
  `TK-${String(Math.floor(Math.random() * 1000000)).padStart(6, "0")}`;

const generarReciboXml = ({ productos, subtotal, iva, total, usuario, folio = generarFolio() }) => {
  const subtotalCalculado = productos.reduce((acc, item) => {
    const cantidad = Number(item.cantidad || 0);
    const precio = Number(item.precio || item.price || 0);
    return acc + precio * cantidad;
  }, 0);
  const subtotalFinal = Number(subtotal ?? subtotalCalculado);
  const ivaFinal = Number(iva ?? subtotalFinal * 0.16);
  const totalFinal = Number(total ?? subtotalFinal + ivaFinal);
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString("es-MX");
  const hora = ahora.toLocaleTimeString("es-MX");

  const productosXml = productos
    .map((item) => {
      const cantidad = Number(item.cantidad || 0);
      const precio = Number(item.precio || item.price || 0);
      const subtotalProducto = precio * cantidad;

      return `    <producto>
      <nombre>${escapeXml(item.nombre || item.name)}</nombre>
      <cantidad>${cantidad}</cantidad>
      <precio>$${formatMoney(precio)}</precio>
      <subtotal>$${formatMoney(subtotalProducto)}</subtotal>
    </producto>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<recibo>
  <empresa>
    <nombre>ToolMarket S.A. de C.V.</nombre>
    <rfc>CTC240315AB1</rfc>
    <direccion>Av Niño Obrero 616</direccion>
    <codigoPostal>45040</codigoPostal>
  </empresa>

  <encabezado>
    <folio>${folio}</folio>
    <fecha>${fecha}</fecha>
    <hora>${hora}</hora>
  </encabezado>

  <cliente>
    <nombre>${escapeXml(usuario.nombre)}</nombre>
    <email>${escapeXml(usuario.email)}</email>
    <domicilio>${escapeXml(usuario.domicilio)}</domicilio>
  </cliente>

  <productos>
${productosXml}
  </productos>

  <resumen>
    <subtotal>$${formatMoney(subtotalFinal)}</subtotal>
    <iva>$${formatMoney(ivaFinal)}</iva>
    <total>$${formatMoney(totalFinal)}</total>
  </resumen>

  <pago>
    <metodo>PayPal</metodo>
    <formaSAT>28 - Tarjeta de debito</formaSAT>
  </pago>

  <aviso>
    <mensaje>Conserve este ticket para cualquier aclaracion o facturacion.</mensaje>
  </aviso>
</recibo>`;

  return {
    folio,
    filename: `recibo_${folio}.xml`,
    xml,
  };
};

module.exports = { generarReciboXml };
