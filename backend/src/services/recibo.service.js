const escapeXml = (value) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const formatMoney = (value) => Number(value || 0).toFixed(2);

const generarFolio = () =>
  String(Math.floor(Math.random() * 1000000)).padStart(6, "0");

const generarFechaCfdi = (date = new Date()) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 19);
};

const claveProdServPorProducto = (nombre) => {
  const texto = String(nombre || "").toLowerCase();

  if (texto.includes("pintura")) return "31211500";
  if (texto.includes("taladro")) return "27112703";
  if (texto.includes("destornillador")) return "27111701";
  if (texto.includes("martillo")) return "27111602";
  if (texto.includes("cinta")) return "41114201";

  return "27110000";
};

const generarReciboXml = ({ productos, subtotal, iva, total, usuario, folio = generarFolio() }) => {
  const subtotalCalculado = productos.reduce((acc, item) => {
    const cantidad = Number(item.cantidad || 0);
    const precio = Number(item.precio || item.price || 0);
    return acc + precio * cantidad;
  }, 0);

  const subtotalFinal = Number(subtotal ?? subtotalCalculado);
  const ivaFinal = Number(iva ?? subtotalFinal * 0.16);
  const totalFinal = Number(total ?? subtotalFinal + ivaFinal);
  const fecha = generarFechaCfdi();

  const conceptosXml = productos
    .map((item) => {
      const cantidad = Number(item.cantidad || 0);
      const valorUnitario = Number(item.precio || item.price || 0);
      const importe = valorUnitario * cantidad;
      const ivaProducto = importe * 0.16;
      const descripcion = escapeXml(item.nombre || item.name || "Producto");
      const claveProdServ = item.claveProdServ || claveProdServPorProducto(descripcion);

      return `        <cfdi:Concepto
            ClaveProdServ="${claveProdServ}"
            Cantidad="${cantidad}"
            ClaveUnidad="H87"
            Unidad="Pieza"
            Descripcion="${descripcion}"
            ValorUnitario="${formatMoney(valorUnitario)}"
            Importe="${formatMoney(importe)}"
            ObjetoImp="02">
            <cfdi:Impuestos>
                <cfdi:Traslados>
                    <cfdi:Traslado
                        Base="${formatMoney(importe)}"
                        Impuesto="002"
                        TipoFactor="Tasa"
                        TasaOCuota="0.160000"
                        Importe="${formatMoney(ivaProducto)}" />
                </cfdi:Traslados>
            </cfdi:Impuestos>
        </cfdi:Concepto>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<cfdi:Comprobante
    xmlns:cfdi="http://www.sat.gob.mx/cfd/4"
    Version="4.0"
    Serie="TK"
    Folio="${folio}"
    Fecha="${fecha}"
    SubTotal="${formatMoney(subtotalFinal)}"
    Moneda="MXN"
    Total="${formatMoney(totalFinal)}"
    TipoDeComprobante="I"
    MetodoPago="PUE"
    FormaPago="28"
    LugarExpedicion="44160">

    <cfdi:Emisor
        Rfc="TMK240315AB1"
        Nombre="ToolMarket S.A. de C.V."
        RegimenFiscal="601" />

    <cfdi:Receptor
        Rfc="XAXX010101000"
        Nombre="${escapeXml(usuario?.nombre || "PUBLICO EN GENERAL")}"
        DomicilioFiscalReceptor="44160"
        RegimenFiscalReceptor="605"
        UsoCFDI="G03" />

    <cfdi:Conceptos>
${conceptosXml}
    </cfdi:Conceptos>
    <cfdi:Impuestos TotalImpuestosTrasladados="${formatMoney(ivaFinal)}">
        <cfdi:Traslados>
            <cfdi:Traslado
                Base="${formatMoney(subtotalFinal)}"
                Impuesto="002"
                TipoFactor="Tasa"
                TasaOCuota="0.160000"
                Importe="${formatMoney(ivaFinal)}" />
        </cfdi:Traslados>
    </cfdi:Impuestos>
</cfdi:Comprobante>`;

  return {
    folio,
    filename: `recibo_${folio}.xml`,
    xml,
  };
};

module.exports = { generarReciboXml };
