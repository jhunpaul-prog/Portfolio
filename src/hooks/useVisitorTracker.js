import { useEffect } from "react";
import { db } from "../firebase";
import {
  collection,
  addDoc,
  doc,
  setDoc,
  increment,
  serverTimestamp,
} from "firebase/firestore";

export function useVisitorTracker() {
  useEffect(() => {
    const hasTrackedSession = sessionStorage.getItem("jp_visited_session");

    if (!hasTrackedSession) {
      const recordVisit = async () => {
        try {
          // Record visit log
          await addDoc(collection(db, "analytics_visits"), {
            userAgent: navigator.userAgent,
            language: navigator.language,
            referrer: document.referrer || "Direct / Bookmark",
            timestamp: serverTimestamp(),
            screenResolution: `${window.screen.width}x${window.screen.height}`,
          });

          // Increment aggregate visit counter
          await setDoc(
            doc(db, "analytics_summary", "counter"),
            { totalViews: increment(1), lastVisited: serverTimestamp() },
            { merge: true },
          );

          sessionStorage.setItem("jp_visited_session", "true");
        } catch (err) {
          console.warn("Analytics tracking bypassed:", err.message);
        }
      };

      recordVisit();
    }
  }, []);
}
