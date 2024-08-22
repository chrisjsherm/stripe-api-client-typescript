<h2>Reset your MedSpaah Password</h2>

<p>Before resetting your password, please review our <a href="https://app.medspaah.com/terms-of-service">Terms of Service</a>. By resetting your password, you are agreeing to the Terms of Service.</p>

[#setting url_escaping_charset="UTF-8"]
<p>
  To change your password, visit the URL below.
</p>

<p>
  [#-- The optional 'state' map provided on the Forgot Password API call is 
       exposed in the template as 'state'.
       If we have an application context, append the client_id to ensure the correct application theme when applicable.
  --]
  [#assign url = "${tenant.issuer}/password/change/${changePasswordId}?client_id=${(application.oauthConfiguration.clientId)!''}&tenantId=${user.tenantId}" /]
  [#list state!{} as key, value][#if key != "tenantId" && key != "client_id" && value??][#assign url = url + "&" + key?url + "=" + value?url/][/#if][/#list]
  <a href="${url}">${url}</a>
</p>
