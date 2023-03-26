const mongoose = require('mongoose')


module.exports = {
    collectionName: "demo",
    region: "ap-south-1",
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,
    database: process.env.DATABASE_URL,
    // Connect connection with MongoDB Database
    connectDB: function () {
        mongoose.connect(this.database)
    },

    // Disconnect connection with MongoDB Database
    disconnectDB: function () {
        mongoose.disconnect(this.database)
    }
}
// on mongo connection open event print a console statement
mongoose.connection.on('open', function () {
    console.log('Connected to Database (MongoDB) ')
})
