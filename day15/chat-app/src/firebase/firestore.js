import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "./config";

/* =====================================================
   USERS
===================================================== */

/*
  Create / update user profile
*/
export async function createUserProfile(userData) {
  if (!userData?.uid) {
    throw new Error("User UID is required");
  }

  const userRef = doc(db, "users", userData.uid);

  const userProfile = {
    uid: userData.uid,
    email: userData.email || "",
    username: userData.username || "",
    displayName: userData.displayName || "",
    bio: userData.bio || "",
    photoURL: userData.photoURL || "",
    online: true,
    lastSeen: Date.now(),
    createdAt: userData.createdAt || Date.now(),
  };

  await setDoc(userRef, userProfile, {
    merge: true,
  });

  return userProfile;
}

/*
  Get user by UID
*/
export async function getUserById(uid) {
  if (!uid) {
    throw new Error("UID is required");
  }

  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return serializeDoc({
    id: snapshot.id,
    ...snapshot.data(),
  });
}

/*
  Get user by username
*/
export async function getUserByUsername(username) {
  if (!username) {
    return null;
  }

  const usersRef = collection(db, "users");

  const q = query(usersRef, where("username", "==", username.toLowerCase()));

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];

  return serializeDoc({
    id: userDoc.id,
    ...userDoc.data(),
  });
}

/*
  Search users by username
*/
export async function searchUsers(username) {
  if (!username?.trim()) {
    return [];
  }

  const usersRef = collection(db, "users");

  const q = query(
    usersRef,
    where("username", ">=", username.toLowerCase()),
    where("username", "<=", username.toLowerCase() + "\uf8ff"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => serializeDoc({
    id: doc.id,
    ...doc.data(),
  }));
}

/*
  Search a single user by username
  Used by Sidebar
*/
export async function searchUserByUsername(username) {
  if (!username?.trim()) {
    return null;
  }

  const usersRef = collection(db, "users");

  const q = query(
    usersRef,
    where("username", "==", username.trim().toLowerCase())
  );

  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const userDoc = snapshot.docs[0];

  return serializeDoc({
    id: userDoc.id,
    ...userDoc.data(),
  });
}

/*
  Update online status
*/
export async function updateUserOnlineStatus(uid, online) {
  if (!uid) return;

  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    online,
    lastSeen: Date.now(),
  });
}

/* =====================================================
   CHATS
===================================================== */

/*
  Create or get one-to-one chat
*/
export async function createOrGetChat(userId, otherUserId) {
  if (!userId || !otherUserId) {
    throw new Error("Both user IDs are required");
  }

  /*
    Sort IDs so both users always generate
    the exact same chat ID.
  */
  const participants = [userId, otherUserId].sort();

  const chatId = `${participants[0]}_${participants[1]}`;

  const chatRef = doc(db, "chats", chatId);

  const existingChat = await getDoc(chatRef);

  if (existingChat.exists()) {
    return {
      id: existingChat.id,
      ...existingChat.data(),
    };
  }

  const newChat = {
    chatId,
    participants,
    lastMessage: "",
    lastMessageAt: null,
    createdAt: Date.now(),
  };

  await setDoc(chatRef, newChat);

  return {
    id: chatId,
    ...newChat,
  };
}

/*
  Get chat
*/
export async function getChat(chatId) {
  if (!chatId) {
    throw new Error("Chat ID is required");
  }

  const chatRef = doc(db, "chats", chatId);

  const snapshot = await getDoc(chatRef);

  if (!snapshot.exists()) {
    return null;
  }

  return serializeDoc({
    id: snapshot.id,
    ...snapshot.data(),
  });
}

/*
  Get all chats for user
*/
export async function getUserChats(uid) {
  if (!uid) {
    return [];
  }

  const chatsRef = collection(db, "chats");

  const q = query(chatsRef, where("participants", "array-contains", uid));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => serializeDoc({
    id: doc.id,
    ...doc.data(),
  }));
}

/* =====================================================
   MESSAGES
===================================================== */

/*
  Send message to Firestore
*/
export async function sendMessageToFirestore(chatId, messageData) {
  if (!chatId) {
    throw new Error("Chat ID is missing");
  }

  if (!messageData?.senderId) {
    throw new Error("Sender ID is missing");
  }

  if (!messageData?.receiverId) {
    throw new Error("Receiver ID is missing");
  }

  const messagesRef = collection(db, "chats", chatId, "messages");

  const message = {
    senderId: messageData.senderId,
    receiverId: messageData.receiverId,
    text: messageData.text || "",
    type: messageData.type || "text",

    createdAt: Date.now(),

    status: "sent",
  };

  const messageRef = await addDoc(messagesRef, message);

  /*
    Update parent chat
  */
  const chatRef = doc(db, "chats", chatId);

  await updateDoc(chatRef, {
    lastMessage: message.text,
    lastMessageAt: Date.now(),
  });

  return {
    id: messageRef.id,
    ...message,
  };
}

// Helper to convert Firestore Timestamps to numbers in an object
const serializeDoc = (data) => {
  if (!data) return data;
  const serialized = { ...data };
  for (const key of Object.keys(serialized)) {
    const val = serialized[key];
    if (val && typeof val === 'object' && typeof val.toMillis === 'function') {
      serialized[key] = val.toMillis();
    }
  }
  return serialized;
};

/*
  Get messages from Firestore
*/
export async function getChatMessages(chatId) {
  if (!chatId) {
    throw new Error("Chat ID is missing");
  }

  const messagesRef = collection(db, "chats", chatId, "messages");

  const q = query(messagesRef, orderBy("createdAt", "asc"));

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => serializeDoc({
    id: doc.id,
    ...doc.data(),
  }));
}

/*
  Get latest messages
*/
export async function getLatestMessages(chatId, limitCount = 50) {
  if (!chatId) {
    throw new Error("Chat ID is missing");
  }

  const messages = await getChatMessages(chatId);

  return messages.slice(-limitCount);
}

/* =====================================================
   UPDATE MESSAGE
===================================================== */

/*
  Update message status
*/
export async function updateMessageStatus(chatId, messageId, status) {
  if (!chatId || !messageId) {
    throw new Error("Chat ID and message ID are required");
  }

  const messageRef = doc(db, "chats", chatId, "messages", messageId);

  await updateDoc(messageRef, {
    status,
  });
}

/*
  Delete message
*/
export async function deleteMessageFromFirestore(chatId, messageId) {
  if (!chatId || !messageId) {
    throw new Error("Chat ID and message ID are required");
  }

  const messageRef = doc(db, "chats", chatId, "messages", messageId);

  /*
    We are intentionally not importing deleteDoc yet.
    This can be added when the delete-message UI is implemented.
  */
}

/* =====================================================
   EXPORT
===================================================== */

console.log("Firestore service loaded");
