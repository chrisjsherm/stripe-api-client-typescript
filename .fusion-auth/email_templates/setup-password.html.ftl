<h2>Welcome to the MedSpaah platform</h2>

<p>
  Your account has been created and you must setup a password. Visit the URL
  below to set up your password.
<p>

<p>
  [#assign url = "${tenant.issuer}/password/change/${changePasswordId}?client_id=${(application.oauthConfiguration.clientId)!''}&tenantId=${user.tenantId}" /]

  <a href="${url}">
    ${url}
  </a>
</p>