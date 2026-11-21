// Scan sweep: rows are visible from the start; the sweep plays once when the log scrolls into view.
const log = document.querySelector("[data-log]");
if (log && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  log.querySelectorAll(".scan").forEach((row, i) => row.style.setProperty("--d", `${i * 220}ms`));
  new IntersectionObserver((entries, observer) => {
    if (entries.some((e) => e.isIntersecting)) {
      log.classList.add("is-scanning");
      observer.disconnect();
    }
  }, { threshold: 0.3 }).observe(log);
}

// Founding-list form. Without a data-endpoint it opens a ready email to hello@ackly.app instead of pretending to save.
document.querySelectorAll("form[data-waitlist]").forEach((form) => {
  const status = form.querySelector(".form__status");
  const email = form.querySelector('input[type="email"]');
  const say = (state, text) => { status.dataset.state = state; status.textContent = text; };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!email.checkValidity()) {
      email.setAttribute("aria-invalid", "true");
      say("error", "That email address doesn't look complete. Check it and try again.");
      email.focus();
      return;
    }
    email.removeAttribute("aria-invalid");
    const endpoint = form.dataset.endpoint;
    if (!endpoint) {
      const product = form.dataset.product || "Ackly";
      const subject = encodeURIComponent(`Early access: Ackly ${product[0].toUpperCase()}${product.slice(1)}`);
      const body = encodeURIComponent(`Please add ${email.value} to the early access list.`);
      window.location.href = `mailto:hello@ackly.app?subject=${subject}&body=${body}`;
      say("ok", "Your email app should open with a ready message. Send it and you're on the list.");
      return;
    }
    const button = form.querySelector("button");
    button.disabled = true;
    say("", "Sending…");
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      say("ok", "You're on the founding list. We'll email you before launch, and only then.");
    } catch {
      say("error", "That didn't go through. Try again in a minute, or email us directly (address below).");
    } finally {
      button.disabled = false;
    }
  });
});
