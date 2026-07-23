import { CONFIG } from './constants.js';

export const state = {
  auth: null,
  db: null,
  storage: null,
  uiInicializada: false,
  isAdmin: false,
  allowedContracts: [],
  contratoAtual: localStorage.getItem(CONFIG.keys.contrato) || "ferroport",
  LISTA: [],
  NOMES: [],
  LISTA_PTA: [],
  ACESSOS: [],
  selecaoDiaria: [],
  mostrarTodosRegistros: false,
  mostrarTodosMes: false,
  editingAccessId: null,
  ptaEditId: null,
  ptaEditFotos: null,
  refs: { diarios: null, nomes: null, pta: null, acessos: null },
  unsub: { diarios: null, nomes: null, pta: null, acessos: null, currentUser: null },
  ptaSig: { strokes: [], current: null, baseImage: "", dpr: 1 }
};

window.state = state; // Keep global for debugging if needed
