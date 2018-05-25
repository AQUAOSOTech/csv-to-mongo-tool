process.title = 'node_csv_mongo_import'

const csv = require('csvtojson')
const fs = require('fs')
const _ = require('lodash')
const mongoose = require('mongoose')
const shortid = require('shortid')

const {MONGO_URI, CSV_FILE, MODEL_NAME} = process.env
const log = console.log

if (!MONGO_URI || !CSV_FILE || !MODEL_NAME) {
  log(`
  Usage:
    MONGO_URI=mongodb://localhost/petdb CSV_FILE=mypets.csv MODEL_NAME=Pets node import.js
`)
  process.exit(1)
}

const start = +new Date()

const Model = mongoose.model(MODEL_NAME, new mongoose.Schema({
  _id: {
    type: String,
    default: () => `wcr-${shortid()}`
  },
  objectId: {
    type: String,
    unique: true
  }
}, { strict: false }))

log({ MONGO_URI, CSV_FILE })

let cursor = 0

mongoose.connect(MONGO_URI)
  .then(() => {
    log('Parsing csv to objects...')

    return csv()
      .fromStream(fs.createReadStream(CSV_FILE))
      .subscribe((json) => {
        cursor++
        log(`Importing line: ${cursor}`)

        return new Model(preprocess(json)).save()
      })
  })
  .then(() => {
    const runtime = (+new Date() - start) / 1000 / 60
    log(`Done in ${runtime.toFixed(2)} minutes`)

    process.exit(0)
  })
  .catch((err) => {
    log(err)
    process.exit(1)
  })


function preprocess(json) {
  // camelCase keys
  json = _.mapKeys(json, (v, k) => _.camelCase(k))

  let value;
  Object.keys(json).forEach((k) => {
    value = json[k].trim()

    if (value) {
      if (k.toLowerCase().includes('date')) {
        json[k] = new Date(json[k])
      } else if (_.isNumber(json[k])) {
        json[k] = parseFloat(json[k])
      }
    }

    json[k] = value;
  })

  return json
}