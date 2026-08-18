(function () {
  var link = document.getElementById('contact-email');
  if (!link) return;

  var local = [99, 97, 114, 108, 111, 115];
  var domain = [116, 97, 114, 114, 97, 116, 115, 46, 120, 121, 122];
  var email = String.fromCharCode.apply(null, local) + String.fromCharCode(64) + String.fromCharCode.apply(null, domain);

  link.href = 'mailto:' + email;
  link.querySelector('[data-email-text]').textContent = email;
}());
