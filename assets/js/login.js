const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");
const loginButton = document.getElementById("loginButton");

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPassword").value;

  loginError.classList.add("hidden");

  loginButton.disabled = true;
  loginButton.textContent = "Memproses...";

  const { data, error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Login failed:", error);

    loginError.textContent = "Email atau password salah.";
    loginError.classList.remove("hidden");

    loginButton.disabled = false;
    loginButton.textContent = "Login";

    return;
  }

  console.log("Login success:", data.user);

  window.location.href = "index.html";
});
