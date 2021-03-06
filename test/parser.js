'use strict'
const fs = require('fs')
const path = require('path')
const endpoint = require('endpoint')
const interpreted = require('interpreted')

const shapefileReader = require('../shapefile-reader')

interpreted({
  source: path.resolve(__dirname, 'source'),
  expected: path.resolve(__dirname, 'expected'),

  readSource: false,
  // update: true,

  test: function (name, callback) {
    const dirPath = path.resolve(__dirname, 'source', name)
    fs.readdir(dirPath, function (err, filenames) {
      if (err) return callback(err)

      // Construct an { [ext]: stream } object
      const files = {}
      for (const filename of filenames) {
        if (filename[0] === '.') continue
        const filepath = path.resolve(dirPath, filename)
        const ext = path.extname(filename).slice(1)
        files[ext] = fs.createReadStream(filepath)
      }

      // Create reader and concat items
      const reader = shapefileReader(files)
      reader.pipe(endpoint({ objectMode: true }, function (err, items) {
        if (err) return callback(err)

        // done, also add the header to the dataset
        callback(null, {
          header: reader.header,
          items: items
        })
      }))
    })
  }
})
