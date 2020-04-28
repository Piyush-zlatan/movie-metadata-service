const express = require('express');
const app = express();
const port = 8000;


app.use('/api',require('./routes'));
app.listen(port,function(err){
    if(err){
        console.log(`Error in running on port: ${port}`);
        return;
    }
    console.log(`Server is running on port: ${port}`);

});