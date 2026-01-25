import { auth, db } from "../firebase/config";
export default function VerifyView() {
  return (
    <div style={{padding: 30}}>
      <h1>Email Verified!</h1>
      <p>You can return to the app now.</p>
    </div>
  );
}
