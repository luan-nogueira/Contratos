const functions = require("firebase-functions/v1");
const admin = require("firebase-admin");

admin.initializeApp();

exports.createUserByManager = functions.region("southamerica-east1").https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Usuário não autenticado.");
    }

    const managerUid = context.auth.uid;
    let isGestor = false;

    // 1. Verifica no documento do usuário em 'users/{uid}'
    const managerSnap = await admin.firestore().collection("users").doc(managerUid).get();
    if (managerSnap.exists && String(managerSnap.data()?.role || "").toLowerCase() === "gestor") {
      isGestor = true;
    }

    // 2. Fallback: verifica em 'access_by_email/{email}' se necessário
    if (!isGestor && context.auth.token?.email) {
      const emailKey = String(context.auth.token.email).trim().toLowerCase();
      const accessSnap = await admin.firestore().collection("access_by_email").doc(emailKey).get();
      if (accessSnap.exists && String(accessSnap.data()?.role || "").toLowerCase() === "gestor") {
        isGestor = true;
      }
    }

    if (!isGestor) {
      throw new functions.https.HttpsError("permission-denied", "Apenas gestores podem criar novos usuários.");
    }

    const nome = String(data?.nome || "").trim();
    const email = String(data?.email || "").trim().toLowerCase();
    const senha = String(data?.senha || "").trim();
    const role = String(data?.role || "tecnico").trim();
    const allowedContracts = Array.isArray(data?.allowedContracts) ? data.allowedContracts : [];
    const ativo = data?.ativo !== false;
    const matricula = String(data?.matricula || "").trim();
    const funcao = String(data?.funcao || "").trim();
    const departamento = String(data?.departamento || "").trim();
    const setor = String(data?.setor || "").trim();

    if (!nome) throw new functions.https.HttpsError("invalid-argument", "Nome é obrigatório.");
    if (!email) throw new functions.https.HttpsError("invalid-argument", "E-mail é obrigatório.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new functions.https.HttpsError("invalid-argument", "E-mail informado é inválido.");
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
      matricula,
      funcao,
      departamento,
      setor,
      atualizadoEm: now
    }, { merge: true });

    await admin.firestore().collection("access_by_email").doc(email).set({
      nome,
      email,
      role,
      allowedContracts,
      ativo,
      matricula,
      funcao,
      departamento,
      setor,
      uid: userRecord.uid,
      atualizadoEm: now
    }, { merge: true });

    return { ok: true, uid: userRecord.uid, email };
  } catch (error) {
    console.error("createUserByManager error:", error);

    // Se já é um HttpsError do Firebase, relança diretamente
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    // Mapeamento seguro de erros do Firebase Auth para HttpsError sem quebrar a assinatura
    let code = "internal";
    let message = error.message || "Erro ao criar usuário.";

    if (error.code === "auth/email-already-exists") {
      code = "already-exists";
      message = "Este e-mail já está cadastrado no sistema Firebase Auth.";
    } else if (error.code === "auth/invalid-email") {
      code = "invalid-argument";
      message = "Endereço de e-mail inválido.";
    } else if (error.code === "auth/weak-password") {
      code = "invalid-argument";
      message = "A senha deve conter no mínimo 6 caracteres.";
    }

    throw new functions.https.HttpsError(code, message);
  }
});

// Cria a conta de Firebase Auth do "primeiro acesso" de um técnico, mas só depois
// de confirmar no servidor que o gestor já liberou aquele e-mail em access_by_email.
// Isso fecha o cadastro que antes era aberto: antes, qualquer pessoa podia chamar
// createUserWithEmailAndPassword direto do navegador com qualquer e-mail.
exports.criarPrimeiroAcesso = functions.region("southamerica-east1").https.onCall(async (data) => {
  try {
    const email = String(data?.email || "").trim().toLowerCase();
    const senha = String(data?.senha || "").trim();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new functions.https.HttpsError("invalid-argument", "Informe um e-mail válido.");
    }
    if (senha.length < 6) {
      throw new functions.https.HttpsError("invalid-argument", "A senha deve ter pelo menos 6 caracteres.");
    }

    const accessSnap = await admin.firestore().collection("access_by_email").doc(email).get();
    if (!accessSnap.exists) {
      throw new functions.https.HttpsError("permission-denied", "Esse e-mail ainda não foi liberado pelo gestor.");
    }
    const access = accessSnap.data() || {};
    if (access.ativo === false) {
      throw new functions.https.HttpsError("permission-denied", "Seu acesso está inativo. Procure o gestor.");
    }

    let userRecord;
    let existing = true;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      // Conta já existe: não mexe na senha aqui. O cliente tenta o login em
      // seguida com a senha informada; se estiver errada, ele orienta o
      // usuário a usar a senha correta ou pedir redefinição.
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        existing = false;
        userRecord = await admin.auth().createUser({
          email,
          password: senha,
          displayName: access.nome || email,
          disabled: false
        });
      } else {
        throw err;
      }
    }

    return { ok: true, uid: userRecord.uid, existing };
  } catch (error) {
    console.error("criarPrimeiroAcesso error:", error);

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    let code = "internal";
    let message = error.message || "Erro ao preparar o primeiro acesso.";

    if (error.code === "auth/email-already-exists") {
      code = "already-exists";
      message = "Este e-mail já está cadastrado.";
    } else if (error.code === "auth/invalid-email") {
      code = "invalid-argument";
      message = "Endereço de e-mail inválido.";
    } else if (error.code === "auth/weak-password") {
      code = "invalid-argument";
      message = "A senha deve conter no mínimo 6 caracteres.";
    }

    throw new functions.https.HttpsError(code, message);
  }
});
