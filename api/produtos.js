const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'pelizzari2024';

const PRODUTOS_PADRAO = [
  { id:'copo-tradicional', category:'copo', name:'Salgados no Copo — Tradicional', desc:'Coxinha de frango, kibe e bolinha de queijo.', price:12.00, unit:'por unidade', meta:['3 salgados'], type:'copo_tipo', ativo:true },
  { id:'copo-especial', category:'copo', name:'Salgados no Copo — Especial', desc:'Coxinha de cheddar, croquete de queijo com presunto e croquete de carne.', price:15.00, unit:'por unidade', meta:['Premium'], type:'copo_tipo', ativo:true },
  { id:'churros-copo', category:'copo', name:'Churros no Copo', desc:'Churros crocante servido no copo com recheio cremoso à escolha.', price:15.00, unit:'por unidade', meta:['Doce'], type:'variant', flavors:['Creme de avelã','Doce de leite','Chocolate'], ativo:true },
  { id:'combo1', category:'combos', name:'Combo 1', desc:'2 copos tradicionais + 2 latas de refri à sua escolha.', price:30.00, unit:'combo', meta:['Econômico'], type:'combo', comboItems:['2x Copo Tradicional'], refriQty:2, ativo:true },
  { id:'combo2', category:'combos', name:'Combo 2', desc:'1 copo tradicional + 1 copo especial + 2 latas de refri à sua escolha.', price:34.50, unit:'combo', meta:['Popular'], type:'combo', comboItems:['1x Copo Tradicional','1x Copo Especial'], refriQty:2, ativo:true },
  { id:'combo3', category:'combos', name:'Combo 3', desc:'1 copo tradicional + 1 copo especial + 1 churros + 2 latas de refri.', price:48.50, unit:'combo', meta:['Completo'], type:'combo', comboItems:['1x Copo Tradicional','1x Copo Especial','1x Churros no Copo'], refriQty:2, ativo:true },
  { id:'cento-doces', category:'centos', name:'Cento de Doces', desc:'Brigadeiros cremosos feitos com ingredientes de qualidade.', price:95.00, unit:'a partir de 25 un', meta:['11 sabores'], type:'brigadeiro', delivery:'Combinar prazo', ativo:true },
  { id:'cento-salgados', category:'centos', name:'Cento de Salgados', desc:'Salgados artesanais com massa leve e recheio bem temperado.', price:95.00, unit:'a partir de 35 un', meta:['9 recheios'], type:'salgado', delivery:'Combinar prazo', ativo:true },
  { id:'bolo-pote', category:'bolo', name:'Bolo de pote', desc:'Camadas generosas de bolo fofinho e recheio cremoso.', price:10.00, unit:'por unidade', meta:['4 sabores'], type:'variant', flavors:['Brigadeiro com maracujá','Brigadeiro com morango','Prestígio','Brigadeiro'], ativo:true }
];

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
      const saved = await redis.get('produtos');
      if (saved) {
        const data = typeof saved === 'string' ? JSON.parse(saved) : saved;
        return res.status(200).json(data);
      }
      return res.status(200).json(PRODUTOS_PADRAO);
    } catch(e) {
      return res.status(200).json(PRODUTOS_PADRAO);
    }
  }

  if (req.method === 'POST') {
    const { senha, produtos } = req.body || {};
    try {
      const redis = getRedis();
      await redis.set('produtos', JSON.stringify(produtos));
    } catch(e) {
    }
  }

};
