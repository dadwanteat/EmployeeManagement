const inquirer = require("inquirer");
const mysql = require("mysql");

const ERR_INVALID_ANSWER = 0xf0;


const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employeetracker_db"
});

connection.connect((err)=>{
    if(err) throw err;

    console.log("MySQL Connected with id: "+connection.threadId);
    queryInput();
});

function queryInput(){
    console.log();
    inquirer.prompt([
        {
            name: "command",
            message: "How can I help you?",
            type: "list",
            choices: ["Add...", "View...", "Edit...", "Quit"]
        },
        {
            name: "add",
            message: "What would you like to include?",
            type: "list",
            choices: ["Department", "Role", "Employee", "Abort..."],
            when: answers => answers.command=="Add..."
        },
        {
            name: "view",
            message: "What would you like to see?",
            type: "list",
            choices: ["Departments", "Roles", "Employees...", "Abort..."],
            when: answers => answers.command=="View..."
        },
        {
            name: "edit",
            message: "What would you like to change?",
            type: "list",
            choices: ["Employee Role", "Employee Manager", "Abort..."],
            when: answers => answers.command=="Edit..."
        }
    ]).then(answers=>{
        if(answers.command=="Quit") exitProgram();

        if(Object.values(answers).includes("Abort...")){
            queryInput();
            return;
        }

        switch(answers.command){
            case "Add...": commandAdd(answers.add); break;
            case "View...": commandView(answers.view); break;
            case "Edit...": commandEdit(answers.edit); break;
            default:
                console.error("Whoops!");
                exitProgram(ERR_INVALID_ANSWER);
        }
    })
}

function exitProgram(exitCode) {
    connection.end();
    process.exit(exitCode);
}


function commandAdd(typeToAdd){
    switch(typeToAdd){
        case "Department":
            addDepartment();
            break;

        case "Role":
            addRole();
            break;

        case "Employee":
            addEmployee();
            break;

        default: 
            console.error("Whoops!");
            exitProgram(ERR_INVALID_ANSWER);
    }
}

function addDepartment(){
    console.log();
    console.log("Adding Department!");
    inquirer.prompt([
        {
            name: "deptName",
            message: "What is the name of this Department?",
            type: "input",
            validate: answer => {
                return /\w+/.test(answer)? true: "Please input a word";
            } 
        }
    ]).then(answers=>{
        
        connection.query("INSERT INTO department (name) VALUES (?)", answers.deptName, (err, data)=>{
            if(err) throw err;

            console.log("Department included!");
            queryInput();
        })
    });
}

function addRole(){
    console.log();
    console.log("Adding Role!");

    connection.query("SELECT * FROM department", (err, data)=>{
        if(err) throw err;
        
        const departments = [];
        for (i in data) {
            const department = data[i];
            departments.push({value: department.id, name: department.name});
        }
        
        inquirer.prompt([
            {
                name: "roleName",
                message: "What is the name of this Role?",
                type: "input",
                validate: answer => {
                    return /\w+/.test(answer)? true: "Please input a word";
                } 
            },
            {
                name: "salary",
                message: "What is the salary of this Role?",
                type: "input",
                validate: answer => {
                    return /\d+/.test(answer)? true: "Please input a number";
                } 
            },
            {
                name: "deptID",
                message: "Which Department is this role in?",
                type: "list",
                choices: departments
            }
        ]).then(answers=>{

            const salary = parseFloat(answers.salary);
            
            connection.query("INSERT INTO role (title, salary, department_id) VALUES (?,?,?)",
                [answers.roleName, salary, answers.deptID], (err, data)=>{
                    if(err) throw err;

                    console.log("Role added!");
                    queryInput();
                })
        });

    })

}

function addEmployee(){
    console.log();
    console.log("Adding Employee!");

    connection.query("SELECT id, title FROM role", (err, data)=>{
        if(err) throw err;
        
        const roles = [];
        for(i in data){
            const role = data[i];
            roles.push({value: role.id, name: role.title});
        }

        connection.query("SELECT id, first_name, last_name FROM employee", (err, data)=>{
            if(err) throw err;
            
            const managers = [];
            for(i in data){
                const manager = data[i];
                managers.push({value: manager.id, name: manager.first_name+" "+manager.last_name});
            }

            managers.unshift({value: "none", name: " -- NONE --"});
            
            inquirer.prompt([
                {
                    name: "firstName",
                    message: "What is the first name of this Employee?",
                    type: "input",
                    validate: answer => {
                        return /\w+/.test(answer)? true: "Please enter a name";
                    } 
                },
                {
                    name: "lastName",
                    message: "What is the last name of this Employee?",
                    type: "input",
                    validate: answer => {
                        return /\w+/.test(answer)? true: "Please enter a name";
                    } 
                },
                {
                    name: "roleID",
                    message: "What is the Role of this Employee?",
                    type: "list",
                    choices: roles
                },
                {
                    name: "managerID",
                    message: "Who is the Manager of this Employee?",
                    type: "list",
                    choices: managers
                }
            ]).then(answers=>{
                const {firstName, lastName, roleID, managerID} = answers;

                let query = "";
                if(managerID=="none"){
                    query = "INSERT INTO employee (first_name, last_name, role_id) VALUES (?,?,?)";
                }else{
                    query = "INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?,?,?,?)"
                }
                
                connection.query(query, [firstName, lastName, roleID, managerID], (err, data)=>{
                    if(err) throw err;

                    console.log("Employee added!");

                    queryInput();
                })
            });
            
        })
    })

}

function commandView(typeToView){
    switch(typeToView){
        case "Departments":
            viewDepartments();
            break;

        case "Roles":
            viewRoles();
            break;

        case "Employees...":
            viewEmployees();
            break;

        default: 
            console.error("Whoops!");
            exitProgram(ERR_INVALID_ANSWER);
    }
}


function viewDepartments(){
    connection.query("SELECT * FROM department", (err, data)=>{
        if(err) throw err;

        console.table(data);
        queryInput();
    });
}

function viewRoles(){
    connection.query("SELECT role.id, title, salary, name AS department FROM role JOIN department WHERE department_id=department.id", (err, data)=>{
        if(err) throw err;

        console.table(data);
        queryInput();
    });
}

function viewEmployees(){
    connection.query(`SELECT emp.id, emp.first_name, emp.last_name, 
                            title, salary, name AS department_name,
                            CASE
                                WHEN emp.manager_id IS NULL THEN "-/-"
                                ELSE CONCAT(mgr.first_name," ",mgr.last_name)
                            END AS manager
                        FROM employee AS emp
                        LEFT JOIN employee AS mgr ON emp.manager_id=mgr.id
                        JOIN role JOIN department
                        WHERE emp.role_id=role.id AND role.department_id=department.id
                        ORDER BY emp.last_name`,
        (err, data)=>{
            if(err) throw err;

            console.table(data);
            queryInput();
        }
    );
}

function commandEdit(typeToEdit){
    switch(typeToEdit){
        case "Employee Role":
            editEmployeeRole();
            break;

        case "Employee Manager":
            editEmployeeManager();
            break;

        default: 
            console.error("Whoops!");
            exitProgram(ERR_INVALID_ANSWER);
    }
}

function editEmployeeRole(){
    connection.query("SELECT id, title FROM role", (err, data)=>{
        if(err) throw err;

        const roles = [];
        for(i in data)
        {
            const role = data[i];
            roles.push({value: role.id, name: role.title});
        }

        connection.query("SELECT id, first_name, last_name FROM employee", (err, data)=>{
            if(err) throw err;

            const employees = [];
            for(i in data){
                const employee = data[i];
                

                employees.push({value: employee.id,
                                name: employee.first_name+" "+employee.last_name});
            }

            inquirer.prompt([
                {
                    name: "employee",
                    message: "Which Employee do you want to assign a new Role?",
                    type: "list",
                    choices: employees,
                },
                {
                    name: "role",
                    message: "Which Role does this Employee fill?",
                    type: "list",
                    choices: roles
                }
            ]).then(answers=>{
                connection.query("UPDATE employee SET role_id = ? WHERE id = ?", [answers.role, answers.employee],(err, data)=>{
                    if(err) throw err;

                    console.log("Employee Up to date!");

                    queryInput();
                })
            })
        })
    })
}

function editEmployeeManager(){
    queryInput();
}