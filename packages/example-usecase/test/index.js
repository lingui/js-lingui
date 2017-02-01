import fs from 'fs'
import path from 'path'
import React from 'react'
import { mount, shallow } from 'enzyme'

import Usecase from '../index'

const rmdir = (dir) => {
  const list = fs.readdirSync(dir)

  for(let i = 0; i < list.length; i++) {
    const filename = path.join(dir, list[i])
    const stat = fs.statSync(filename)

    if(filename == "." || filename == "..") {
      // pass these files
    } else if(stat.isDirectory()) {
      // rmdir recursively
      rmdir(filename);
    } else {
      // rm fiilename
      fs.unlinkSync(filename)
    }
  }
  fs.rmdirSync(dir)
}


describe('example-usecase', function() {
  afterAll(function() {
    rmdir('./locale')
  })

  const getText = (element, props = {}) => {
    return mount(<Usecase {...props} />).find(element).text()
  }

  const getHtml = (element, props = {}) => {
    return shallow(<Usecase {...props} />).find(element).html()
  }

  it('should render', function() {
    expect(mount(<Usecase />)).toMatchSnapshot()
  })

  it('should render defaults with warning for untranslated', function() {
    expect(getText('.untranslated')).toEqual("This isn't translated")
  })

  it('should support custom message id', function() {
    expect(getText('.customId')).toEqual('Label')
  })

  it('should render translated string', function() {
    expect(getText('.translated')).toEqual('Ahoj světe')
  })

  it('should support variable substitution', function() {
    expect(getText('.variable')).toEqual('Jmenuji se Mononoke')
    expect(getText('.variable', { name: 'Fred' })).toEqual('Jmenuji se Fred')
  })

  it('should support nested elements', function() {
    expect(getHtml('.components'))
      .toEqual('<span class=\"components\">Read <a href=\"/mononoke\">more</a>.</span>')
  })

  it('should support pluralization', function() {
    expect(getText('.plural'))
      .toEqual('Wilma invites Fred and 3 other people to her party.')
  })
})
