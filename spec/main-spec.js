'use babel'
/* eslint-env jasmine */

import path from 'path'

describe('builder-go', () => {
  let mainModule = null

  beforeEach(() => {
    waitsForPromise(() => {
      return atom.packages.activatePackage('go-config').then(() => {
        return atom.packages.activatePackage('builder-go')
      }).then((pack) => {
        mainModule = pack.mainModule
      })
    })

    waitsFor(() => {
      return mainModule.getGoconfig() !== false
    })
  })

  describe('when the builder-go package is activated', () => {
    it('activates successfully', () => {
      expect(mainModule).toBeDefined()
      expect(mainModule).toBeTruthy()
      expect(mainModule.getBuilder).toBeDefined()
      expect(mainModule.getGoconfig).toBeDefined()
      expect(mainModule.consumeGoconfig).toBeDefined()
      expect(mainModule.getGoconfig()).toBeTruthy()
      expect(mainModule.getBuilder()).toBeTruthy()
    })
  })

  describe('getMessages', () => {
    it('ignores duplicate errors', () => {
      let builder = mainModule.getBuilder()

      // GIVEN the same results from both 'go install' and 'go test'
      let outputs = [
        {
          'output': '# github.com/anonymous/sample-project\n.\\the-file.go:12: syntax error: unexpected semicolon or newline, expecting comma or }',
          'linterName': 'build'
        },
        {
          'output': '# github.com/anonymous/sample-project\n.\\the-file.go:12: syntax error: unexpected semicolon or newline, expecting comma or }',
          'linterName': 'test'
        }
      ]

      // WHEN I get the messages for these outputs
      let messages = builder.getMessages(outputs, path.join('src', 'github.com', 'anonymous', 'sample-project'))

      // THEN I expect only one message to be returned because they are the same
      expect(messages.length).toEqual(1)

      let message = messages[0]
      expect(message.name).toEqual('build')
      expect(message.text.indexOf('syntax error: unexpected semicolon or newline, expecting comma or }') === 0).toBeTruthy()
      expect(message.filePath.indexOf('the-file.go') > 0).toBeTruthy() // file is in the path
      expect(message.filePath.indexOf('sample-project') > 0).toBeTruthy() // cwd is in the path
      expect(message.row).toEqual('12')
    })
  })
})
