var inquirer = require('inquirer');
var mysql = require('mysql');

var amountOwed;
var currentDepartment;
var updateSales;

var connection = mysql.createConnection({
	host: 'localhost',
	port: 8889,
	user: 'root',
	password: 'root',
	database: 'Bamazon'
});

//Establish Connection
connection.connect(function(err){
	if (err) throw err;
	console.log('connected as id: ' + connection.threadId)
});


function showProducts(){
	connection.query('SELECT * FROM products', function(err, res){
		if (err) throw err;
		console.log('=================================================');
		console.log('=================Items in Store==================');
		console.log('=================================================');

		for(i=0;i<res.length;i++){
			console.log('Item ID:' + res[i].item_id + ' Product Name: ' + res[i].product_name + ' Price: ' + '$' + res[i].price + '(Quantity left: ' + res[i].stock_quantity + ')')
		}
		console.log('=================================================');
		placeOrder();
		})
}

function placeOrder(){
	inquirer.prompt([{
		name: 'selectId',
		message: 'Please enter the ID of the product you wish to purchase',
		validate: function(value){
			var valid = value.match(/^[0-9]+$/)
			if(valid){
				return true
			}
				return 'Please enter a valid Product ID'
		}
	},{
		name:'selectQuantity',
		message: 'How many of this product would you like to order?',
		validate: function(value){
			var valid = value.match(/^[0-9]+$/)
			if(valid){
				return true
			}
				return 'Please enter a numerical value'
		}
	}]).then(function(answer){
	connection.query('SELECT * FROM products WHERE item_id = ?', [answer.selectId], function(err, res){
		if(answer.selectQuantity > res[0].stock_quantity){
			console.log('Insufficient Quantity');
			console.log('This order has been cancelled');
			console.log('');
			connection.end();
		
		}
		else{
			amountOwed = res[0].price * answer.selectQuantity;
			currentDepartment = res[0].department_name;
			console.log('Thanks for your order');
			console.log('You owe $' + amountOwed);
			console.log('');
		
			connection.query('UPDATE products SET ? Where ?', [{
				stock_quantity: res[0].stock_quantity - answer.selectQuantity
			},{
				item_id: answer.selectId
			}], function(err, res){});
	
			connection.end();
		}
	})

}
, function(err, res){})
};
showProducts();