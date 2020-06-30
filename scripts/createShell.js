const { spawn } = require('child_process')

module.exports = function createShell(command, stdio = 'pipe') {
  return spawn(command, {
    stdio,
    shell: true
  })
}