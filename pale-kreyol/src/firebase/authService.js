export const registerWithEmail = async (email, password) => {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await createUserDoc(cred.user);

  // IMPORTANT: Add redirect URL
  const actionCodeSettings = {
    url: "http://localhost:5173/verify",
    handleCodeInApp: true,
  };

  await sendEmailVerification(cred.user, actionCodeSettings);

  return cred.user;
};
