const app = require('./public/src/app/app')

const port = process.env.port || 3000;



app.listen(port, () => {
    console.log(`server is running ${port}`)
})