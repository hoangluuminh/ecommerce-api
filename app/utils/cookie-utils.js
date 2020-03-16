const appName = 'BambiToyShop'
const cookieNames = {
  accessToken: [appName, 'AccessToken'].join('_'),
  refreshToken: [appName, 'RefreshToken'].join('_')
}
exports.cookieNames = cookieNames

exports.setCookie = (res, cookie, value, expires) => {
  res.cookie(cookie, value, {
    expires: new Date(Date.now() + expires),
    httpOnly: true
  })
}
