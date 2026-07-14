const https = require('https');

function mpRequest(path, method, token, body) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'api.mercadopago.com',
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    };
    if (method === 'POST') {
      options.headers['X-Idempotency-Key'] = 'pelizzari-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      if (payload) options.headers['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          reject(new Error('Resposta inválida: ' + data.substring(0, 200)));
        }
      });
    });
    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado' });

  try {
    const { amount, description, payer_email } = req.body || {};
    if (!amount || amount < 1) return res.status(400).json({ error: 'Valor inválido' });

    const result = await mpRequest('/v1/payments', 'POST', token, {
      transaction_amount: parseFloat(amount),
      description: description || 'Pedido Pelizzari',
      payment_method_id: 'pix',
      payer: { email: payer_email || 'cliente@pelizzari.com' }
    });

    if (result.status >= 400) {
      return res.status(result.status).json({
        error: 'Erro Mercado Pago',
        detail: result.data.message || JSON.stringify(result.data)
      });
    }

    const pix = result.data.point_of_interaction && result.data.point_of_interaction.transaction_data;

    return res.status(200).json({
      payment_id: result.data.id,
      status: result.data.status,
      qr_code: pix ? pix.qr_code : null,
      qr_code_base64: pix ? pix.qr_code_base64 : null,
      amount: result.data.transaction_amount
    });
  } catch (err) {
    return res.status(500).json({ error: 'internal_error', detail: err.message });
  }
};
