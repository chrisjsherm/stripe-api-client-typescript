<h2>Welcome to the MedSpaah Platform</h2>

<p>
  Your organization has invited you to create an account. Please review our
  <a href="https://app.medspaah.com/terms-of-service">Terms of Service</a> and then visit the URL below to set your password. By setting your password,
  you are agreeing to the <a href="https://app.medspaah.com/terms-of-service">Terms of Service</a>.
<p>

<p>
  [#assign url = "${tenant.issuer}/password/change/${changePasswordId}?client_id=${(application.oauthConfiguration.clientId)!''}&tenantId=${user.tenantId}" /]

  <a href="${url}">
    ${url}
  </a>
</p>