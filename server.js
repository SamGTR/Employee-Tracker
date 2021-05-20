// npm packages and dependencies
const mysql = require("mysql");
const inquirer = require("inquirer");
const promisemysql = require("promise-mysql");
const consoleTable = require("console.table");

const connProperties = {
    host: "localhost",
    port: 3306,
    user: "root",
    password: "samgtrsql",
    database: "employees_DB"
}

const connection = mysql.createConnection(connProperties);

// Establishing Connection to database
connection.connect((err) => {
    if (err) throw err;

    // Initialising the app
    console.log("\n WELCOME TO EMPLOYEE TRACKER \n");
    options();
});

// Function for app start
const options = () => {

    // Prompting user with choices
    inquirer
    .prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "View all employees",
        "View all employees by department",
        "View all employees by manager",
        "View all employees by role",
        "Add employee",
        "Add department",
        "Add role",
        "Update employee role",
        "Update employee manager",
        "Delete employee",
        "Delete department",
        "Delete role",
        "View department budgets"
      ]
    })
    .then((answer) => {

        // Calling function based on user choice
        switch (answer.action) {
            case "View all employees":
                allEmp();
                break;

            case "View all employees by department":
                empByDept();
                break;

            case "View all employees by manager":
                empByMngr();
                break;

            case "View all employees by role":
                empByRole();
                break;

            case "Add employee":
                addEmp();
                break;

            case "Add department":
                addDept();
                break;

            case "Add role":
                addRole();
                break;

            case "Update employee role":
                updateEmpRole();
                break;

            case "Update employee manager":
                updateEmpMngr();
                break;
            
            case "Delete employee":
                deleteEmp();
                break;

            case "Delete department":
                deleteDept();
                break;  

            case "Delete role":
                deleteRole();
                break;   

            case "View department budgets":
                deptBudget();
                break;         
            
        }
    });
}

// Function to view all employees 
const allEmp = () => {

    // Query for viewing all employees
    let query = "SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary, ";     
    query += "concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id "; 
    query += "INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY ID ASC";

    connection.query(query, function(err, res) {
        if(err) return err;
        console.log("\n");

        // Displaying the result in tabular form
        console.table(res);

        // Returning to main menu
        options();
    });
}

// Function to view all employees by department
const empByDept = () => {

    // Array to store department names
    let deptArr = [];

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties
    ).then((conn) => {

        // Returning names of departments
        return conn.query('SELECT name FROM department');
    }).then(function(value){

        // Storing dept names in array
        // deptQuery = value;
        for (var i=0; i < value.length; i++){
            deptArr.push(value[i].name);
            
        }
    }).then(() => {

        // Prompting user to select department from the list
        inquirer.prompt({
            name: "department",
            type: "list",
            message: "Which department would you like to search?",
            choices: deptArr
        })    
        .then((answer) => {

            // Query for viewing all employees based on the department selected
            let query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title,`;
            query += ` department.name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager`;
            query += ` FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id`;
            query += ` INNER JOIN department ON role.department_id = department.id WHERE department.name = '${answer.department}' ORDER BY ID ASC`;
            connection.query(query, (err, res) => {
                if(err) return err;
                
                // Displaying the result in tabular form
                console.log("\n");
                console.table(res);

                // Returning to main menu
                options();
            });
        });
    });
}

// Function to view all employees by manager
const empByMngr = () => {

    // Array to store manager names
    let managerArr = [];

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties)
    .then((conn) => {

        // Returning names of managers
        return conn.query("SELECT DISTINCT m.id, CONCAT(m.first_name, ' ', m.last_name) AS manager FROM employee e Inner JOIN employee m ON e.manager_id = m.id");

    }).then(function(managers){

        // Storing all managers names in array
        for (var i=0; i < managers.length; i++){
            managerArr.push(managers[i].manager);
        }

        return managers;
    }).then((managers) => {

        inquirer.prompt({

            // Prompting user to select manager from list
            name: "manager",
            type: "list",
            message: "Which manager would you like to search?",
            choices: managerArr
        })    
        .then((answer) => {

            let managerID;

            // Getting selected manager ID 
            for (var i=0; i < managers.length; i++){
                if (answer.manager == managers[i].manager){
                    managerID = managers[i].id;
                }
            }

            // Query for viewing all employees based on the manager selected
            let query = `SELECT e.id, e.first_name, e.last_name, role.title, department.name AS department, role.salary,`;
            query += ` concat(m.first_name, ' ' ,  m.last_name) AS manager FROM employee e LEFT JOIN employee m ON e.manager_id = m.id`;
            query += ` INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id WHERE e.manager_id = ${managerID};`;
    
            connection.query(query, (err, res) => {
                if(err) return err;
                
                // Displaying the result in tabular form
                console.log("\n");
                console.table(res);
                options();
            });
        });
    });
}

// Function to view all employees by role
const empByRole = () => {

    // Array to store all roles names
    let roleArr = [];

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties)
    .then((conn) => {

        // Returning names of roles
        return conn.query('SELECT title FROM role');
    }).then(function(roles){

        // Storing all roles in array
        for (var i=0; i < roles.length; i++){
            roleArr.push(roles[i].title);
        }
    }).then(() => {

        // Prompting user to select a role from the list
        inquirer.prompt({
            name: "role",
            type: "list",
            message: "Which role would you like to search?",
            choices: roleArr
        })    
        .then((answer) => {

            // Query for viewing all employees based on the role selected
            let query = `SELECT e.id AS ID, e.first_name AS 'First Name', e.last_name AS 'Last Name', role.title AS Title,`;
            query += ` department.name AS Department, role.salary AS Salary, concat(m.first_name, ' ' ,  m.last_name) AS Manager`;
            query += ` FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id`;
            query += ` INNER JOIN department ON role.department_id = department.id WHERE role.title = '${answer.role}' ORDER BY ID ASC`;
            connection.query(query, (err, res) => {
                if(err) return err;

                // Displaying the result in tabular form
                console.log("\n");
                console.table(res);
                options();
            });
        });
    });
}

// Function to add employee
const addEmp = () => {

    // Arrays for stoing role and manager details
    let roleArr = [];
    let managerArr = [];

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties
    ).then((conn) => {

        // Promise for querying managers and roles
        return Promise.all([
            conn.query('SELECT id, title FROM role ORDER BY title ASC'), 
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
        ]);
    }).then(([roles, managers]) => {

        // Storing roles names in array
        for (var i=0; i < roles.length; i++){
            roleArr.push(roles[i].title);
        }

        // Storing managers names in array
        for (var i=0; i < managers.length; i++){
            managerArr.push(managers[i].Employee);
        }

        return Promise.all([roles, managers]);
    }).then(([roles, managers]) => {

        // Adding option for no manager
        managerArr.unshift('--');

        inquirer.prompt([
            {
                // Prompting user to enter first name of the employee
                name: "firstName",
                type: "input",
                message: "First name: ",
                // Validating a name is entered
                validate: function(input){
                    if (input === ""){
                        console.log("**FIELD REQUIRED**");
                        return false;
                    }
                    else{
                        return true;
                    }
                }
            },
            {
                // Prompting user to enter last name of the employee
                name: "lastName",
                type: "input",
                message: "Lastname name: ",
                // Validating a name is entered
                validate: function(input){
                    if (input === ""){
                        console.log("**FIELD REQUIRED**");
                        return false;
                    }
                    else{
                        return true;
                    }
                }
            },
            {
                // Prompting user to select a role
                name: "role",
                type: "list",
                message: "What is the role of the employee?",
                choices: roleArr
            },{
                // Prompting user to select a manager
                name: "manager",
                type: "list",
                message: "Who is his/her manager?",
                choices: managerArr
            }]).then((answer) => {

                // Variable for role IDs
                let roleID;
                // Default Manager value as null
                let managerID = null;

                // Getting ID of selected role
                for (var i=0; i < roles.length; i++){
                    if (answer.role == roles[i].title){
                        roleID = roles[i].id;
                    }
                }

                // Getting ID of selected manager
                for (var i=0; i < managers.length; i++){
                    if (answer.manager == managers[i].Employee){
                        managerID = managers[i].id;
                    }
                }

                // Query to insert employee details
                connection.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                VALUES ("${answer.firstName}", "${answer.lastName}", ${roleID}, ${managerID})`, (err, res) => {
                    if(err) return err;

                    // Displaying details of the employee added
                    console.log(`\n EMPLOYEE ${answer.firstName} ${answer.lastName} ADDED...\n `);
                    options();
                });
            });
    });
}

// Function to add Department
const addDept = () => {

    inquirer.prompt({

            // Prompting user to enter name of department
            name: "deptName",
            type: "input",
            message: "Department Name: "
        }).then((answer) => {
                
            // Query to insert department to the table
            connection.query(`INSERT INTO department (name)VALUES ("${answer.deptName}");`, (err, res) => {
                if(err) return err;
                console.log("\n DEPARTMENT ADDED...\n ");
                options();
            });

        });
}

// Function to add Role
const addRole = () => {

    // Array for storing departments names
    let deptArr = [];

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties)
    .then((conn) => {

        // Query all departments names
        return conn.query('SELECT id, name FROM department ORDER BY name ASC');

    }).then((departments) => {
        
        // Storing all departments in array
        for (var i=0; i < departments.length; i++){
            deptArr.push(departments[i].name);
        }

        return departments;
    }).then((departments) => {
        
        inquirer.prompt([
            {
                // Prompting user to enter the title of role 
                name: "roleTitle",
                type: "input",
                message: "Role title: "
            },
            {
                // Prompting user to enter salary
                name: "salary",
                type: "number",
                message: "Salary: "
            },
            {   
                // Prompting user to select department the role is under
                name: "dept",
                type: "list",
                message: "Department: ",
                choices: deptArr
            }]).then((answer) => {

                // Variable for department ID
                let deptID;

                // Getting id of selected department
                for (var i=0; i < departments.length; i++){
                    if (answer.dept == departments[i].name){
                        deptID = departments[i].id;
                    }
                }

                // Query to insert role to role table
                connection.query(`INSERT INTO role (title, salary, department_id)
                VALUES ("${answer.roleTitle}", ${answer.salary}, ${deptID})`, (err, res) => {
                    if(err) return err;
                    console.log(`\n ROLE ${answer.roleTitle} ADDED...\n`);
                    options();
                });

            });

    });
    
}

// Function to update Employee Role
function updateEmpRole(){

    // Array for employee and role
    let employeeArr = [];
    let roleArr = [];

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties
    ).then((conn) => {
        return Promise.all([

            // Query for all roles and employee
            conn.query('SELECT id, title FROM role ORDER BY title ASC'), 
            conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC")
        ]);
    }).then(([roles, employees]) => {

        // Storing all roles in array
        for (var i=0; i < roles.length; i++){
            roleArr.push(roles[i].title);
        }

        // Storing all empoyees in array
        for (var i=0; i < employees.length; i++){
            employeeArr.push(employees[i].Employee);
        }

        return Promise.all([roles, employees]);
    }).then(([roles, employees]) => {

        inquirer.prompt([
            {
                // Promting user to select employee
                name: "employee",
                type: "list",
                message: "Who would you like to edit?",
                choices: employeeArr
            }, {
                // Updated role of the employee
                name: "role",
                type: "list",
                message: "What is their new role?",
                choices: roleArr
            },]).then((answer) => {

                let roleID;
                let employeeID;

                /// Getting ID of selected role
                for (var i=0; i < roles.length; i++){
                    if (answer.role == roles[i].title){
                        roleID = roles[i].id;
                    }
                }

                // Getting ID of selected employee
                for (var i=0; i < employees.length; i++){
                    if (answer.employee == employees[i].Employee){
                        employeeID = employees[i].id;
                    }
                }
                
                // Query to update employee with new role
                connection.query(`UPDATE employee SET role_id = ${roleID} WHERE id = ${employeeID}`, (err, res) => {
                    if(err) return err;

                    console.log(`\n ${answer.employee} ROLE UPDATED TO ${answer.role}...\n `);
                    options();
                });
            });
    });
    
}

// Function to update employee manager
const updateEmpMngr = () => {

    // Array for employees names
    let employeeArr = [];

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties
    ).then((conn) => {

        // Returning all employees names
        return conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS Employee FROM employee ORDER BY Employee ASC");
    }).then((employees) => {

        // Storing employees anmes in array
        for (var i=0; i < employees.length; i++){
            employeeArr.push(employees[i].Employee);
        }

        return employees;
    }).then((employees) => {

        inquirer.prompt([
            {
                // Promting user to select employee
                name: "employee",
                type: "list",
                message: "Who would you like to edit?",
                choices: employeeArr
            }, {
                // Promting user to select new manager
                name: "manager",
                type: "list",
                message: "Who is their new Manager?",
                choices: employeeArr
            },]).then((answer) => {

                let employeeID;
                let managerID;

                // Getting ID of manager selected
                for (var i=0; i < employees.length; i++){
                    if (answer.manager == employees[i].Employee){
                        managerID = employees[i].id;
                    }
                }

                // Getting ID of selected employee
                for (var i=0; i < employees.length; i++){
                    if (answer.employee == employees[i].Employee){
                        employeeID = employees[i].id;
                    }
                }

                // Query to update employee with manager ID
                connection.query(`UPDATE employee SET manager_id = ${managerID} WHERE id = ${employeeID}`, (err, res) => {
                    if(err) return err;

                    console.log(`\n ${answer.employee} MANAGER UPDATED TO ${answer.manager}...\n`);
                    options();
                });
            });
    });
}

// Function to delete employee
const deleteEmp = () => {

    // Array for employee
    let employeeArr = [];

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties
    ).then((conn) => {

        // Query for getting all employees names
        return  conn.query("SELECT employee.id, concat(employee.first_name, ' ' ,  employee.last_name) AS employee FROM employee ORDER BY Employee ASC");
    }).then((employees) => {

        // Storing all employees in array
        for (var i=0; i < employees.length; i++){
            employeeArr.push(employees[i].employee);
        }

        inquirer.prompt([
            {
                // Prompting user to select from employees list
                name: "employee",
                type: "list",
                message: "Who would you like to delete?",
                choices: employeeArr
            }, {
                // Confirming the deletion
                name: "yesNo",
                type: "list",
                message: "Confirm deletion:",
                choices: ["NO", "YES"]
            }]).then((answer) => {

                if(answer.yesNo == "YES"){
                    let employeeID;

                    // Getting ID of selected employee 
                    for (var i=0; i < employees.length; i++){
                        if (answer.employee == employees[i].employee){
                            employeeID = employees[i].id;
                        }
                    }
                    
                    // Query to delete selected employee
                    connection.query(`DELETE FROM employee WHERE id=${employeeID};`, (err, res) => {
                        if(err) return err;

                        console.log(`\n EMPLOYEE '${answer.employee}' DELETED...\n `);
                        options();
                    });
                } 
                else {
                    
                    // For NO deletion, returning to main menu
                    console.log(`\n EMPLOYEE '${answer.employee}' NOT DELETED...\n `);
                    options();
                }
                
            });
    });
}

// Function to delete Department
const deleteDept = () => {

    // Array for department names
    let deptArr = [];

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties
    ).then((conn) => {

        // Query to get all departments names
        return conn.query("SELECT id, name FROM department");
    }).then((depts) => {

        // Storing all departments to array
        for (i=0; i < depts.length; i++){
            deptArr.push(depts[i].name);
        }

        inquirer.prompt([{

            // Confirmation to continue to deletion
            name: "continueDelete",
            type: "list",
            message: "*** WARNING *** Deleting a department will delete all roles and employees associated with the department. Do you want to continue?",
            choices: ["NO", "YES"]
        }]).then((answer) => {

            // For NO deletion, returning to main menu
            if (answer.continueDelete === "NO") {
                return options();
            }else {
                inquirer.prompt([{

                    // Prompting user to select department to delete
                    name: "dept",
                    type: "list",
                    message: "Which department would you like to delete?",
                    choices: deptArr
                }, {

                    // Confirming deletion
                    name: "confirmDelete",
                    type: "Input",
                    message: "Type the department name EXACTLY to confirm deletion of the department: "

                }]).then((answer) => {

                    if(answer.confirmDelete === answer.dept){

                        // Getting department ID
                        let deptID;
                        for (i=0; i < depts.length; i++){
                            if (answer.dept == depts[i].name){
                                deptID = depts[i].id;
                            }
                        }
                        
                        // Query to delete selected department
                        connection.query(`DELETE FROM department WHERE id=${deptID};`, (err, res) => {
                            if(err) return err;

                            console.log(`\n DEPARTMENT '${answer.dept}' DELETED...\n `);
                            options();
                        });
                    } 
                    else {

                        // No deletion
                        console.log(`\n DEPARTMENT '${answer.dept}' NOT DELETED...\n `);
                        options();
                    }
                    
                });
            }
        });
    });
}

// Function to delete Role
const deleteRole = () => {

    // Array for role 
    let roleArr = [];

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties
    ).then((conn) => {

        // Query to get all roles
        return conn.query("SELECT id, title FROM role");
    }).then((roles) => {    

        // Storing all roles to array
        for (var i=0; i < roles.length; i++){
            roleArr.push(roles[i].title);
        }

        inquirer.prompt([{
            // Confirmation to continue to delete the selected role
            name: "continueDelete",
            type: "list",
            message: "*** WARNING *** Deleting role will delete all employees associated with the role. Do you want to continue?",
            choices: ["NO", "YES"]
        }]).then((answer) => {

            // For NO deletion, returning to main menu
            if (answer.continueDelete === "NO") {
                options();
            }else {

                inquirer.prompt([{
                    // Prompting user to select role to delete
                    name: "role",
                    type: "list",
                    message: "Which role would you like to delete?",
                    choices: roleArr
                }, {
                    // Confirming deletion
                    name: "confirmDelete",
                    type: "Input",
                    message: "Type the role title EXACTLY to confirm deletion of the role:"

                }]).then((answer) => {

                    if(answer.confirmDelete === answer.role){

                        // Getting role id of selected role
                        let roleID;
                        for (i=0; i < roles.length; i++){
                            if (answer.role == roles[i].title){
                                roleID = roles[i].id;
                            }
                        }
                        
                        // Query to delete role
                        connection.query(`DELETE FROM role WHERE id=${roleID};`, (err, res) => {
                            if(err) return err;

                            console.log(`\n ROLE '${answer.role}' DELETED...\n `);
                            options();
                        });
                    } 
                    else {
                        console.log(`\n ROLE '${answer.role}' NOT DELETED...\n `);
                        options();
                    }                 
                });
            }  
        });
    });
}

// Function to view departments budgets
const deptBudget = () => {

    // Creating connection using promise-sql
    promisemysql.createConnection(connProperties)
    .then((conn) => {
        return  Promise.all([

            // Query to get all departments and salaries
            conn.query("SELECT department.name AS department, role.salary FROM employee e LEFT JOIN employee m ON e.manager_id = m.id INNER JOIN role ON e.role_id = role.id INNER JOIN department ON role.department_id = department.id ORDER BY department ASC"),
            conn.query('SELECT name FROM department ORDER BY name ASC')
        ]);
    }).then(([deptSalaies, departments]) => {
        
        let deptBudgetArr =[];
        let department;

        for (d=0; d < departments.length; d++){
            let departmentBudget = 0;

            // Adding all salaries
            for (i=0; i < deptSalaies.length; i++){
                if (departments[d].name == deptSalaies[i].department){
                    departmentBudget += deptSalaies[i].salary;
                }
            }

            // Creating object with department and budget
            department = {
                Department: departments[d].name,
                Budget: departmentBudget
            }

            // Adding budgets to array
            deptBudgetArr.push(department);
        }
        console.log("\n");

        // Displaying budget in tabular form
        console.table(deptBudgetArr);
        options();
    });
}