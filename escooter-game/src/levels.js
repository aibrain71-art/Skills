// Level definitions. Segment lengths must be multiples of 40 (chunk size).
// Segment types: street | mall | shop
export const LEVELS = [
  {
    name: 'Erste Runde',
    desc: 'Eine ruhige Quartierstraße. Lerne lenken, springen und sammeln.',
    segments: [{ type: 'street', len: 520 }],
    sky: '#8fd3ff', night: false, density: 0.55, traffic: 0.2, time: 75, target: 1400, seed: 11,
    list: { apple: 4, donut: 2 }, pool: ['apple', 'donut', 'bag'],
  },
  {
    name: 'Rushhour',
    desc: 'Die Hauptstraße ist voll! Autos, Fußgänger und Baustellen.',
    segments: [{ type: 'street', len: 760 }],
    sky: '#ffd6a5', night: false, density: 0.75, traffic: 0.7, time: 85, target: 2400, seed: 22,
    list: { bag: 4, pizza: 3 }, pool: ['bag', 'pizza', 'phone', 'apple'],
  },
  {
    name: 'Ab in die Mall',
    desc: 'Von der Straße direkt durch die Schiebetüren ins Einkaufszentrum.',
    segments: [{ type: 'street', len: 320 }, { type: 'mall', len: 520 }],
    sky: '#9ad1ff', night: false, density: 0.75, traffic: 0.5, time: 90, target: 3000, seed: 33,
    list: { shoe: 3, gift: 3 }, pool: ['shoe', 'gift', 'bag', 'phone'],
  },
  {
    name: 'Supermarkt-Slalom',
    desc: 'Zwischen Regalen, Einkaufswagen und nassen Böden durch den Supermarkt.',
    segments: [{ type: 'shop', len: 760 }],
    sky: '#cfe6ff', night: false, density: 0.85, traffic: 0, time: 90, target: 3200, seed: 44,
    list: { apple: 5, pizza: 3, donut: 3 }, pool: ['apple', 'pizza', 'donut'],
  },
  {
    name: 'Shopping-Marathon',
    desc: 'Straße, Mall, Supermarkt und wieder raus – alles in einer Fahrt!',
    segments: [{ type: 'street', len: 280 }, { type: 'mall', len: 360 }, { type: 'shop', len: 320 }, { type: 'mall', len: 240 }],
    sky: '#a0e7ff', night: false, density: 0.85, traffic: 0.6, time: 110, target: 4800, seed: 55,
    list: { gift: 3, shoe: 3, apple: 3 }, pool: ['gift', 'shoe', 'apple', 'bag', 'phone', 'donut'],
  },
  {
    name: 'Nachtschicht',
    desc: 'Die Stadt leuchtet. Nur dein Scheinwerfer und die Laternen zeigen den Weg.',
    segments: [{ type: 'street', len: 400 }, { type: 'mall', len: 360 }, { type: 'street', len: 280 }],
    sky: '#0d1530', night: true, density: 0.85, traffic: 0.75, time: 105, target: 4600, seed: 66,
    list: { phone: 4, pizza: 3 }, pool: ['phone', 'pizza', 'gift', 'donut'],
  },
  {
    name: 'Black Friday',
    desc: 'Alle wollen shoppen! Volle Gänge, rollende Wagen, Rabatt-Chaos.',
    segments: [{ type: 'mall', len: 400 }, { type: 'shop', len: 400 }, { type: 'mall', len: 440 }],
    sky: '#ffd1dc', night: false, density: 1.05, traffic: 0.4, time: 115, target: 6200, seed: 77,
    list: { bag: 5, phone: 3, shoe: 3 }, pool: ['bag', 'phone', 'shoe', 'gift'],
  },
  {
    name: 'Die große Tour',
    desc: 'Das Finale: die komplette Stadt bei Sonnenuntergang. Schaffst du 3 Sterne?',
    segments: [{ type: 'street', len: 320 }, { type: 'mall', len: 360 }, { type: 'shop', len: 360 }, { type: 'mall', len: 200 }, { type: 'street', len: 360 }],
    sky: '#ff9e7a', night: false, density: 1.1, traffic: 0.9, time: 140, target: 8000, seed: 88,
    list: { gift: 4, phone: 3, pizza: 3, shoe: 2 }, pool: ['gift', 'phone', 'pizza', 'shoe', 'bag', 'apple', 'donut'],
  },
];
