function debounce(func, delay = 250) {
  let timerId;
  return function (...args) {
    if (timerId) {
      clearTimeout(timerId);
    }
    timerId = setTimeout(() => {
      func.apply(this, args);
    }, delay);
  };
}

function hookPageCaching() {
  // Restore the cached content
  const cachedContent = sessionStorage.getItem("content");
  if (cachedContent) {
    document.getElementById("content").innerHTML = cachedContent;
  }

  // Restore form field values inside the #content div
  const formFields = document.querySelectorAll(
    "#content input, #content select, #content textarea"
  );
  formFields.forEach((field) => {
    const cachedValue = sessionStorage.getItem(field.id);
    if (cachedValue) {
      if (field.type === "checkbox" || field.type === "radio") {
        field.checked = cachedValue === "true";
      } else {
        field.value = cachedValue;
      }
    }
  });

  // Add event listener to cache the content and form field values before unload
  window.addEventListener("beforeunload", () => {
    // Cache the entire content's innerHTML
    sessionStorage.setItem(
      "content",
      document.getElementById("content").innerHTML
    );

    // Cache form field values inside the #content div
    formFields.forEach((field) => {
      if (field.type === "checkbox" || field.type === "radio") {
        sessionStorage.setItem(field.id, field.checked);
      } else {
        sessionStorage.setItem(field.id, field.value);
      }
    });
  });
}
