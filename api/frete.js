const https = require('https');

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Use POST' });

  const apiKey = process.env.GOOGLE_MAPS_KEY;
  if (!apiKey) return res.status(500).json({ error: 'GOOGLE_MAPS_KEY não configurado' });

  try {
    const { address } = req.body || {};
    if (!address || address.length < 5) return res.status(400).json({ error: 'Endereço inválido' });

    const origin = encodeURIComponent('Rua Gennaro Sarti, 80 - Nereu Ramos, Jaraguá do Sul, SC');
    const dest = encodeURIComponent(address + ', Jaraguá do Sul, SC');

    const url = `/maps/api/distancematrix/json?origins=${origin}&destinations=${dest}&key=${apiKey}&language=pt-BR`;

    const data = await new Promise((resolve, reject) => {
      https.get({ hostname: 'maps.googleapis.com', path: url }, (response) => {
        let body = '';
        response.on('data', (chunk) => { body += chunk; });
        response.on('end', () => {
          try { resolve(JSON.parse(body)); }
          catch (e) { reject(new Error('Resposta inválida')); }
        });
      }).on('error', reject);
    });

    if (data.status !== 'OK' || !data.rows || !data.rows[0] || !data.rows[0].elements || !data.rows[0].elements[0]) {
      return res.status(400).json({ error: 'Não foi possível calcular a distância', detail: data.status });
    }

    const element = data.rows[0].elements[0];
    if (element.status !== 'OK') {
      return res.status(400).json({ error: 'Endereço não encontrado', detail: element.status });
    }

    const distMeters = element.distance.value;
    const distKm = Math.ceil(distMeters / 1000 * 10) / 10; // arredonda pra cima 1 casa
    const frete = Math.round(distKm * 1.80 * 100) / 100;

    return res.status(200).json({
      distance_km: distKm,
      distance_text: element.distance.text,
      duration_text: element.duration.text,
      frete: frete,
      origin: data.origin_addresses[0],
      destination: data.destination_addresses[0]
    });
  } catch (err) {
    return res.status(500).json({ error: 'internal_error', detail: err.message });
  }
};
