// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCcC8aMdi_2M6WXwSm1jwY6fEUKTBNvbgI",
  authDomain: "dionysus-yashverse.firebaseapp.com",
  projectId: "dionysus-yashverse",
  storageBucket: "dionysus-yashverse.firebasestorage.app",
  messagingSenderId: "806191764814",
  appId: "1:806191764814:web:125fa86de86ce5b8f57a1f",
  measurementId: "G-MSCY0L257M",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Only initialize analytics in the browser
declare const window: any;
let analytics: any = null;
if (typeof window !== "undefined") {
  // This code runs only in the browser
  analytics = getAnalytics(app);
}

export const storage = getStorage(app);

export async function uploadFile(
  file: File,
  setProgress: (progress: number) => void,
) {
  return new Promise((resolve, reject) => {
    try {
      const storageRef = ref(storage, file.name);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100,
          );
          if (setProgress) {
            setProgress(progress);
          }
          switch (snapshot.state) {
            case "paused":
              console.log("Upload is paused");
              break;
            case "running":
              console.log("Upload is running");
              break;
          }
        },
        (error) => {
          console.error("Error uploading file:", error);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL as string);
          });
        },
      );
    } catch (error) {
      console.error("Error uploading file:", error);
      reject(error);
    }
  });
}
