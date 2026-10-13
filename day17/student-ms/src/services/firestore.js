import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

// ============================================================
// COLLECTION REFERENCES
// ============================================================
const COLLECTIONS = {
  USERS: "users",
  DEPARTMENTS: "departments",
  STUDENTS: "students",
  TEACHERS: "teachers",
  HODS: "hods",
  COURSES: "courses",
  ATTENDANCE: "attendance",
  MARKS: "marks",
  EXAMINATIONS: "examinations",
  NOTIFICATIONS: "notifications",
  INVITATIONS: "invitations",
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const convertTimestamps = (data) => {
  if (!data) return data;
  const converted = { ...data };
  for (const key of Object.keys(converted)) {
    const value = converted[key];
    if (value && typeof value.toDate === "function") {
      converted[key] = value.toDate().toISOString();
    }
  }
  return converted;
};

const convertTimestampsInArray = (docs) => {
  return docs.map((doc) => ({
    id: doc.id,
    ...convertTimestamps(doc.data()),
  }));
};

// ============================================================
// USERS SERVICE
// ============================================================
export const usersService = {
  async getById(uid) {
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...convertTimestamps(snapshot.data()) };
  },

  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.USERS));
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByRole(role) {
    const q = query(collection(db, COLLECTIONS.USERS), where("role", "==", role));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByDepartment(departmentId) {
    const q = query(collection(db, COLLECTIONS.USERS), where("departmentId", "==", departmentId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByStatus(status) {
    const q = query(collection(db, COLLECTIONS.USERS), where("status", "==", status));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getPendingApprovals() {
    const q = query(
      collection(db, COLLECTIONS.USERS),
      where("status", "==", "pending"),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async update(uid, data) {
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    return this.getById(uid);
  },

  async create(uid, data) {
    const docRef = doc(db, COLLECTIONS.USERS, uid);
    await updateDoc(docRef, {
      ...data,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return this.getById(uid);
  },
};

// ============================================================
// DEPARTMENTS SERVICE
// ============================================================
export const departmentsService = {
  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.DEPARTMENTS));
    return convertTimestampsInArray(snapshot.docs);
  },

  async getById(id) {
    const docRef = doc(db, COLLECTIONS.DEPARTMENTS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...convertTimestamps(snapshot.data()) };
  },

  async create(data) {
    const docRef = await addDoc(collection(db, COLLECTIONS.DEPARTMENTS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return this.getById(docRef.id);
  },

  async update(id, data) {
    const docRef = doc(db, COLLECTIONS.DEPARTMENTS, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    return this.getById(id);
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.DEPARTMENTS, id));
    return { success: true };
  },
};

// ============================================================
// STUDENTS SERVICE (Academic Profiles)
// ============================================================
export const studentsService = {
  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.STUDENTS));
    return convertTimestampsInArray(snapshot.docs);
  },

  async getById(id) {
    const docRef = doc(db, COLLECTIONS.STUDENTS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...convertTimestamps(snapshot.data()) };
  },

  async getByDepartment(departmentId) {
    const q = query(collection(db, COLLECTIONS.STUDENTS), where("departmentId", "==", departmentId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByYearAndSemester(departmentId, year, semester) {
    const q = query(
      collection(db, COLLECTIONS.STUDENTS),
      where("departmentId", "==", departmentId),
      where("year", "==", year),
      where("semester", "==", semester)
    );
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async create(data) {
    const docRef = await addDoc(collection(db, COLLECTIONS.STUDENTS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return this.getById(docRef.id);
  },

  async createWithUid(uid, data) {
    const docRef = doc(db, COLLECTIONS.STUDENTS, uid);
    await updateDoc(docRef, {
      ...data,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return this.getById(uid);
  },

  async update(id, data) {
    const docRef = doc(db, COLLECTIONS.STUDENTS, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    return this.getById(id);
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.STUDENTS, id));
    return { success: true };
  },
};

// ============================================================
// TEACHERS SERVICE (Academic Profiles)
// ============================================================
export const teachersService = {
  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.TEACHERS));
    return convertTimestampsInArray(snapshot.docs);
  },

  async getById(id) {
    const docRef = doc(db, COLLECTIONS.TEACHERS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...convertTimestamps(snapshot.data()) };
  },

  async getByDepartment(departmentId) {
    const q = query(collection(db, COLLECTIONS.TEACHERS), where("departmentId", "==", departmentId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async create(data) {
    const docRef = await addDoc(collection(db, COLLECTIONS.TEACHERS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return this.getById(docRef.id);
  },

  async createWithUid(uid, data) {
    const docRef = doc(db, COLLECTIONS.TEACHERS, uid);
    await updateDoc(docRef, {
      ...data,
      uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return this.getById(uid);
  },

  async update(id, data) {
    const docRef = doc(db, COLLECTIONS.TEACHERS, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    return this.getById(id);
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.TEACHERS, id));
    return { success: true };
  },
};

// ============================================================
// COURSES SERVICE
// ============================================================
export const coursesService = {
  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.COURSES));
    return convertTimestampsInArray(snapshot.docs);
  },

  async getById(id) {
    const docRef = doc(db, COLLECTIONS.COURSES, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...convertTimestamps(snapshot.data()) };
  },

  async getByDepartment(departmentId) {
    const q = query(collection(db, COLLECTIONS.COURSES), where("departmentId", "==", departmentId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByTeacher(teacherId) {
    const q = query(collection(db, COLLECTIONS.COURSES), where("teacherIds", "array-contains", teacherId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getBySemester(departmentId, semester, year) {
    const q = query(
      collection(db, COLLECTIONS.COURSES),
      where("departmentId", "==", departmentId),
      where("semester", "==", semester),
      where("year", "==", year)
    );
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async create(data) {
    const docRef = await addDoc(collection(db, COLLECTIONS.COURSES), {
      ...data,
      teacherIds: data.teacherIds || [],
      status: "active",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return this.getById(docRef.id);
  },

  async update(id, data) {
    const docRef = doc(db, COLLECTIONS.COURSES, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    return this.getById(id);
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.COURSES, id));
    return { success: true };
  },

  async assignTeacher(courseId, teacherId) {
    const docRef = doc(db, COLLECTIONS.COURSES, courseId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) throw new Error("Course not found");
    const currentTeachers = snapshot.data().teacherIds || [];
    if (!currentTeachers.includes(teacherId)) {
      await updateDoc(docRef, {
        teacherIds: [...currentTeachers, teacherId],
        updatedAt: serverTimestamp(),
      });
    }
    return this.getById(courseId);
  },

  async removeTeacher(courseId, teacherId) {
    const docRef = doc(db, COLLECTIONS.COURSES, courseId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) throw new Error("Course not found");
    const currentTeachers = snapshot.data().teacherIds || [];
    await updateDoc(docRef, {
      teacherIds: currentTeachers.filter((id) => id !== teacherId),
      updatedAt: serverTimestamp(),
    });
    return this.getById(courseId);
  },
};

// ============================================================
// ATTENDANCE SERVICE
// ============================================================
export const attendanceService = {
  async getByCourseAndDate(courseId, date) {
    const dateStr = date instanceof Date ? date.toISOString().split("T")[0] : date;
    const startOfDay = new Date(`${dateStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateStr}T23:59:59.999Z`);

    const q = query(
      collection(db, COLLECTIONS.ATTENDANCE),
      where("courseId", "==", courseId),
      where("date", ">=", Timestamp.fromDate(startOfDay)),
      where("date", "<=", Timestamp.fromDate(endOfDay))
    );
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByStudent(studentId) {
    const q = query(
      collection(db, COLLECTIONS.ATTENDANCE),
      where("studentId", "==", studentId),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByDepartment(departmentId) {
    const q = query(collection(db, COLLECTIONS.ATTENDANCE), where("departmentId", "==", departmentId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByTeacher(teacherId) {
    const q = query(collection(db, COLLECTIONS.ATTENDANCE), where("teacherId", "==", teacherId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async mark(attendanceData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.ATTENDANCE), {
      ...attendanceData,
      date: attendanceData.date instanceof Date ? Timestamp.fromDate(attendanceData.date) : Timestamp.fromDate(new Date(attendanceData.date)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...attendanceData };
  },

  async markBulk(records) {
    const batch = writeBatch(db);
    const results = [];

    for (const record of records) {
      const docRef = doc(collection(db, COLLECTIONS.ATTENDANCE));
      batch.set(docRef, {
        ...record,
        date: record.date instanceof Date ? Timestamp.fromDate(record.date) : Timestamp.fromDate(new Date(record.date)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      results.push({ id: docRef.id, ...record });
    }

    await batch.commit();
    return results;
  },

  async update(id, data) {
    const docRef = doc(db, COLLECTIONS.ATTENDANCE, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...convertTimestamps(snapshot.data()) };
  },

  async calculatePercentage(studentId, courseId) {
    const q = query(
      collection(db, COLLECTIONS.ATTENDANCE),
      where("studentId", "==", studentId),
      where("courseId", "==", courseId)
    );
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((d) => d.data());
    
    if (records.length === 0) return { percentage: 0, present: 0, total: 0 };
    
    const present = records.filter((r) => r.status === "present" || r.status === "late").length;
    return {
      percentage: Math.round((present / records.length) * 100),
      present,
      total: records.length,
    };
  },
};

// ============================================================
// MARKS SERVICE
// ============================================================
export const marksService = {
  async getByStudent(studentId) {
    const q = query(
      collection(db, COLLECTIONS.MARKS),
      where("studentId", "==", studentId),
      orderBy("date", "desc")
    );
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByCourse(courseId) {
    const q = query(collection(db, COLLECTIONS.MARKS), where("courseId", "==", courseId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByDepartment(departmentId) {
    const q = query(collection(db, COLLECTIONS.MARKS), where("departmentId", "==", departmentId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByTeacher(teacherId) {
    const q = query(collection(db, COLLECTIONS.MARKS), where("teacherId", "==", teacherId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByExamType(courseId, examType) {
    const q = query(
      collection(db, COLLECTIONS.MARKS),
      where("courseId", "==", courseId),
      where("examType", "==", examType)
    );
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async create(marksData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.MARKS), {
      ...marksData,
      date: marksData.date instanceof Date ? Timestamp.fromDate(marksData.date) : Timestamp.fromDate(new Date(marksData.date)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...marksData };
  },

  async createBulk(records) {
    const batch = writeBatch(db);
    const results = [];

    for (const record of records) {
      const docRef = doc(collection(db, COLLECTIONS.MARKS));
      batch.set(docRef, {
        ...record,
        date: record.date instanceof Date ? Timestamp.fromDate(record.date) : Timestamp.fromDate(new Date(record.date)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      results.push({ id: docRef.id, ...record });
    }

    await batch.commit();
    return results;
  },

  async update(id, data) {
    const docRef = doc(db, COLLECTIONS.MARKS, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...convertTimestamps(snapshot.data()) };
  },

  async calculatePercentage(studentId, courseId) {
    const q = query(
      collection(db, COLLECTIONS.MARKS),
      where("studentId", "==", studentId),
      where("courseId", "==", courseId)
    );
    const snapshot = await getDocs(q);
    const records = snapshot.docs.map((d) => d.data());
    
    if (records.length === 0) return { percentage: 0, totalMarks: 0, maxMarks: 0 };
    
    const totalMarks = records.reduce((sum, r) => sum + (r.marks || 0), 0);
    const maxMarks = records.reduce((sum, r) => sum + (r.maxMarks || 0), 0);
    
    return {
      percentage: maxMarks > 0 ? Math.round((totalMarks / maxMarks) * 100) : 0,
      totalMarks,
      maxMarks,
    };
  },
};

// ============================================================
// NOTIFICATIONS SERVICE
// ============================================================
export const notificationsService = {
  async getForUser(userId, userRole, departmentId) {
    const q = query(
      collection(db, COLLECTIONS.NOTIFICATIONS),
      where("targetType", "in", ["all", "role", "department", "user"]),
      orderBy("createdAt", "desc"),
      limit(50)
    );
    const snapshot = await getDocs(q);
    const allNotifications = convertTimestampsInArray(snapshot.docs);
    
    return allNotifications.filter((n) => {
      if (n.targetType === "all") return true;
      if (n.targetType === "role" && n.targetId === userRole) return true;
      if (n.targetType === "department" && n.targetId === departmentId) return true;
      if (n.targetType === "user" && n.targetId === userId) return true;
      return false;
    });
  },

  async getAll() {
    const q = query(collection(db, COLLECTIONS.NOTIFICATIONS), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async create(notificationData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.NOTIFICATIONS), {
      ...notificationData,
      readBy: [],
      createdAt: serverTimestamp(),
    });
    return { id: docRef.id, ...notificationData, readBy: [] };
  },

  async markAsRead(notificationId, userId) {
    const docRef = doc(db, COLLECTIONS.NOTIFICATIONS, notificationId);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) throw new Error("Notification not found");
    
    const readBy = snapshot.data().readBy || [];
    if (!readBy.includes(userId)) {
      await updateDoc(docRef, { readBy: [...readBy, userId] });
    }
    return { success: true };
  },

  async markAllAsRead(userId, userRole, departmentId) {
    const notifications = await this.getForUser(userId, userRole, departmentId);
    const batch = writeBatch(db);
    
    for (const n of notifications) {
      if (!n.readBy.includes(userId)) {
        batch.update(doc(db, COLLECTIONS.NOTIFICATIONS, n.id), { readBy: [...n.readBy, userId] });
      }
    }
    
    await batch.commit();
    return { success: true };
  },

  async getUnreadCount(userId, userRole, departmentId) {
    const notifications = await this.getForUser(userId, userRole, departmentId);
    return notifications.filter((n) => !n.readBy.includes(userId)).length;
  },
};

// ============================================================
// EXAMINATIONS SERVICE
// ============================================================
export const examinationsService = {
  async getAll() {
    const snapshot = await getDocs(collection(db, COLLECTIONS.EXAMINATIONS));
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByDepartment(departmentId) {
    const q = query(collection(db, COLLECTIONS.EXAMINATIONS), where("departmentId", "==", departmentId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async getByCourse(courseId) {
    const q = query(collection(db, COLLECTIONS.EXAMINATIONS), where("courseId", "==", courseId));
    const snapshot = await getDocs(q);
    return convertTimestampsInArray(snapshot.docs);
  },

  async create(examData) {
    const docRef = await addDoc(collection(db, COLLECTIONS.EXAMINATIONS), {
      ...examData,
      date: examData.date instanceof Date ? Timestamp.fromDate(examData.date) : Timestamp.fromDate(new Date(examData.date)),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { id: docRef.id, ...examData };
  },

  async update(id, data) {
    const docRef = doc(db, COLLECTIONS.EXAMINATIONS, id);
    await updateDoc(docRef, { ...data, updatedAt: serverTimestamp() });
    const snapshot = await getDoc(docRef);
    return { id: snapshot.id, ...convertTimestamps(snapshot.data()) };
  },

  async delete(id) {
    await deleteDoc(doc(db, COLLECTIONS.EXAMINATIONS, id));
    return { success: true };
  },
};

export default {
  users: usersService,
  departments: departmentsService,
  students: studentsService,
  teachers: teachersService,
  courses: coursesService,
  attendance: attendanceService,
  marks: marksService,
  notifications: notificationsService,
  examinations: examinationsService,
};