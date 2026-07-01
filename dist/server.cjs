var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path3 = __toESM(require("path"), 1);
var import_crypto = __toESM(require("crypto"), 1);
var import_vite = require("vite");

// server/db.ts
var import_fs = __toESM(require("fs"), 1);
var import_path = __toESM(require("path"), 1);
var DB_FILE = import_path.default.join(process.cwd(), "database.json");
function generateHash(seatNumber, fullName) {
  let hash = 0;
  const str = `${seatNumber}-${fullName}-verified-cert-2026`;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return "CERT-" + Math.abs(hash).toString(16).toUpperCase();
}
var INITIAL_STUDENTS = [
  {
    id: "student-1",
    seat_number: "1001",
    national_id: "30501011234567",
    full_name: "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u062F \u0639\u0644\u064A \u062D\u0633\u0646",
    grade: "\u0645\u0645\u062A\u0627\u0632",
    percentage: 95.5,
    school_name: "\u0645\u062F\u0631\u0633\u0629 \u0627\u0644\u0645\u062A\u0641\u0648\u0642\u064A\u0646 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629 \u0644\u0644\u0628\u0646\u064A\u0646",
    school_year: "2025 - 2026",
    price: 150,
    is_paid: false,
    subject_grades: {
      "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0627\u0644\u0628\u062D\u0648\u062A\u0629": 59,
      "\u0627\u0644\u0641\u064A\u0632\u064A\u0627\u0621": 58,
      "\u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621": 57,
      "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629": 76,
      "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629": 48,
      "\u0627\u0644\u062C\u064A\u0648\u0644\u0648\u062C\u064A\u0627": 59
    },
    certificate_hash: generateHash("1001", "\u0623\u062D\u0645\u062F \u0645\u062D\u0645\u062F \u0639\u0644\u064A \u062D\u0633\u0646")
  },
  {
    id: "student-2",
    seat_number: "1002",
    national_id: "30602021234568",
    full_name: "\u0633\u0627\u0631\u0629 \u0639\u0628\u062F \u0627\u0644\u0631\u062D\u0645\u0646 \u0645\u062D\u0645\u0648\u062F \u062D\u0633\u0646",
    grade: "\u062C\u064A\u062F \u062C\u062F\u0627\u064B",
    percentage: 88.2,
    school_name: "\u0645\u062F\u0631\u0633\u0629 \u0627\u0644\u062D\u0631\u064A\u0629 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629 \u0627\u0644\u0631\u0633\u0645\u064A\u0629 \u0644\u0644\u063A\u0627\u062A",
    school_year: "2025 - 2026",
    price: 150,
    is_paid: true,
    // already paid
    subject_grades: {
      "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0627\u0644\u0628\u062D\u0648\u062A\u0629": 52,
      "\u0627\u0644\u0641\u064A\u0632\u064A\u0627\u0621": 51,
      "\u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621": 50,
      "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629": 72,
      "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629": 45,
      "\u0627\u0644\u0623\u062D\u064A\u0627\u0621": 57
    },
    certificate_hash: generateHash("1002", "\u0633\u0627\u0631\u0629 \u0639\u0628\u062F \u0627\u0644\u0631\u062D\u0645\u0646 \u0645\u062D\u0645\u0648\u062F \u062D\u0633\u0646")
  },
  {
    id: "student-3",
    seat_number: "1003",
    national_id: "30503031234569",
    full_name: "\u0639\u0645\u0631 \u062E\u0627\u0644\u062F \u0648\u0644\u064A\u062F \u0633\u0639\u064A\u062F",
    grade: "\u0645\u0642\u0628\u0648\u0644",
    percentage: 64.8,
    school_name: "\u0645\u062F\u0631\u0633\u0629 \u0627\u0644\u0623\u0645\u0644 \u0627\u0644\u062B\u0627\u0646\u0648\u064A\u0629 \u0627\u0644\u0639\u0633\u0643\u0631\u064A\u0629 \u0628\u0646\u064A\u0646",
    school_year: "2025 - 2026",
    price: 0,
    // FREE Certificate
    is_paid: true,
    // Free is always accessible
    subject_grades: {
      "\u0627\u0644\u0631\u064A\u0627\u0636\u064A\u0627\u062A \u0627\u0644\u0628\u062D\u0648\u062A\u0629": 35,
      "\u0627\u0644\u0641\u064A\u0632\u064A\u0627\u0621": 38,
      "\u0627\u0644\u0643\u064A\u0645\u064A\u0627\u0621": 40,
      "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0639\u0631\u0628\u064A\u0629": 52,
      "\u0627\u0644\u0644\u063A\u0629 \u0627\u0644\u0625\u0646\u062C\u0644\u064A\u0632\u064A\u0629": 30,
      "\u0627\u0644\u062A\u0627\u0631\u064A\u062E": 42
    },
    certificate_hash: generateHash("1003", "\u0639\u0645\u0631 \u062E\u0627\u0644\u062F \u0648\u0644\u064A\u062F \u0633\u0639\u064A\u062F")
  }
];
var INITIAL_PAYMENTS = [
  {
    id: "pay-1",
    student_id: "student-2",
    amount: 150,
    transaction_id: "TXN-KASHIER-882910",
    status: "success",
    payment_method: "credit_card",
    created_at: new Date(Date.now() - 2 * 24 * 3600 * 1e3).toISOString()
  }
];
var DEFAULT_GATEWAY_CONFIG = {
  merchantId: "8e688370b0ecea73ff706a8aac9e3843",
  apiKey: "55ea9130-fb8a-4d9e-953a-285b680b85e1",
  apiSecret: "8bba4e7259e71f70abb2ce6f5977418616f186fecb9861f552cd49e38d302d8d13543bdc1a8f0c0e5b3a7bf0e0c9a68b",
  mode: "sandbox"
};
function readDB() {
  try {
    if (!import_fs.default.existsSync(DB_FILE)) {
      const initialData = {
        students: INITIAL_STUDENTS,
        payments: INITIAL_PAYMENTS,
        gatewayConfig: DEFAULT_GATEWAY_CONFIG
      };
      import_fs.default.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), "utf-8");
      return initialData;
    }
    const content = import_fs.default.readFileSync(DB_FILE, "utf-8");
    const parsed = JSON.parse(content);
    if (!parsed.gatewayConfig) {
      parsed.gatewayConfig = DEFAULT_GATEWAY_CONFIG;
    }
    return parsed;
  } catch (err) {
    console.error("Error reading database file:", err);
    return { students: INITIAL_STUDENTS, payments: INITIAL_PAYMENTS, gatewayConfig: DEFAULT_GATEWAY_CONFIG };
  }
}
function writeDB(data) {
  try {
    import_fs.default.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Error writing database file:", err);
  }
}
var dbManager = {
  // Students
  getStudents() {
    return readDB().students;
  },
  getStudentById(id) {
    return readDB().students.find((s) => s.id === id);
  },
  getStudentBySeatOrNationalId(query2) {
    const trimmed = query2.trim();
    return readDB().students.find(
      (s) => s.seat_number === trimmed || s.national_id === trimmed || s.id === trimmed
    );
  },
  addStudent(student) {
    const data = readDB();
    const id = "student-" + Date.now();
    const certificate_hash = generateHash(student.seat_number, student.full_name);
    const newStudent = {
      ...student,
      id,
      certificate_hash,
      is_paid: student.price === 0 ? true : false
      // Free is automatically paid
    };
    data.students.push(newStudent);
    writeDB(data);
    return newStudent;
  },
  updateStudent(id, updates) {
    const data = readDB();
    const idx = data.students.findIndex((s) => s.id === id);
    if (idx === -1) return void 0;
    let certHash = data.students[idx].certificate_hash;
    if (updates.full_name || updates.seat_number) {
      certHash = generateHash(
        updates.seat_number || data.students[idx].seat_number,
        updates.full_name || data.students[idx].full_name
      );
    }
    const updated = {
      ...data.students[idx],
      ...updates,
      certificate_hash: certHash
    };
    if (updates.price === 0) {
      updated.is_paid = true;
    }
    data.students[idx] = updated;
    writeDB(data);
    return updated;
  },
  deleteStudent(id) {
    const data = readDB();
    const initialLen = data.students.length;
    data.students = data.students.filter((s) => s.id !== id);
    if (data.students.length === initialLen) return false;
    writeDB(data);
    return true;
  },
  // Payments
  getPayments() {
    return readDB().payments;
  },
  getPaymentById(id) {
    return readDB().payments.find((p) => p.id === id);
  },
  getPaymentByTransactionId(txnId) {
    return readDB().payments.find((p) => p.transaction_id === txnId);
  },
  addPayment(payment) {
    const data = readDB();
    const id = "pay-" + Date.now();
    const newPayment = {
      ...payment,
      id,
      created_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    data.payments.push(newPayment);
    writeDB(data);
    return newPayment;
  },
  updatePayment(id, updates) {
    const data = readDB();
    const idx = data.payments.findIndex((p) => p.id === id);
    if (idx === -1) return void 0;
    const updated = {
      ...data.payments[idx],
      ...updates,
      updated_at: (/* @__PURE__ */ new Date()).toISOString()
    };
    data.payments[idx] = updated;
    writeDB(data);
    return updated;
  },
  getGatewayConfig() {
    const data = readDB();
    if (!data.gatewayConfig) {
      return DEFAULT_GATEWAY_CONFIG;
    }
    return data.gatewayConfig;
  },
  updateGatewayConfig(updates) {
    const data = readDB();
    const current = data.gatewayConfig || DEFAULT_GATEWAY_CONFIG;
    const updated = {
      ...current,
      ...updates
    };
    data.gatewayConfig = updated;
    writeDB(data);
    return updated;
  }
};

// server.ts
var import_bcryptjs2 = __toESM(require("bcryptjs"), 1);
var import_jsonwebtoken = __toESM(require("jsonwebtoken"), 1);
var import_firestore2 = require("firebase/firestore");

// server/firebase.ts
var import_app = require("firebase/app");
var import_firestore = require("firebase/firestore");
var import_fs2 = __toESM(require("fs"), 1);
var import_path2 = __toESM(require("path"), 1);
var import_bcryptjs = __toESM(require("bcryptjs"), 1);
var configPath = import_path2.default.join(process.cwd(), "firebase-applet-config.json");
var firebaseConfig = {};
if (import_fs2.default.existsSync(configPath)) {
  try {
    firebaseConfig = JSON.parse(import_fs2.default.readFileSync(configPath, "utf8"));
  } catch (err) {
    console.error("Failed to parse firebase-applet-config.json:", err);
  }
} else {
  firebaseConfig = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    appId: process.env.FIREBASE_APP_ID,
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    firestoreDatabaseId: process.env.FIREBASE_DATABASE_ID || "(default)"
  };
}
var app = (0, import_app.initializeApp)({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId
});
var db = (0, import_firestore.initializeFirestore)(app, {
  ignoreUndefinedProperties: true
}, firebaseConfig.firestoreDatabaseId || "(default)");
async function autoSeedAdminIfNeeded() {
  try {
    const adminsCol = (0, import_firestore.collection)(db, "admins");
    const q = (0, import_firestore.query)(adminsCol, (0, import_firestore.limit)(1));
    const snapshot = await (0, import_firestore.getDocs)(q);
    if (snapshot.empty) {
      console.log("No admins found in Firestore collection. Seeding first admin account...");
      const defaultUsername = "admin";
      const defaultPassword = "password123";
      const salt = await import_bcryptjs.default.genSalt(10);
      const passwordHash = await import_bcryptjs.default.hash(defaultPassword, salt);
      const adminDocRef = (0, import_firestore.doc)(adminsCol, defaultUsername);
      await (0, import_firestore.setDoc)(adminDocRef, {
        username: defaultUsername,
        passwordHash,
        role: "superadmin",
        createdAt: (/* @__PURE__ */ new Date()).toISOString()
      });
      console.log(`Successfully seeded default admin: ${defaultUsername} / ${defaultPassword}`);
    } else {
      console.log("Admin account(s) exist in Firestore.");
    }
  } catch (error) {
    console.error("Error during auto-seeding admin account in Firestore:", error);
  }
}

// server.ts
var app2 = (0, import_express.default)();
var PORT = 3e3;
app2.use(import_express.default.json());
app2.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    res.sendStatus(200);
    return;
  }
  next();
});
function generateSignature(transactionId, amount) {
  const config = dbManager.getGatewayConfig();
  return import_crypto.default.createHmac("sha256", config.apiSecret).update(`${transactionId}:${amount}`).digest("hex");
}
function generateKashierHash(merchantOrderId, amount, merchantId, apiSecret, currency = "EGP") {
  const pathString = `mid?${merchantId}&orderId?${merchantOrderId}&amount?${amount}&currency?${currency}`;
  return import_crypto.default.createHmac("sha256", apiSecret).update(pathString).digest("hex");
}
var JWT_SECRET = process.env.JWT_SECRET || "your-default-secure-jwt-secret-key-123456";
var verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ error: "\u063A\u064A\u0631 \u0645\u0635\u0631\u062D \u0644\u0644\u062F\u062E\u0648\u0644 - \u0627\u0644\u0631\u062C\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644 \u0623\u0648\u0644\u0627\u064B" });
    return;
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = import_jsonwebtoken.default.verify(token, JWT_SECRET);
    req.admin = decoded;
    next();
  } catch (err) {
    res.status(403).json({ error: "\u062C\u0644\u0633\u0629 \u0639\u0645\u0644 \u0645\u0646\u062A\u0647\u064A\u0629 \u0627\u0644\u0635\u0644\u0627\u062D\u064A\u0629 \u0623\u0648 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629" });
  }
};
app2.get("/api/student/search", (req, res) => {
  const query2 = req.query.query;
  if (!query2) {
    res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0625\u062F\u062E\u0627\u0644 \u0631\u0642\u0645 \u0627\u0644\u062C\u0644\u0648\u0633 \u0623\u0648 \u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u0648\u0645\u064A" });
    return;
  }
  const student = dbManager.getStudentBySeatOrNationalId(query2);
  if (!student) {
    res.status(404).json({ error: "\u0639\u0630\u0631\u0627\u064B\u060C \u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0637\u0627\u0644\u0628 \u0628\u0647\u0630\u0627 \u0627\u0644\u0631\u0642\u0645" });
    return;
  }
  if (!student.is_paid) {
    res.json({
      student: {
        id: student.id,
        seat_number: student.seat_number,
        full_name: student.full_name,
        school_name: student.school_name,
        school_year: student.school_year,
        price: student.price,
        is_paid: false
      }
    });
  } else {
    res.json({
      student: {
        ...student,
        is_paid: true
      }
    });
  }
});
app2.get("/api/student/verify/:hash", (req, res) => {
  const { hash } = req.params;
  const students = dbManager.getStudents();
  const student = students.find((s) => s.certificate_hash === hash && s.is_paid);
  if (!student) {
    res.status(404).json({ verified: false, error: "\u0634\u0647\u0627\u062F\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D\u0629 \u0623\u0648 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644\u0629 \u0641\u064A \u0627\u0644\u0646\u0638\u0627\u0645" });
    return;
  }
  res.json({
    verified: true,
    student: {
      seat_number: student.seat_number,
      full_name: student.full_name,
      grade: student.grade,
      percentage: student.percentage,
      school_name: student.school_name,
      school_year: student.school_year,
      verification_date: (/* @__PURE__ */ new Date()).toLocaleDateString("ar-EG"),
      certificate_hash: student.certificate_hash
    }
  });
});
app2.post("/api/payments/initialize", (req, res) => {
  const { studentId, paymentMethod } = req.body;
  if (!studentId) {
    res.status(400).json({ error: "\u0645\u0639\u0631\u0651\u0641 \u0627\u0644\u0637\u0627\u0644\u0628 \u0645\u0637\u0644\u0648\u0628 \u0644\u0628\u062F\u0621 \u0627\u0644\u062F\u0641\u0639" });
    return;
  }
  const student = dbManager.getStudentById(studentId);
  if (!student) {
    res.status(404).json({ error: "\u0644\u0645 \u064A\u062A\u0645 \u0627\u0644\u0639\u062B\u0648\u0631 \u0639\u0644\u0649 \u0627\u0644\u0637\u0627\u0644\u0628" });
    return;
  }
  if (student.is_paid) {
    res.status(400).json({ error: "\u0627\u0644\u0634\u0647\u0627\u062F\u0629 \u0645\u062F\u0641\u0648\u0639\u0629 \u0628\u0627\u0644\u0641\u0639\u0644 \u0648\u0645\u062A\u0627\u062D\u0629 \u0644\u0644\u062A\u062D\u0645\u064A\u0644" });
    return;
  }
  const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 1e3)}`;
  const amount = student.price;
  const config = dbManager.getGatewayConfig();
  let signature = "";
  if (config.mode === "simulator") {
    signature = generateSignature(transactionId, amount);
  } else {
    signature = generateKashierHash(transactionId, amount, config.merchantId, config.apiSecret);
  }
  dbManager.addPayment({
    student_id: studentId,
    amount,
    transaction_id: transactionId,
    status: "pending",
    payment_method: paymentMethod || "credit_card"
  });
  const checkoutUrl = `/payment-gateway?transactionId=${transactionId}&amount=${amount}&signature=${signature}`;
  res.json({
    transactionId,
    amount,
    mode: config.mode,
    merchantId: config.merchantId,
    apiKey: config.apiKey,
    signature,
    checkoutUrl
  });
});
app2.post("/api/payments/webhook", (req, res) => {
  const { transactionId, amount, status, signature } = req.body;
  if (!transactionId || amount === void 0 || !status || !signature) {
    res.status(400).json({ error: "\u0628\u064A\u0627\u0646\u0627\u062A \u063A\u064A\u0631 \u0645\u0643\u062A\u0645\u0644\u0629 \u0644\u0644\u0639\u0645\u0644\u064A\u0629" });
    return;
  }
  const config = dbManager.getGatewayConfig();
  let expectedSignature = "";
  if (config.mode === "simulator") {
    expectedSignature = generateSignature(transactionId, Number(amount));
  } else {
    expectedSignature = generateKashierHash(transactionId, Number(amount), config.merchantId, config.apiSecret);
  }
  if (signature !== expectedSignature && signature !== generateSignature(transactionId, Number(amount))) {
    res.status(403).json({ error: "\u062A\u0648\u0642\u064A\u0639 \u0627\u0644\u062A\u062D\u0642\u0642 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D - \u0641\u0634\u0644 \u0627\u0644\u062A\u0623\u0645\u064A\u0646" });
    return;
  }
  const payment = dbManager.getPaymentByTransactionId(transactionId);
  if (!payment) {
    res.status(404).json({ error: "\u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F\u0629 \u0628\u0627\u0644\u0646\u0638\u0627\u0645" });
    return;
  }
  if (payment.status !== "pending") {
    res.json({ success: true, message: "\u062A\u0645 \u0645\u0639\u0627\u0644\u062C\u0629 \u0647\u0630\u0647 \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0645\u0633\u0628\u0642\u0627\u064B" });
    return;
  }
  dbManager.updatePayment(payment.id, {
    status: status === "success" ? "success" : "failed"
  });
  if (status === "success") {
    dbManager.updateStudent(payment.student_id, { is_paid: true });
  }
  res.json({ success: true, verified: true });
});
app2.post("/api/payments/kashier-callback", (req, res) => {
  const { merchantOrderId, paymentStatus, signature } = req.body;
  if (!merchantOrderId) {
    res.status(400).json({ error: "\u0643\u0648\u062F \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0645\u0637\u0644\u0648\u0628" });
    return;
  }
  const payment = dbManager.getPaymentByTransactionId(merchantOrderId);
  if (!payment) {
    res.status(404).json({ error: "\u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644\u0629" });
    return;
  }
  const success = paymentStatus === "SUCCESS" || paymentStatus === "success";
  const statusStr = success ? "success" : "failed";
  dbManager.updatePayment(payment.id, {
    status: statusStr
  });
  if (success) {
    dbManager.updateStudent(payment.student_id, { is_paid: true });
  }
  const student = dbManager.getStudentById(payment.student_id);
  res.json({ success: true, studentId: payment.student_id, student });
});
app2.get("/api/payments/verify", (req, res) => {
  const transactionId = req.query.transactionId;
  if (!transactionId) {
    res.status(400).json({ error: "\u0643\u0648\u062F \u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u0645\u0637\u0644\u0648\u0628 \u0644\u0644\u062A\u062D\u0642\u0642" });
    return;
  }
  const payment = dbManager.getPaymentByTransactionId(transactionId);
  if (!payment) {
    res.status(404).json({ error: "\u0627\u0644\u0639\u0645\u0644\u064A\u0629 \u063A\u064A\u0631 \u0645\u0633\u062C\u0644\u0629" });
    return;
  }
  res.json({
    status: payment.status,
    studentId: payment.student_id,
    amount: payment.amount,
    paymentMethod: payment.payment_method,
    createdAt: payment.created_at
  });
});
app2.post("/api/admin/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0648\u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u0645\u0637\u0644\u0648\u0628\u0627\u0646" });
    return;
  }
  try {
    const adminDocRef = (0, import_firestore2.doc)(db, "admins", username.trim());
    const adminDoc = await (0, import_firestore2.getDoc)(adminDocRef);
    if (!adminDoc.exists()) {
      res.status(401).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
      return;
    }
    const adminData = adminDoc.data();
    const isMatch = await import_bcryptjs2.default.compare(password, adminData.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "\u0627\u0633\u0645 \u0627\u0644\u0645\u0633\u062A\u062E\u062F\u0645 \u0623\u0648 \u0643\u0644\u0645\u0629 \u0627\u0644\u0645\u0631\u0648\u0631 \u063A\u064A\u0631 \u0635\u062D\u064A\u062D\u0629" });
      return;
    }
    const token = import_jsonwebtoken.default.sign(
      { username: adminData.username, role: adminData.role || "admin" },
      JWT_SECRET,
      { expiresIn: "24h" }
    );
    res.json({ success: true, token, username: adminData.username });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "\u062D\u062F\u062B \u062E\u0637\u0623 \u0641\u064A \u0627\u0644\u0633\u064A\u0631\u0641\u0631 \u0623\u062B\u0646\u0627\u0621 \u062A\u0633\u062C\u064A\u0644 \u0627\u0644\u062F\u062E\u0648\u0644" });
  }
});
app2.get("/api/admin/me", verifyAdmin, (req, res) => {
  res.json({ authenticated: true, username: req.admin?.username || "admin" });
});
app2.post("/api/admin/logout", (req, res) => {
  res.json({ success: true });
});
app2.get("/api/admin/gateway-config", verifyAdmin, (req, res) => {
  res.json({ gatewayConfig: dbManager.getGatewayConfig() });
});
app2.post("/api/admin/gateway-config", verifyAdmin, (req, res) => {
  const { merchantId, apiKey, apiSecret, mode } = req.body;
  if (!merchantId || !apiKey || !apiSecret || !mode) {
    res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0645\u0644\u0621 \u062C\u0645\u064A\u0639 \u062D\u0642\u0648\u0644 \u0627\u0644\u062A\u0643\u0648\u064A\u0646 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629" });
    return;
  }
  if (!["simulator", "sandbox", "production"].includes(mode)) {
    res.status(400).json({ error: "\u0648\u0636\u0639 \u0627\u0644\u0628\u0648\u0627\u0628\u0629 \u063A\u064A\u0631 \u0635\u0627\u0644\u062D" });
    return;
  }
  const updated = dbManager.updateGatewayConfig({ merchantId, apiKey, apiSecret, mode });
  res.json({ success: true, gatewayConfig: updated });
});
app2.get("/api/admin/stats", verifyAdmin, (req, res) => {
  const students = dbManager.getStudents();
  const payments = dbManager.getPayments();
  const totalStudents = students.length;
  const paidStudents = students.filter((s) => s.is_paid).length;
  const pendingPayments = payments.filter((p) => p.status === "pending").length;
  const successfulPayments = payments.filter((p) => p.status === "success");
  const totalRevenue = successfulPayments.reduce((sum, p) => sum + p.amount, 0);
  const percentages = students.map((s) => s.percentage);
  const avgPercentage = percentages.length > 0 ? Number((percentages.reduce((sum, val) => sum + val, 0) / percentages.length).toFixed(1)) : 0;
  res.json({
    totalStudents,
    paidStudents,
    pendingPayments,
    totalRevenue,
    avgPercentage
  });
});
app2.get("/api/admin/students", verifyAdmin, (req, res) => {
  res.json({ students: dbManager.getStudents() });
});
app2.post("/api/admin/students", verifyAdmin, (req, res) => {
  const { seat_number, national_id, full_name, grade, percentage, school_name, school_year, price, subject_grades } = req.body;
  if (!seat_number || !national_id || !full_name || !grade || percentage === void 0 || !school_name || !school_year || price === void 0) {
    res.status(400).json({ error: "\u0627\u0644\u0631\u062C\u0627\u0621 \u0645\u0644\u0621 \u062C\u0645\u064A\u0639 \u0627\u0644\u062D\u0642\u0648\u0644 \u0627\u0644\u0645\u0637\u0644\u0648\u0628\u0629" });
    return;
  }
  const students = dbManager.getStudents();
  if (students.some((s) => s.seat_number === seat_number)) {
    res.status(400).json({ error: "\u0631\u0642\u0645 \u0627\u0644\u062C\u0644\u0648\u0633 \u0647\u0630\u0627 \u0645\u0633\u062C\u0644 \u0628\u0627\u0644\u0641\u0639\u0644 \u0644\u0637\u0627\u0644\u0628 \u0622\u062E\u0631" });
    return;
  }
  if (students.some((s) => s.national_id === national_id)) {
    res.status(400).json({ error: "\u0627\u0644\u0631\u0642\u0645 \u0627\u0644\u0642\u0648\u0645\u064A \u0647\u0630\u0627 \u0645\u0633\u062C\u0644 \u0628\u0627\u0644\u0641\u0639\u0644 \u0644\u0637\u0627\u0644\u0628 \u0622\u062E\u0631" });
    return;
  }
  const newStudent = dbManager.addStudent({
    seat_number,
    national_id,
    full_name,
    grade,
    percentage: Number(percentage),
    school_name,
    school_year,
    price: Number(price),
    subject_grades: subject_grades || {},
    is_paid: Number(price) === 0
    // Free are automatically paid
  });
  res.status(212).json({ success: true, student: newStudent });
});
app2.put("/api/admin/students/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  delete updates.id;
  delete updates.certificate_hash;
  if (updates.percentage !== void 0) updates.percentage = Number(updates.percentage);
  if (updates.price !== void 0) updates.price = Number(updates.price);
  const updated = dbManager.updateStudent(id, updates);
  if (!updated) {
    res.status(404).json({ error: "\u0627\u0644\u0637\u0627\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    return;
  }
  res.json({ success: true, student: updated });
});
app2.delete("/api/admin/students/:id", verifyAdmin, (req, res) => {
  const { id } = req.params;
  const deleted = dbManager.deleteStudent(id);
  if (!deleted) {
    res.status(404).json({ error: "\u0627\u0644\u0637\u0627\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    return;
  }
  res.json({ success: true });
});
app2.post("/api/admin/students/:id/reissue", verifyAdmin, (req, res) => {
  const { id } = req.params;
  const student = dbManager.getStudentById(id);
  if (!student) {
    res.status(404).json({ error: "\u0627\u0644\u0637\u0627\u0644\u0628 \u063A\u064A\u0631 \u0645\u0648\u062C\u0648\u062F" });
    return;
  }
  const freshHash = "CERT-" + import_crypto.default.createHash("md5").update(`${student.seat_number}-${student.full_name}-${Date.now()}`).digest("hex").substring(0, 10).toUpperCase();
  const updated = dbManager.updateStudent(id, {
    certificate_hash: freshHash
  });
  res.json({ success: true, student: updated, message: "\u062A\u0645 \u0625\u0639\u0627\u062F\u0629 \u0625\u0635\u062F\u0627\u0631 \u0643\u0648\u062F \u0627\u0644\u062A\u062D\u0642\u0642 \u0627\u0644\u062E\u0627\u0635 \u0628\u0627\u0644\u0634\u0647\u0627\u062F\u0629 \u0628\u0646\u062C\u0627\u062D" });
});
app2.get("/api/admin/payments", verifyAdmin, (req, res) => {
  const payments = dbManager.getPayments();
  const students = dbManager.getStudents();
  const enrichedPayments = payments.map((p) => {
    const student = students.find((s) => s.id === p.student_id);
    return {
      ...p,
      student_name: student ? student.full_name : "\u0637\u0627\u0644\u0628 \u0645\u062D\u0630\u0648\u0641",
      seat_number: student ? student.seat_number : "-"
    };
  });
  res.json({ payments: enrichedPayments });
});
async function startServer() {
  await autoSeedAdminIfNeeded();
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app2.use(vite.middlewares);
  } else {
    const distPath = import_path3.default.join(process.cwd(), "dist");
    app2.use(import_express.default.static(distPath));
    app2.get("*", (req, res) => {
      res.sendFile(import_path3.default.join(distPath, "index.html"));
    });
  }
  app2.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
