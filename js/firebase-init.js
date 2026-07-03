import { CONFIG } from './constants.js';
import { state } from './state.js';

export function initFirebase() {
  if (typeof firebase === 'undefined') {
    throw new Error("Firebase SDK not found. Check your script tags.");
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(CONFIG.firebase);
  }

  state.auth = firebase.auth();
  state.db = firebase.firestore();
  state.storage = firebase.storage();
  
  try {
    state.functions = firebase.functions();
  } catch (e) {
    console.warn("Firebase Functions not available.");
  }

  state.refs = {
    diarios: state.db.collection("diarios"),
    nomes: state.db.collection("nomes"),
    pta: state.db.collection("pta"),
    acessos: state.db.collection("acessos")
  };

  return { auth: state.auth, db: state.db };
}
