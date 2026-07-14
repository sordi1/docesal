const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

function getRedis(){
  const { Redis } = require('@upstash/redis');
  return Redis.fromEnv();
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method === 'GET') {
    try {
      const redis = getRedis();
      const saved = await redis.get('disponibilidade');
      const data = saved ? (typeof saved === 'string' ? JSON.parse(saved) : saved) : {};
      return res.status(200).json(data);
    } catch(e) {
      return res.status(200).json({});
    }
  }

  if (req.method === 'POST') {
    if (!ADMIN_PASSWORD) return res.status(500).json({ error: 'ADMIN_PASSWORD não configurado' });

    const { senha, disponibilidade } = req.body || {};
    if (senha !== ADMIN_PASSWORD) return res.status(401).json({ error: 'Senha incorreta' });
    try {
      const redis = getRedis();
      await redis.set('disponibilidade', JSON.stringify(disponibilidade));
      return res.status(200).json({ ok: true });
    } catch(e) {
      return res.status(500).json({ error: 'Erro ao salvar: ' + e.message });
    }
  }

  return res.status(405).json({ error: 'Método não permitido' });
};
