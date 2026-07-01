import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyDuOhK_48pk-qXHrGy43FRgekqJER9dXQk",
  authDomain: "shahdate.firebaseapp.com",
  databaseURL: "https://shahdate-default-rtdb.firebaseio.com",
  projectId: "shahdate",
  storageBucket: "shahdate.firebasestorage.app",
  messagingSenderId: "183562473186",
  appId: "1:183562473186:web:b8fd3fc84e3d069f5158bb",
  measurementId: "G-3JTSXL3G5R"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

// Collection Names
const STUDENTS_COLLECTION = "students";
const EXAMS_COLLECTION = "exams";

// --- ERROR HANDLING WRAPPER FOR SECURITY RULES ---
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --- STUDENT API ---

export async function fetchStudents() {
  try {
    const querySnapshot = await getDocs(collection(db, STUDENTS_COLLECTION));
    const studentsList: any[] = [];
    querySnapshot.forEach((doc) => {
      studentsList.push({ id: doc.id, ...doc.data() });
    });
    return studentsList;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, STUDENTS_COLLECTION);
  }
}

export async function saveStudent(studentData: any) {
  try {
    const studentRef = doc(db, STUDENTS_COLLECTION, studentData.id);
    await setDoc(studentRef, studentData, { merge: true });
    return studentData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${STUDENTS_COLLECTION}/${studentData.id}`);
  }
}

export async function deleteStudent(studentId: string) {
  try {
    await deleteDoc(doc(db, STUDENTS_COLLECTION, studentId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${STUDENTS_COLLECTION}/${studentId}`);
  }
}

// --- EXAMS API ---

export async function fetchExams() {
  try {
    const querySnapshot = await getDocs(collection(db, EXAMS_COLLECTION));
    const examsList: any[] = [];
    querySnapshot.forEach((doc) => {
      examsList.push({ id: doc.id, ...doc.data() });
    });
    return examsList;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, EXAMS_COLLECTION);
  }
}

export async function saveExam(examData: any) {
  try {
    const examRef = doc(db, EXAMS_COLLECTION, examData.id);
    await setDoc(examRef, examData, { merge: true });
    return examData;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${EXAMS_COLLECTION}/${examData.id}`);
  }
}

export async function deleteExam(examId: string) {
  try {
    await deleteDoc(doc(db, EXAMS_COLLECTION, examId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${EXAMS_COLLECTION}/${examId}`);
  }
}

// --- BATCH HELPERS ---

export async function batchUpdateStudents(students: any[]) {
  try {
    const batch = writeBatch(db);
    students.forEach((student) => {
      const studentRef = doc(db, STUDENTS_COLLECTION, student.id);
      batch.set(studentRef, student, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, STUDENTS_COLLECTION);
  }
}

// --- ADMIN CREDENTIALS API ---
const ADMIN_CONFIG_COLLECTION = "admins";
const CREDENTIALS_DOC = "admin";

export async function fetchAdminCredentials() {
  try {
    const docRef = doc(db, ADMIN_CONFIG_COLLECTION, CREDENTIALS_DOC);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    } else {
      return null;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${ADMIN_CONFIG_COLLECTION}/${CREDENTIALS_DOC}`);
    return null;
  }
}

export async function saveAdminCredentials(creds: any) {
  try {
    const docRef = doc(db, ADMIN_CONFIG_COLLECTION, CREDENTIALS_DOC);
    await setDoc(docRef, creds, { merge: true });
    return creds;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ADMIN_CONFIG_COLLECTION}/${CREDENTIALS_DOC}`);
  }
}

export async function fetchAllAdmins() {
  try {
    const querySnapshot = await getDocs(collection(db, ADMIN_CONFIG_COLLECTION));
    const adminsList: any[] = [];
    querySnapshot.forEach((doc) => {
      adminsList.push({ id: doc.id, ...doc.data() });
    });

    // Check if there is any super admin. If not, auto-seed a default super admin and a default admin
    const hasSuper = adminsList.some(admin => admin.role === 'super');
    if (adminsList.length === 0) {
      const defaultSuper = { username: "", password: "", role: "super", name: "المدير العام (سوبر أدمن)" };
      const defaultAdmin = { username: "", password: "", role: "admin", name: "الأستاذ محمد" };
      
      await setDoc(doc(db, ADMIN_CONFIG_COLLECTION, "super_admin"), defaultSuper);
      await setDoc(doc(db, ADMIN_CONFIG_COLLECTION, "admin"), defaultAdmin);
      
      return [
        { id: "super_admin", ...defaultSuper },
        { id: "admin", ...defaultAdmin }
      ];
    } else if (!hasSuper) {
      const defaultSuper = { username: "super", password: "super123", role: "super", name: "المدير العام (سوبر أدمن)" };
      await setDoc(doc(db, ADMIN_CONFIG_COLLECTION, "super_admin"), defaultSuper);
      adminsList.push({ id: "super_admin", ...defaultSuper });
    }

    return adminsList;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, ADMIN_CONFIG_COLLECTION);
    return [];
  }
}

export async function saveAdmin(adminId: string, adminData: any) {
  try {
    const docRef = doc(db, ADMIN_CONFIG_COLLECTION, adminId);
    await setDoc(docRef, adminData, { merge: true });
    return { id: adminId, ...adminData };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ADMIN_CONFIG_COLLECTION}/${adminId}`);
  }
}

export async function deleteAdmin(adminId: string) {
  try {
    const docRef = doc(db, ADMIN_CONFIG_COLLECTION, adminId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${ADMIN_CONFIG_COLLECTION}/${adminId}`);
  }
}

// --- PASSWORD RESET & EMAIL VERIFICATION API ---
const VERIFICATIONS_COLLECTION = "verifications";

export async function saveVerificationCode(adminId: string, email: string, code: string) {
  try {
    const docRef = doc(db, VERIFICATIONS_COLLECTION, adminId);
    const data = {
      adminId,
      email,
      code,
      createdAt: new Date().toISOString(),
      verified: false
    };
    await setDoc(docRef, data);
    return data;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${VERIFICATIONS_COLLECTION}/${adminId}`);
  }
}

export async function checkVerificationCode(adminId: string, code: string) {
  try {
    const docRef = doc(db, VERIFICATIONS_COLLECTION, adminId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      // Check code match and check if expired (e.g. 10 minutes)
      const isMatch = data.code === code;
      const createdTime = new Date(data.createdAt).getTime();
      const tenMinutes = 10 * 60 * 1000;
      const isNotExpired = (Date.now() - createdTime) < tenMinutes;

      if (isMatch && isNotExpired) {
        // Mark as verified
        await setDoc(docRef, { verified: true }, { merge: true });
        return { success: true };
      } else if (!isNotExpired) {
        return { success: false, reason: "expired" };
      } else {
        return { success: false, reason: "incorrect" };
      }
    }
    return { success: false, reason: "not_found" };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${VERIFICATIONS_COLLECTION}/${adminId}`);
    return { success: false, reason: "error" };
  }
}

export async function updateAdminPassword(adminId: string, newPassword: string) {
  try {
    const docRef = doc(db, ADMIN_CONFIG_COLLECTION, adminId);
    await setDoc(docRef, { password: newPassword }, { merge: true });
    
    // Also delete verification code once done
    const verRef = doc(db, VERIFICATIONS_COLLECTION, adminId);
    await deleteDoc(verRef);
    
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${ADMIN_CONFIG_COLLECTION}/${adminId}`);
    return false;
  }
}

export async function fetchActiveVerification(adminId: string) {
  try {
    const docRef = doc(db, VERIFICATIONS_COLLECTION, adminId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, `${VERIFICATIONS_COLLECTION}/${adminId}`);
    return null;
  }
}

export async function fetchAllVerifications() {
  try {
    const querySnapshot = await getDocs(collection(db, VERIFICATIONS_COLLECTION));
    const list: any[] = [];
    querySnapshot.forEach((doc) => {
      list.push({ id: doc.id, ...doc.data() });
    });
    return list;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, VERIFICATIONS_COLLECTION);
    return [];
  }
}

export async function deleteVerificationCode(adminId: string) {
  try {
    const docRef = doc(db, VERIFICATIONS_COLLECTION, adminId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${VERIFICATIONS_COLLECTION}/${adminId}`);
    return false;
  }
}



