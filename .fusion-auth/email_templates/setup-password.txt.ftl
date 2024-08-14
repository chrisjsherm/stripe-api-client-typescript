Welcome to the MedSpaah platform

Your account has been created and you must setup a password. Visit the URL below to set up your password.

[#assign url = "${tenant.issuer}/password/change/${changePasswordId}?client_id=${(application.oauthConfiguration.clientId)!''}&tenantId=${user.tenantId}" /]

${url}