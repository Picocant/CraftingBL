async function sendDiscordWebhook(type, payload) {
  const webhooks = getWebhooks();

  const webhook = webhooks[type];

  if (!webhook) {
    alert(`Webhook "${type}" belum diatur.`);
    return false;
  }

  try {
    const response = await fetch(webhook, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error("Webhook gagal dikirim.");
    }

    return true;
  } catch (error) {
    console.error(error);

    alert(error.message);

    return false;
  }
}
