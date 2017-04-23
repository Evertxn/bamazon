var mysql = require('mysql');
var inquirer = require('inquirer');
var table = require('cli-table');

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


displayStore(startApp);


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
            startOver();
        }
    });
}

function startApp() {
    // Asks the user for the product they want to buy
    inquirer.prompt([
        {
            name:"Buying",
            type: "input",
            message: "Enter the id of the item you would like to purchase.",

        }
    ]).then(function(response) {

    });
}