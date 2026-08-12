let currentUser = null;
let currentProfile = null;
let currentRole = "public";

async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabaseClient.auth.getUser();

  if (error) {
    console.error("Failed to get user:", error);
    return null;
  }

  return user;
}

async function getCurrentProfile() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabaseClient
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (error) {
    console.error("Failed to get profile:", error);
    return null;
  }

  return data;
}

async function getCurrentRole() {
  const profile = await getCurrentProfile();

  if (!profile) {
    return null;
  }

  return profile.role;
}

async function requireAuth() {
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Failed to get session:", error);
    window.location.href = "login.html";
    return null;
  }

  if (!session) {
    window.location.href = "login.html";
    return null;
  }

  return session.user;
}

async function initializeAuth() {
  const {
    data: { session },
    error,
  } = await supabaseClient.auth.getSession();

  if (error) {
    console.error("Failed to get session:", error);

    currentUser = null;
    currentProfile = null;
    currentRole = "public";

    return;
  }

  // Tidak login = public/user biasa
  if (!session) {
    currentUser = null;
    currentProfile = null;
    currentRole = "public";

    console.log("Access mode: public");

    return;
  }

  currentUser = session.user;

  const { data: profile, error: profileError } = await supabaseClient
    .from("profiles")
    .select("id, role")
    .eq("id", currentUser.id)
    .single();

  if (profileError) {
    console.error("Failed to load profile:", profileError);

    currentProfile = null;
    currentRole = "public";

    return;
  }

  currentProfile = profile;

  // Gunakan role yang tersimpan di profile.
  // Role yang didukung:
  // admin
  // pj_activity
  // pj_bendahara
  // sekretaris
  // pj_brankas
  //
  // Jika role kosong / tidak dikenal, gunakan public.

  const allowedRoles = [
    "admin",
    "pj_activity",
    "pj_bendahara",
    "sekretaris",
    "pj_brankas",
  ];

  if (allowedRoles.includes(profile.role)) {
    currentRole = profile.role;
  } else {
    currentRole = "public";
  }

  console.log("Authenticated user:", currentUser.email);
  console.log("Access role:", currentRole);
}

function isAdmin() {
  return currentRole === "admin";
}

async function logout() {
  const confirmed = confirm("Yakin ingin logout dari Admin?");

  if (!confirmed) {
    return;
  }

  const { error } = await supabaseClient.auth.signOut();

  if (error) {
    console.error("Logout gagal:", error);
    alert("Logout gagal.");
    return;
  }

  // Reset state aplikasi
  currentUser = null;
  currentProfile = null;
  currentRole = "public";

  // Kembali sebagai public
  window.location.href = "index.html";
}
