const app = require('./src/app/app')

const port = process.env.port || 3000;



app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})