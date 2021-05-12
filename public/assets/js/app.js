document.getElementById('loan-form').addEventListener('submit', calculateResults);
// Calculate Results
function calculateResults(e){

const amount = document.getElementById('amount');
const interest = document.getElementById('interest');
const months = document.getElementById('years');

const monthlyPayment = document.getElementById('monthly-payment');
const totalPayment = document.getElementById('total-payment');
const totalInterest = document.getElementById('total-interest');

// Turn amount into decimal and store it into variable
const principal = parseFloat(amount.value);
const calculatedInterest = parseFloat(interest.value) /100 / 12;
const calculatedPayment =  parseFloat(months.value);

// Compute monthly payments
const x = Math.pow(1 + calculatedInterest, calculatedPayment);
const monthly = (principal * x * calculatedInterest)/(x-1);

if(isFinite(monthly)){
	monthlyPayment.value = monthly.toFixed(2);
	totalPayment.value = (monthly * calculatedPayment).toFixed(2);
	totalInterest.value = ((monthly * calculatedPayment) - principal).toFixed(2);
}
e.preventDefault();
} 