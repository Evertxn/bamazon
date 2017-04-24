var mysql = require('mysql');
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "",
    database: "bamazon"
});
//creating the connection and sending an error if it fails
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
});

//variable to be used later
var userChoice;
//runs the app and prompts
displayStore(questions);


// This function displays the store
function displayStore(callback) {
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;

        // creates a cli table with rows and columns to display the database
        var table = new Table({
            head: ["ID", "Product", "Department", "Price", "Quantity"],
            colWidths: [10,40,40,10,20]
        }); // closes table

        for (var i = 0; i < res.length; i++) {
            var row = [];
            row.push(res[i].item_id,
                res[i].product_name,
                res[i].department_name,
                res[i].price,
                res[i].stock_quantity);

            table.push(row);
        }
        console.log();
        console.log(table.toString());
        console.log();

        // Running the callback
        if (callback) {
            callback();
        }
        // otherwise, prompt the user if they would like to continue
        else {
            restart();
        }
    });
}

function questions() {
    // Asks the user for the product they want to buy
    inquirer.prompt([
        {
            name:"buying",
            type: "input",
            message: "Enter the id of the item you would like to purchase."

        }
    ]).then(function(response) {
        userChoice = response.buying;
        quantity(userChoice);
    });
}

function quantity() {
    inquirer.prompt([
        {
            type: "input",
            name: "quantity",
            message: "How many units would you like to purchase?"
        }
    ]).then(function(response) {
        // This grabs the quantity from the table that matches the id
        connection.query(`SELECT stock_quantity, product_name, price FROM products WHERE item_id = ` + userChoice, function(err, res) {
            if (err) throw err;
            // If the amount is less than the stock quantity, then it subtracts the difference and updates the total.
            if (res[0].stock_quantity >= response.quantity) {

                var newQuantity = res[0].stockQuantity - response.quantity;

                connection.query(`UPDATE products SET ? WHERE ?`, [ {stock_quantity: newQuantity }, {item_id: userChoice} ], function(err, res) {
                    if (err) throw err;
                });
c
                // Shows the cost of the purchase
                var cost = res[0].price * response.quantity;
                console.log('\nTotal: $' + cost);
                restart();
            }
            else if (res[0].stock_quantity === 0) {
                console.log('\nSorry ' + res[0].productName + "is no longer in stock. Come back later.\n");
                restart();
            }
            // If the user wants to buy more than the stock amount, it runs the function again and prompts to change their order.
            else {
                console.log("\nIt looks like we don't have enough to complete your order. Please modify your purchase");
                quantity();
            }
        });
    });
};


// This function asks the user if they want to start over
function restart() {
    inquirer.prompt([
        {
            type: "confirm",
            name: "restart",
            message: "Would you like to make another purchase?"
        }
    ]).then(function(res) {
        if (res.restart === true) {
            questions();
        }
        else
        {
            console.log("Thank you for your business!");
            connection.end();
        }
    });
}