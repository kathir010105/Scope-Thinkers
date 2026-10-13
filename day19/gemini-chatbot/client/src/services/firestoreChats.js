import {
  collection,
  addDoc,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase";

function chatsCollection(uid) {
  return collection(db, "users", uid, "chats");
}

function chatDocument(uid, chatId) {
  return doc(db, "users", uid, "chats", chatId);
}

function messagesCollection(uid, chatId) {
  return collection(db, "users", uid, "chats", chatId, "messages");
}

function timestampToMillis(timestamp) {
  return timestamp?.toMillis?.() ?? Date.now();
}

export async function getUserChats(uid) {
  const chatsQuery = query(chatsCollection(uid), orderBy("updatedAt", "desc"));

  const snapshot = await getDocs(chatsQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    title: item.data().title || "New conversation",
    createdAt: timestampToMillis(item.data().createdAt),
    updatedAt: timestampToMillis(item.data().updatedAt),
    messages: [],
  }));
}

export async function createUserChat(uid) {
  const chatRef = doc(chatsCollection(uid));

  await setDoc(chatRef, {
    title: "New conversation",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return {
    id: chatRef.id,
    title: "New conversation",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    messages: [],
  };
}

export async function getChatMessages(uid, chatId) {
  const chatRef = chatDocument(uid, chatId);
  const chatSnapshot = await getDoc(chatRef);

  if (!chatSnapshot.exists()) {
    throw new Error("This conversation no longer exists.");
  }

  const messagesQuery = query(
    messagesCollection(uid, chatId),
    orderBy("createdAt", "asc"),
  );

  const snapshot = await getDocs(messagesQuery);

  return snapshot.docs.map((item) => ({
    id: item.id,
    role: item.data().role,
    text: item.data().text,
    createdAt: timestampToMillis(item.data().createdAt),
  }));
}

export async function saveChatMessage(uid, chatId, role, text) {
  if (!["user", "model"].includes(role)) {
    throw new Error("Invalid message role.");
  }

  const chatRef = chatDocument(uid, chatId);
  const chatSnapshot = await getDoc(chatRef);

  if (!chatSnapshot.exists()) {
    throw new Error("Cannot save a message to a missing chat.");
  }

  const messageRef = await addDoc(messagesCollection(uid, chatId), {
    role,
    text,
    createdAt: serverTimestamp(),
  });

  await setDoc(chatRef, { updatedAt: serverTimestamp() }, { merge: true });

  return {
    id: messageRef.id,
    role,
    text,
    createdAt: Date.now(),
  };
}

export async function updateChatTitle(uid, chatId, title) {
  await setDoc(
    chatDocument(uid, chatId),
    {
      title: title || "New conversation",
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function deleteUserChat(uid, chatId) {
  const chatRef = chatDocument(uid, chatId);
  const snapshot = await getDocs(messagesCollection(uid, chatId));

  // Firestore does not automatically delete subcollections.
  // Remove the messages before deleting the parent chat.
  for (const message of snapshot.docs) {
    await deleteDoc(message.ref);
  }

  await deleteDoc(chatRef);
}
