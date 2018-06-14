function rideOptions(r1, r2) {
 let r1 = document.getElementById(ride1);
 let r2 = document.getElementById(ride2);
 r2.innerHTML = "";
 if(r1.value == "KIA Picanto") {
   let optionArray = ["|", "price: $5.00|Price: $5.00","air-conditioned|Airconditioned","friend invite possible|Friend Invite Possible"];
 } else if (r1.value == "Toyota Matrix") {
   let optionArray = ["|", "price: $8.00|Price: $8.00","air-conditioned|Airconditioned","friend invite not possible|Friend Invite Not Possible"];
 } else if (r1.value == "Range Rover Sport") {
   let optionArray = ["|", "price: $15.00|Price: $15.00","air-conditioned|Airconditioned","friend invite possible|Friend Invite Possible"];
 }
 for(let option in optionArray) {
   let pair = optionArray[option].split("|");
   let newOption = document.createElement("option");
   newOption.value = pair[0];
   newOption.innerHTML = pair[1];
   s2.options.add(newOption);
 }
}