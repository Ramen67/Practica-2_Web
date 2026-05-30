const { paypalConfig } = require("../config/paypal.config");
const db = require("../config/db");

function getBasicAuth() {
  return Buffer.from(
    `${paypalConfig.clientId}:${paypalConfig.clientSecret}`,
  ).toString("base64");
}

async function getAccessToken() {
  const response = await fetch(`${paypalConfig.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getBasicAuth()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error obteniendo access token: ${JSON.stringify(data)}`);
  }

  return data.access_token;
}

async function createPaypalOrder(orderData) {
  const accessToken = await getAccessToken();

  const normalizedItems = orderData.items.map((item) => {
    const name = item.name ?? item.nombre;
    const quantity = Number(item.quantity ?? item.cantidad ?? 0);
    const price = Number(item.price ?? item.precio ?? 0);

    if (!name) throw new Error(`Item sin nombre: ${JSON.stringify(item)}`);
    if (isNaN(price))
      throw new Error(`Precio inválido en item: ${JSON.stringify(item)}`);
    if (isNaN(quantity))
      throw new Error(`Cantidad inválida en item: ${JSON.stringify(item)}`);

    return { name, quantity, price };
  });

  const itemTotal = normalizedItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  );
  const taxTotal = Number(orderData.iva ?? itemTotal * 0.16);
  const orderTotal = Number(orderData.total ?? itemTotal + taxTotal);

  const body = {
    intent: "CAPTURE",
    purchase_units: [
      {
        amount: {
          currency_code: "MXN",
          value: orderTotal.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "MXN",
              value: itemTotal.toFixed(2),
            },
            tax_total: {
              currency_code: "MXN",
              value: taxTotal.toFixed(2),
            },
          },
        },
        items: normalizedItems.map((item) => ({
          name: item.name,
          quantity: String(item.quantity),
          unit_amount: {
            currency_code: "MXN",
            value: item.price.toFixed(2),
          },
        })),
      },
    ],
  };
  const response = await fetch(`${paypalConfig.baseUrl}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error creando orden PayPal: ${JSON.stringify(data)}`);
  }

  return data;
}

async function capturePaypalOrder(orderId) {
  const accessToken = await getAccessToken();

  const response = await fetch(
    `${paypalConfig.baseUrl}/v2/checkout/orders/${orderId}/capture`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Error capturando orden PayPal: ${JSON.stringify(data)}`);
  }

  return data;
}

// Función para actualizar el stock de los productos
async function updateProductStock(items) {
  return new Promise((resolve, reject) => {
    try {
      items.forEach((item) => {
        const productId = item.id || item.productId;
        const quantity = Number(item.quantity || item.cantidad || 0);

        if (!productId) {
          reject(new Error(`Producto sin ID: ${JSON.stringify(item)}`));
          return;
        }

        const sql = "UPDATE productos SET stock = stock - ? WHERE id = ?";
        db.query(sql, [quantity, productId], (error, result) => {
          if (error) {
            reject(new Error(`Error actualizando stock: ${error.message}`));
            return;
          }

          const checkSql = "SELECT stock FROM productos WHERE id = ?";
          db.query(checkSql, [productId], (error, rows) => {
            if (error) {
              reject(new Error(`Error verificando stock: ${error.message}`));
              return;
            }

            if (rows[0].stock <= 0) {
              const updateInStock = "UPDATE productos SET inStock = 0 WHERE id = ?";
              db.query(updateInStock, [productId], (error) => {
                if (error) {
                  reject(new Error(`Error actualizando inStock: ${error.message}`));
                }
              });
            }
          });
        });
      });

      resolve(true);
    } catch (error) {
      reject(error);
    }
  });
}
// Función para registrar la compra en la tabla compras
async function recordPurchase(total, amountProducts) {
  return new Promise((resolve, reject) => {
    const sql = "INSERT INTO compras (total, amountProducts) VALUES (?, ?)";

    db.query(
      sql,
      [parseInt(total), parseInt(amountProducts)],
      (error, result) => {
        if (error) {
          reject(new Error(`Error registrando compra: ${error.message}`));
          return;
        }
        resolve({
          id: result.insertId,
          total: parseInt(total),
          amountProducts: parseInt(amountProducts),
        });
      },
    );
  });
}

module.exports = {
  getAccessToken,
  createPaypalOrder,
  capturePaypalOrder,
  updateProductStock,
  recordPurchase,
};
