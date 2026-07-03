const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUserByManager = functions.region("southamerica-east1").https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Usuário não autenticado.");
    }

    const managerUid = context.auth.uid;
    const managerSnap = await admin.firestore().collection("users").doc(managerUid).get();
    const manager = managerSnap.exists ? (managerSnap.data() || {}) : {};

    if (String(manager.role || "").toLowerCase() !== "gestor") {
      throw new functions.https.HttpsError("permission-denied", "Apenas gestor pode criar usuários.");
    }

    const nome = String(data?.nome || "").trim();
    const email = String(data?.email || "").trim().toLowerCase();
    const senha = String(data?.senha || "").trim();
    const role = String(data?.role || "tecnico").trim();
    const allowedContracts = Array.isArray(data?.allowedContracts) ? data.allowedContracts : [];
    const ativo = data?.ativo !== false;

    if (!nome) throw new functions.https.HttpsError("invalid-argument", "Nome obrigatório.");
    if (!email) throw new functions.https.HttpsError("invalid-argument", "E-mail obrigatório.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new functions.https.HttpsError("invalid-argument", "E-mail inválido.");
    }
    if (senha.length < 6) {
      throw new functions.https.HttpsError("invalid-argument", "A senha deve ter pelo menos 6 caracteres.");
    }
    if (!allowedContracts.length) {
      throw new functions.https.HttpsError("invalid-argument", "Selecione ao menos um contrato.");
    }

    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      await admin.auth().updateUser(userRecord.uid, {
        email,
        password: senha,
        displayName: nome,
        disabled: !ativo
      });
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        userRecord = await admin.auth().createUser({
          email,
          password: senha,
          displayName: nome,
          disabled: !ativo
        });
      } else {
        throw err;
      }
    }

    const now = admin.firestore.FieldValue.serverTimestamp();

    await admin.firestore().collection("users").doc(userRecord.uid).set({
      nome,
      email,
      role,
      allowedContracts,
      ativo,
      atualizadoEm: now
    }, { merge: true });

    await admin.firestore().collection("access_by_email").doc(email).set({
      nome,
      email,
      role,
      allowedContracts,
      ativo,
      uid: userRecord.uid,
      atualizadoEm: now
    }, { merge: true });

    return { ok: true, uid: userRecord.uid, email };
  } catch (error) {
    console.error("createUserByManager", error);
    throw new functions.https.HttpsError(error.code || "internal", error.message || "Erro ao criar usuário.");
  }
});
