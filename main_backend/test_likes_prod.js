const fetch = require('node-fetch'); // Ensure node-fetch is available if node < 18

async function run() {
  const PROD_URL = "https://api.inkedfact.online";

  // 1. Get an article
  let res = await fetch(`${PROD_URL}/api/feed?limit=1`);
  let data = await res.json();
  const articleId = data.data[0]._id;
  console.log("Article ID:", articleId, "Likes:", data.data[0].likes);

  // 2. Register User 1
  res = await fetch(`${PROD_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: "User 1", email: `test1_${Date.now()}@test.com`, password: "password123" })
  });
  const u1 = await res.json();
  console.log("User 1 ID:", u1.data.id);

  // 3. Register User 2
  res = await fetch(`${PROD_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: "User 2", email: `test2_${Date.now()}@test.com`, password: "password123" })
  });
  const u2 = await res.json();
  console.log("User 2 ID:", u2.data.id);

  // 4. Like as User 1
  res = await fetch(`${PROD_URL}/api/interactions/like/${articleId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: u1.data.id })
  });
  const like1 = await res.json();
  console.log("Like 1 Result:", like1);

  // 5. Like as User 2
  res = await fetch(`${PROD_URL}/api/interactions/like/${articleId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: u2.data.id })
  });
  const like2 = await res.json();
  console.log("Like 2 Result:", like2);

  // 6. Fetch article again
  res = await fetch(`${PROD_URL}/api/feed?limit=1`);
  data = await res.json();
  console.log("Final Article Likes:", data.data[0].likes);
}
run().catch(console.error);
