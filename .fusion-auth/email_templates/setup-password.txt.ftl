Welcome to the MedSpaah Platform

Your organization has invited you to create an account. Please review our Terms of Service (https://app.medspaah.com/terms-of-service) and then visit the URL below to set your password. By setting your password, you are agreeing to the Terms of Service.

[#assign url = "${tenant.issuer}/password/change/${changePasswordId}?client_id=${(application.oauthConfiguration.clientId)!''}&tenantId=${user.tenantId}" /]

${url}