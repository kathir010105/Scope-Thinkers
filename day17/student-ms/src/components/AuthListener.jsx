import { useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useDispatch } from "react-redux";

import { auth, db } from "../firebase/firebase";
import { setUser, clearUser, setLoading } from "../store/authSlice";

function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        dispatch(clearUser());
        return;
      }

      try {
        const userRef = doc(db, "users", firebaseUser.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
          dispatch(clearUser());
          return;
        }

        const profileData = userSnapshot.data();

        // Convert Firebase Timestamp values
        // into normal JavaScript serializable values.
        const profile = {
          ...profileData,

          createdAt: profileData.createdAt
            ? profileData.createdAt.toDate().toISOString()
            : null,

          updatedAt: profileData.updatedAt
            ? profileData.updatedAt.toDate().toISOString()
            : null,
        };

        dispatch(
          setUser({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            },
            profile,
          }),
        );
      } catch (error) {
        console.error("Failed to load user profile:", error);

        dispatch(clearUser());
      } finally {
        dispatch(setLoading(false));
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}

export default AuthListener;
