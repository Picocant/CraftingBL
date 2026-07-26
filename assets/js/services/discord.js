async function sendDiscordWebhook(type, payload) {
  try {
    const { data, error } = await supabaseClient.functions.invoke(
      "send-discord",
      {
        body: {
          type: type,
          payload: payload,
        },
      },
    );

    if (error) {
      console.error("Edge Function error:", error);
      alert("Gagal mengirim transaksi ke Discord.");
      return false;
    }

    if (!data?.success) {
      console.error("Discord response error:", data);
      alert(data?.error || "Gagal mengirim transaksi ke Discord.");
      return false;
    }

    return true;
  } catch (error) {
    console.error("Discord send error:", error);
    alert("Terjadi kesalahan saat mengirim ke Discord.");
    return false;
  }
}
