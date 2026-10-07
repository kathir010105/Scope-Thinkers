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

        const profile = userSnapshot.data();

        const serializableProfile = {
          ...profile,
          createdAt: profile.createdAt?.toDate
            ? profile.createdAt.toDate().toISOString()
            : profile.createdAt,
        };

        dispatch(
          setUser({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
            },
            profile: serializableProfile,
          }),
        );
      } catch (error) {
        console.error("Failed to load user profile:", error);

        dispatch(clearUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return null;
}

export default AuthListener;
