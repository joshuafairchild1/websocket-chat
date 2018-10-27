'use strict'

export default class ConfigurationBuilder <K, V> {

  private config = new Map<K, V>()

  add(key: K, value: V): ConfigurationBuilder<K, V> {
    this.config.set(key, value)
    return this
  }

  build(): Map<K, V> {
    return this.config
  }

}