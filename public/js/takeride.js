const rideOptions = {
  'KIA Picanto': { price: '$5.00', airConditioned: true, friendInvite: true },
  'Toyota Matrix': { price: '$8.00', airConditioned: true, friendInvite: false },
  'Range Rover Sport': { price: '$15.00', airConditioned: true, friendInvite: true },
};

const rideSelect = document.getElementById('ride-select');
const rideDetails = document.getElementById('ride-details');
const requestButton = document.getElementById('request-button');

function renderRideDetails(car) {
  const details = rideOptions[car];
  if (!details) {
    rideDetails.innerHTML = '';
    requestButton.disabled = true;
    return;
  }

  rideDetails.innerHTML = `
    <p>Price: ${details.price}</p>
    <p>Air-conditioned: ${details.airConditioned ? 'Yes' : 'No'}</p>
    <p>Friend invite: ${details.friendInvite ? 'Possible' : 'Not possible'}</p>
  `;
  requestButton.disabled = false;
}

rideSelect.addEventListener('change', (event) => {
  renderRideDetails(event.target.value);
});
