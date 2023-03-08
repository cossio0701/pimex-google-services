const objectRenameProperties = function (obj, properties) {
  Object.keys(properties).map(property => {
    obj = objectRenameProperty(obj, property, properties[property])

    return obj
  })

  return obj
}

function objectRenameProperty (obj, oldName, newName) {
  // Do nothing if the names are the same
  if (oldName === newName) {
    return obj
  }

  // Check for the old property name to avoid a ReferenceError in strict mode.
  if (Object.hasOwnProperty.call(obj, oldName)) {
    obj[newName] = obj[oldName]
    delete obj[oldName]
  }

  return obj
}

module.exports = {
  objectRenameProperties,
  objectRenameProperty
}
