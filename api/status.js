const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Use GET' });

  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return res.status(500).json({ error: 'MP_ACCESS_TOKEN não configurado' });

  const { id } = req.query;
  if (!id || !/^\d+$/.test(id)) return res.status(400).json({ error: 'ID inválido' });

  try {
    const result = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.mercadopago.com',
        path: '/v1/payments/' + id,
        method: 'GET',
        headers: { 'Authorization': 'Bearer ' + token }
      };
      const req = https.request(options, (response) => {
        let data = '';
        response.on('data', (chunk) => { data += chunk; });
        response.on('end', () => {
          try { resolve({ status: response.statusCode, data: JSON.parse(data) }); }
          catch (e) { reject(new Error('Resposta inválida')); }
        });
      });
      req.on('error', reject);
      req.end();
    });

    if (result.status >= 400) {
      return res.status(result.status).json({ error: 'Erro ao consultar' });
    }

    return res.status(200).json({
      payment_id: result.data.id,
      status: result.data.status,
      status_detail: result.data.status_detail,
      amount: result.data.transaction_amount
    });
  } catch (err) {
    return res.status(500).json({ error: 'internal_error', detail: err.message });
  }
};
