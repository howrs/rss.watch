const supportedPropertyIndices = Symbol("supported property indices")
const supportedPropertyNames = Symbol("supported property names")
const HTML_NS = "http://www.w3.org/1999/xhtml"

class HTMLCollection {
  constructor(globalObject, args, privateData) {
    this._list = []
    this._version = -1
    this._element = privateData.element
    this._query = privateData.query

    this._globalObject = globalObject

    this._update()
  }
  get length() {
    this._update()
    return this._list.length
  }
  item(index) {
    this._update()
    return this._list[index] || null
  }
  namedItem(key) {
    if (key === "") {
      return null
    }
    this._update()
    for (const element of this._list) {
      if (element.getAttributeNS(null, "id") === key) {
        return element
      }
      if (element._namespaceURI === HTML_NS) {
        const name = element.getAttributeNS(null, "name")
        if (name === key) {
          return element
        }
      }
    }
    return null
  }
  _update() {
    if (this._version < this._element._version) {
      const snapshot = this._query()
      for (let i = 0; i < snapshot.length; i++) {
        this._list[i] = snapshot[i]
      }
      this._list.length = snapshot.length
      this._version = this._element._version
    }
  }
  get [supportedPropertyIndices]() {
    this._update()
    return this._list.keys()
  }
  get [supportedPropertyNames]() {
    this._update()
    const result = new Set()
    for (const element of this._list) {
      const id = element.getAttributeNS(null, "id")
      if (id) {
        result.add(id)
      }
      if (element._namespaceURI === HTML_NS) {
        const name = element.getAttributeNS(null, "name")
        if (name) {
          result.add(name)
        }
      }
    }
    return result
  }

  // Inherit some useful functions from Array.
  [Symbol.iterator]() {
    this._update()
    return this._list[Symbol.iterator]()
  }
  entries() {
    this._update()
    return this._list.entries()
  }
  filter(...args) {
    this._update()
    return this._list.filter(...args)
  }
  map(...args) {
    this._update()
    return this._list.map(...args)
  }
  indexOf(...args) {
    this._update()
    return this._list.indexOf(...args)
  }
}

globalThis.HTMLCollection = HTMLCollection
