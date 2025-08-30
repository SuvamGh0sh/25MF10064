const http = require("http");
const crypto = require("crypto");

// In-memory storage
const users = {}; // { username: { password: "hashedPassword" } }

// Password hashing
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Signup function
function signup(username, password) {
  if (!username || !password) {
    return { status: 400, message: "Username and password are required" };
  }
  if (users[username]) {
    return { status: 409, message: "User already exists" };
  }

  users[username] = { password: hashPassword(password) };
  return { status: 201, message: "User created successfully" };
}

// Login function
function login(username, password) {
  if (!username || !password) {
    return { status: 400, message: "Username and password are required" };
  }
  if (!users[username]) {
    return { status: 404, message: "User not found" };
  }

  const hashedPassword = hashPassword(password);
  if (users[username].password !== hashedPassword) {
    return { status: 401, message: "Invalid password" };
  }

  return { status: 200, message: "Login successful" };
}

// Create HTTP server
const server = http.createServer((req, res) => {
  if (req.method === "POST" && (req.url === "/signup" || req.url === "/login")) {
    let body = "";

    req.on("data", chunk => {
      body += chunk.toString();
    });

    req.on("end", () => {
      try {
        const { username, password } = JSON.parse(body);
        let response;

        if (req.url === "/signup") {
          response = signup(username, password);
        } else {
          response = login(username, password);
        }

        res.writeHead(response.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify(response));
      } catch (err) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ status: 500, message: "Server error" }));
      }
    });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: 404, message: "Not found" }));
  }
});

// Run server
server.listen(3000, () => {
  console.log("Auth server running on http://localhost:3000");
});
