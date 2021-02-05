const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.questionAsync = question => {
  return new Promise((resolve, reject) => {
    rl.question(question, str => {
      resolve(str)
    })
  })
}

module.exports = rl
