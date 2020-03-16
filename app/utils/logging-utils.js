exports.getDatabaseInteractMsg = (controllerName, messageObj) => {
  console.log(`[controller: ${controllerName}]: DatabaseInteractError:`, messageObj)
}

exports.getUserReqMsg = (controllerName, messageObj) => {
  console.log(`[controller: ${controllerName}]: UserRequestError:`, messageObj)
}

exports.getAuthMsg = (controllerName, messageObj) => {
  console.log(`[controller: ${controllerName}]: AuthError:`, messageObj)
}
