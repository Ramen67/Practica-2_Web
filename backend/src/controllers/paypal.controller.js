const {
  createPaypalOrder,
  capturePaypalOrder,
  updateProductStock,
  recordPurchase,
} = require("../services/paypal.service.js");

async function createOrder(req, res) {
  try {
    const { items, subtotal, iva, total } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "El carrito está vacío",
      });
    }

    if (!total || Number(total) <= 0) {
      return res.status(400).json({
        error: "El total es inválido",
      });
    }

    const order = await createPaypalOrder({ items, subtotal, iva, total });

    console.log("Order recibida:", JSON.stringify(order, null, 2));

    if (!order || !order.id) {
      return res.status(500).json({
        error: "PayPal no retornó una orden válida",
        detalle: order,
      });
    }

    res.status(200).json({
      id: order.id,
      status: order.status,
    });
  } catch (error) {
    console.error("Error en createOrder:", error.message);
    console.log(req.body);
    res.status(500).json({
      error: "No se pudo crear la orden",
      detalle: error.message,
    });
  }
}

async function captureOrder(req, res) {
  try {
    const { orderId, items, total } = req.body;

    if (!orderId) {
      return res.status(400).json({
        error: "orderId es obligatorio",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        error: "items es obligatorio",
      });
    }

    if (!total || Number(total) <= 0) {
      return res.status(400).json({
        error: "total es obligatorio y debe ser mayor a 0",
      });
    }

    // Capturar la orden en PayPal
    const captureData = await capturePaypalOrder(orderId);

    // Contar el total de productos
    const amountProducts = items.reduce(
      (sum, item) => sum + (item.quantity || item.cantidad || 0),
      0,
    );

    // Actualizar stock de los productos
    await updateProductStock(items);

    // Registrar la compra
    const purchase = await recordPurchase(total, amountProducts);

    res.status(200).json({
      success: true,
      paypalCapture: captureData,
      purchase: purchase,
    });
  } catch (error) {
    console.error("Error en captureOrder:", error.message);

    res.status(500).json({
      error: "No se pudo capturar la orden",
      detalle: error.message,
    });
  }
}

module.exports = { createOrder, captureOrder };
