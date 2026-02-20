import "./style.css";
import { ConsentBox } from "@soyio/soyio-widget";

const consentConfigs = [
  {
    mountSelector: "#consent-request-box",
    consentTemplateId: "constpl_PNq-AgaYV9rzL4IubWpWTA",
  },
  {
    mountSelector: "#consent-request-box-2",
    consentTemplateId: "constpl_wOYf6QrcLqEHsN3eUkzGeg",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  consentConfigs.forEach(({ mountSelector, consentTemplateId }) => {
    const consentBox = new ConsentBox({
      consentTemplateId,
      isSandbox: true,
      onReady: () => console.log(`✅ ConsentBox listo: ${consentTemplateId}`),
      onEvent: (data) => console.log("📩 Evento del widget:", data),
    });

    consentBox.mount(mountSelector);
  });

  const organizationSiteInput = document.querySelector("#organization-site");
  const organizationSiteError = document.querySelector("#organization-site-error");
  const form = document.querySelector(".contact-form");

  const validateOrganizationSite = () => {
    if (!organizationSiteInput) return true;

    const value = organizationSiteInput.value.trim();

    if (!value) {
      organizationSiteInput.setCustomValidity("Ingresa la URL del sitio web.");
    } else {
      try {
        const parsedUrl = new URL(value);
        const hasValidProtocol = parsedUrl.protocol === "https:" || parsedUrl.protocol === "http:";
        const hasValidHost = parsedUrl.hostname.includes(".") && !parsedUrl.hostname.endsWith(".");

        if (!hasValidProtocol || !hasValidHost) {
          throw new Error("Invalid URL");
        }

        organizationSiteInput.setCustomValidity("");
      } catch {
        organizationSiteInput.setCustomValidity("Ingresa una URL válida. Ejemplo: https://empresa.com");
      }
    }

    const isValid = organizationSiteInput.checkValidity();
    organizationSiteInput.classList.toggle("is-invalid", !isValid);

    if (organizationSiteError) {
      organizationSiteError.hidden = isValid;
      organizationSiteError.textContent = isValid ? "" : organizationSiteInput.validationMessage;
    }

    return isValid;
  };

  if (organizationSiteInput) {
    organizationSiteInput.addEventListener("input", validateOrganizationSite);
    organizationSiteInput.addEventListener("blur", validateOrganizationSite);
  }

  if (form) {
    form.addEventListener("submit", (event) => {
      if (!validateOrganizationSite()) {
        event.preventDefault();
      }
    });
  }
});
