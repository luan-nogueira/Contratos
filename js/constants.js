export const CONTRATOS = [
  { value: "ferroport", label: "Ferroport" },
  { value: "technip", label: "TechNip" },
  { value: "pta-inveco", label: "PTA IVECO" },
  { value: "pta-hilux", label: "PTA HILUX" },
  { value: "veiculos-leves", label: "Veículos leves" },
  { value: "iveco-sem-pta", label: "IVECO sem PTA" }
];

export const CHECK_ITEMS = [
  "Fixação para Transporte","Giro do cesto","Comando do cesto","Estabilizadores","Comando das patolas",
  "Lança","Elevação da plataforma","Vazamentos hidráulicos","Eletroválvulas lacradas","Anti-crash",
  "Acion. Tomada de força","Óleo hidráulico","Comando da torre","Calços","Bomba de emergência",
  "Chave de torre","Torre","Mangueiras","Giroled","Lanternas laterais","Sirene de movimentação",
  "Buzina","Retrovisores","Para-brisas","Limpadores de para-brisa","Faróis","Setas","Luz de freio",
  "Kit de Primeiros Socorros",
  "Anemômetro na PTA",
  "Anemômetro funcional",
  "Calibração do anemômetro em dia"
];

export const VEICULOS_LEVES = [
  { nome: "POLO", placa: "TXH9D68" },
  { nome: "POLO", placa: "TYA1B48" },
  { nome: "HB20", placa: "TEA2F05" },
  { nome: "ONIX", placa: "TXN1E93" },
  { nome: "ONIX", placa: "SFB9F55" },
  { nome: "OROCH", placa: "SFW9D89" },
  { nome: "OROCH", placa: "SFZ6E09" },
  { nome: "POLO", placa: "TYA1B34" },
  { nome: "POLO", placa: "TXN2E22" },
  { nome: "TOYOTA HILUX CAMINHONETE", placa: "TYH9F20" }
];

export const VEICULOS_IVECO_SEM_PTA = [
  { nome: "PTA IVECO", placa: "QRD7698" }
];

export const CHECK_ITEMS_LEVES = [
  "Retrovisores","Parabrisas","Vidros laterais","Calotas","Rodas",
  "Pneus","Batidas/Amassado/Riscos","Faróis/Lâmpadas","Limpadores","Lavagem externa",
  "Tampão traseiro com auto falantes","Tampão traseiro sem auto falantes","Auto falantes nas portas",
  "Quantidade de chaves do veículo","Adesivo com logotipo Digital","Rack porta escada",
  "Estofado/Banco","Tapete","Extintor – Validade","Estepe","Macaco","Triângulo",
  "Chave de roda","Rádio","Limpeza interna","Documento","Fechamento do Porta-luvas",
  "Funcionamento do mecanismo dos vidros","Luzes do painel de instrumentos","Luz interna",
  "Acendedor (isqueiro)","Insulfilm"
];

export const CONFIG = {
  firebase: {
    apiKey: "AIzaSyBzgChouE4W25XnD-vFybJrKVN9yl3R0IQ",
    authDomain: "ferroportluannogueira.firebaseapp.com",
    projectId: "ferroportluannogueira",
    storageBucket: "ferroportluannogueira.firebasestorage.app",
    messagingSenderId: "531699539518",
    appId: "1:531699539518:web:6e32a169d9110f70b9fb6f",
    measurementId: "G-61BRVCSHD7"
  },
  keys: {
    tema: "tema_site",
    contrato: "contrato_atual",
    vlVeiculo: "vl_veiculo_atual"
  },
  limites: {
    registros: 5,
    mes: 6
  }
};
