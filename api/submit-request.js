const REQUIRED_FIELDS = [
  "fullName",
  "corporateEmail",
  "country",
  "organization",
  "organizationSite",
  "teamSize",
  "jobTitle",
  "need",
  "details",
  "preferredContact",
];

const isMissing = (value) => typeof value !== "string" || value.trim() === "";

const parseBody = (body) => {
  if (!body) return {};
  if (typeof body === "string") {
    try {
      return JSON.parse(body);
    } catch {
      return {};
    }
  }
  return body;
};

const toSafeString = (value) => (typeof value === "string" ? value.trim() : "");

// const buildSlackPayload = (data) => ({
//   text: `Nueva solicitud web de ${data.fullName} (${data.organization})`,
//   blocks: [
//     {
//       type: "header",
//       text: {
//         type: "plain_text",
//         text: "Nueva solicitud desde formulario web",
//         emoji: true,
//       },
//     },
//     {
//       type: "section",
//       fields: [
//         { type: "mrkdwn", text: `*Nombre:*\n${data.fullName}` },
//         { type: "mrkdwn", text: `*Email corporativo:*\n${data.corporateEmail}` },
//         { type: "mrkdwn", text: `*País:*\n${data.country}` },
//         { type: "mrkdwn", text: `*Organización:*\n${data.organization}` },
//         { type: "mrkdwn", text: `*Sitio web:*\n${data.organizationSite}` },
//         { type: "mrkdwn", text: `*Colaboradores:*\n${data.teamSize}` },
//         { type: "mrkdwn", text: `*Cargo:*\n${data.jobTitle}` },
//         { type: "mrkdwn", text: `*Contacto preferido:*\n${data.preferredContact}` },
//       ],
//     },
//     {
//       type: "section",
//       text: {
//         type: "mrkdwn",
//         text: `*Necesidad principal:*\n${data.need}`,
//       },
//     },
//     {
//       type: "section",
//       text: {
//         type: "mrkdwn",
//         text: `*Detalles:*\n${data.details}`,
//       },
//     },
//     {
//       type: "context",
//       elements: [
//         {
//           type: "mrkdwn",
//           text: `Teléfono: ${data.phone || "No informado"} | Fecha (UTC): ${data.submittedAt}`,
//         },
//       ],
//     },
//   ],
// });

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  // const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;

  if (!appsScriptUrl) {
    return res.status(500).json({
      error: "Falta variable de entorno: GOOGLE_APPS_SCRIPT_URL.",
    });
  }

  const rawData = parseBody(req.body);

  for (const field of REQUIRED_FIELDS) {
    if (isMissing(rawData[field])) {
      return res.status(400).json({ error: `Falta el campo obligatorio: ${field}` });
    }
  }

  const data = {
    fullName: toSafeString(rawData.fullName),
    corporateEmail: toSafeString(rawData.corporateEmail),
    country: toSafeString(rawData.country),
    organization: toSafeString(rawData.organization),
    organizationSite: toSafeString(rawData.organizationSite),
    teamSize: toSafeString(rawData.teamSize),
    jobTitle: toSafeString(rawData.jobTitle),
    need: toSafeString(rawData.need),
    details: toSafeString(rawData.details),
    preferredContact: toSafeString(rawData.preferredContact),
    phone: toSafeString(rawData.phone),
    submittedAt: toSafeString(rawData.submittedAt) || new Date().toISOString(),
  };

  try {
    const sheetResponse = await fetch(appsScriptUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    // const slackResponse = await fetch(slackWebhookUrl, {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify(buildSlackPayload(data)),
    // });

    if (!sheetResponse.ok) {
      return res.status(502).json({
        error: "No fue posible guardar la solicitud en Google Sheets.",
        sheetStatus: sheetResponse.status,
        // slackStatus: slackResponse.status,
      });
    }

    return res.status(200).json({ ok: true });
  } catch {
    return res.status(500).json({ error: "Error interno enviando los datos." });
  }
}
