// Express
const express = require('express')
const app = express()
const port = 4000

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE')
  res.setHeader('Access-Control-Allow-Headers', 'Content-type, Authorization')
  next()
})

var bodyParser = require('body-parser')

// body parserd
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

// Mongoose
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
    await mongoose.connect('mongodb://localhost:27017/TubesPRD');
}

// DB schema
const DataSatuHari = mongoose.model('DataSatuHari', {
    id: String,
    waktu: String,
    temperature: Number,
    activity: Boolean
})

const DataTemperature = mongoose.model('DataTemperature', {
    id: String,
    average: Number,
    jumlah: Number
})

// route to post data
app.post('/api/tambah-data', (req, res) => {
    const data = new DataSatuHari({
        id: req.body.id,
        waktu: req.body.waktu,
        temperature: req.body.temperature,
        activity: req.body.activity
    })
    data.save()
        .then(result => {
            res.status(201).json({
                message: 'Data berhasil ditambahkan',
                result: result
            })
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })    
        })
})

// route to save temperature average
app.post('/api/tambah-data-temperature', (req, res) => {
    DataTemperature.find({
        id: req.body.id
    }).then(result => {
      if(result.length > 0){
        const hasilAverage = (result[0].average * result[0].jumlah + req.body.temperature) / (result[0].jumlah + 1)
        const hasilJumlah = result[0].jumlah + 1
        DataTemperature.findOneAndUpdate({
            id: req.body.id
        }, {
            $set: {
                average: hasilAverage,
                jumlah: hasilJumlah
            }
        }, {
            new: true
        }).then(result => {
            res.status(201).json({
                message: 'Data berhasil ditambahkan',
                result: result
            })
        })
      }else{
        const data = new DataTemperature({
            id: req.body.id,
            average: req.body.temperature,
            jumlah: 1
        })
        data.save()
            .then(result => {
                res.status(201).json({
                    message: 'Data berhasil ditambahkan',
                    result: result
                })
            })
            .catch(err => {
                res.status(500).json({
                    error: err
                })    
            })
      }
    })
})


// route to get average temperature
app.get('/api/get-average-temperature/:id', (req, res) => {
    DataTemperature.find({
        id: req.params.id
    }).then(result => {
        res.status(200).json({
            message: 'Data berhasil ditampilkan',
            result: result
        })
    })
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})