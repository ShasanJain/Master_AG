const API_KEY = "AIzaSyCMbmCS6KGSHRuZWBWS7KsLe3AwID4arfY";

async function testAuth() {
  console.log("Testing Firebase Auth...");
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: `test_${Date.now()}@example.com`,
      password: "password123",
      returnSecureToken: true
    })
  });
  
  const data = await res.json();
  if (data.error) {
    console.error("FIREBASE ERROR:", data.error.message);
    process.exit(1);
  } else {
    console.log("SUCCESS! User created:", data.email);
    console.log("IdToken received.");
    process.exit(0);
  }
}

testAuth();
