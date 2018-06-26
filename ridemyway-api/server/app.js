
const express = require('express');
const app = express();
//const url = 'https://eben-k.github.io/Ride-My-Way/';


const rides = [
{
	id: 1,
	name:"John",
    car:"KIA Picanto", 
    location: "Point A", 
    destination: "Point B" 
},
{
    id: 2,
    name:"Jake",
    car: "Toyota Matrix", 
    location: "Point A", 
    destination: "Point B" 
},
  { 
    id: 3,
    name:"Jane",
    car: "Range Rover Sport", 
    location: "Point A", 
    destination: "Point B" 
},   
 ];

app.use(express.json());
app.use(express.static(__dirname + "/public"));



app.get('/api/v1/rides', (req, res) => {
	res.send(rides);
});

app.get('/api/v1/rides/:id', (req, res) => {
	const ride = rides.find(r => r.id === parseInt(req.params.id));
	if(!ride) return res.status(404).send('The ride with the given ID does not exist.')
	res.send(ride);	
});

app.post('/api/v1/rides', (req, res) => {
   const ride = {
    id: rides.length + 1,
    name: req.body.name,
    car: req.body.car,
    location: req.body.location,
    destination: req.body.destination
  };
  rides.push(ride);
  res.send(ride);
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server started, Listening on port ${port}...`));
