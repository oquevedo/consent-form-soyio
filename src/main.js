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
  const formStatus = document.querySelector("#form-status");
  const submitButton = form?.querySelector("button[type='submit']");

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

  const setFormStatus = (message, type) => {
    if (!formStatus) return;

    formStatus.hidden = false;
    formStatus.textContent = message;
    formStatus.classList.remove("is-success", "is-error");

    if (type) {
      formStatus.classList.add(type);
    }
  };

  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const isOrganizationSiteValid = validateOrganizationSite();
      const isFormValid = form.checkValidity();

      if (!isOrganizationSiteValid || !isFormValid) {
        form.reportValidity();
        return;
      }

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());
      payload.phone = payload.phone?.trim() || "";
      payload.submittedAt = new Date().toISOString();

      if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = "Enviando...";
      }
      setFormStatus("Estamos enviando tu solicitud...", "");

      try {
        const response = await fetch("/api/submit-request", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(result?.error || "No fue posible enviar la solicitud.");
        }

        setFormStatus("Solicitud enviada con éxito. Te contactaremos pronto.", "is-success");
        form.reset();

        if (organizationSiteError) {
          organizationSiteError.hidden = true;
          organizationSiteError.textContent = "";
        }
        if (organizationSiteInput) {
          organizationSiteInput.classList.remove("is-invalid");
        }
      } catch (error) {
        setFormStatus(error.message || "Ocurrió un error al enviar la solicitud.", "is-error");
      } finally {
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.textContent = "Enviar solicitud";
        }
      }
    });
  }
});
