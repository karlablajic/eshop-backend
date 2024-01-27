const mongoose = require ('mongoose');


const connectionStr = 'mongodb+srv://karlab:karlamongo@cluster0.tts66dv.mongodb.net/'

mongoose.connect(connectionStr, {useNewUrlparser: true})
.then(() => console.log('connected to mongodb'))
.catch(err => console.log(err))