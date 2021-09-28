//3rd Party Modules
const express = require('express');
const mongoose = require('mongoose');

//Local Modules
const HttpError = require('./models/httpErrors');
const usersRoutes = require('./routes/usersRoutes');

const app = express();
app.use(express.json());

app.use('/api/users',usersRoutes);

app.use((req, res, next)=>{
    const error = new HttpError("Couldn't Find this Route", 404);
    throw error; 
});

mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@mongodbcluster.mcnv5.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,{ useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex:true})
.then(()=>{
    app.listen((process.env.PORT || '3000'), ()=>{
        console.log("Server is listening on port " + (process.env.PORT || '3000'));
    })
})
.catch((error)=>{
    console.log("A error has been occurred while connecting to database, Sorry for inconvenience !!");
});

