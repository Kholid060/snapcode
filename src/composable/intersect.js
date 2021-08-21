export default function () {
  const listeners = [];
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const { target } = entry;

        listeners.forEach((callback) => {
          callback(entry);
        });

        observer.unobserve(target);
      }
    });
  });

  function observe(el, callback) {
    listeners.push(callback);
    observer.observe(el);
  }

  return { observe };
}
