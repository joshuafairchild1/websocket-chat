'use strict'

import { assert } from 'chai'
import ConfigurationBuilder from './ConfigurationBuilder'

type Key = { [key: string]: Symbol }
class Point { constructor(public x: number, public y: number) {} }

describe('ConfigurationBuilder', function() {

  it('builds a configuration from primitives', function() {
    const configuration = new ConfigurationBuilder<string, number>()
      .add('1', 1)
      .add('2', 2)
      .add('3', 3)
      .build()
    assert.deepEqual(configuration, new Map([
      [ '1', 1 ],
      [ '2', 2 ],
      [ '3', 3 ]
    ]))
  })

  it('builds a configuration from classes and types', function() {
    const key1: Key = { hello: Symbol('world') }
    const key2: Key = { other: Symbol('other') }
    const key3: Key = { third: Symbol('third') }
    const value1 = new Point(1, 1)
    const value2 = new Point(2, 2)
    const value3 = new Point(3, 3)

    const configuration = new ConfigurationBuilder<Key, Point>()
      .add(key1, value1)
      .add(key2, value2)
      .add(key3, value3)
      .build()

    assert.deepEqual(configuration, new Map([
      [ key1, value1 ],
      [ key2, value2 ],
      [ key3, value3 ],
    ]))
  })

})