const Joi = require('joi');
const express = require('express');
const app = express();
//const url = '#';

app.use(express.json());
app.use(express.static(__dirname + "/public"));

const users = [
{   
    name: "John Pope",
    username: "jaypee", 
    email: "jaypee@rmw.com", 
    phone: 9978888 
},
{
    name:"Jane Fire",
    username: "firejet", 
    email: "firejet@rmw.com", 
    phone: 33333356
},
{
    name:"Papa Sun",
    username: "sunpa", 
    email: "sunpa@rmw.com", 
    phone: 22445533 
}
];


// API routes - user
app.post('/api/v1/users', (res, req) => {
const schema = Joi.object().keys({
    name: Joi.string().min(3).required(),
    username: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    phone: Joi.string().regex(/^\d{3}-\d{3}-\d{4}$/).required()
});

const result = Joi.validate(req.body, schema);
if(result.error) {
    res.status(400).send(result.error.details[0].message);
    return;
}
const user = {
    name: req.body.name,
    username: req.body.username,
    email: req.body.email,
    phone: req.body.phone
  };
  users.push(user);
  res.send(user);

}); 


const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started, Listening on port ${port}...`));
