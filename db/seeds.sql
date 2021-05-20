USE employees_DB;

-- Seeding for Department

INSERT INTO department (name)
VALUES 
     ("Sales"),
     ("Engineering"),
     ("Finance"),
     ("Legal");

-- seeding for Role 

INSERT INTO role (title, salary, department_id)
VALUES 
    ('Sales Lead', 90000, 1),
    ('Salesperson', 70000, 1),
    ('Lead Engineer', 130000, 2),
    ('Software Engineer', 110000, 2),
    ('Account Manager', 150000, 3),
    ('Accountant', 120000, 3),
    ('Legal Team Lead', 220000, 4),
    ('Lawyer', 170000, 4);

-- Seeding for Employees

INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
    ('Srian', 'Patel', 1, NULL),
    ('Sylvie', 'Sharma', 2, 1),
    ('Mann', 'Singh', 3, NULL),
    ('Honey', 'Jani', 4, 3),
    ('Yogesh', 'Verma', 5, NULL),
    ('Vasant', 'Parikh', 6, 5),
    ('Sameer', 'Patel', 7, NULL),
    ('Ayan', 'Yadav', 8, 7);
    
