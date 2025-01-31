-- Nettoyage des données existantes
DELETE FROM todo;
DELETE FROM _user;

-- Insertion des utilisateurs (mot de passe : test123)
INSERT INTO _user (email, firstname, lastname, password, role)
VALUES
('test@gmail.com', 'Test', 'User',
'$2a$10$w6nk2gT.6yvzNLwzZOkl8uoOykd/8bgyaIeUKpZPHxXTb76de4zhC', 'USER'),
('admin@gmail.com', 'Admin', 'User',
'$2a$10$w6nk2gT.6yvzNLwzZOkl8uoOykd/8bgyaIeUKpZPHxXTb76de4zhC', 'ADMIN');

-- Insertion des todos
INSERT INTO todo (title, description, completed, due_date, user_id)
SELECT 'Faire les courses', 'Acheter du lait, du pain et des fruits', false, CURRENT_DATE(), id
FROM _user WHERE email = 'test@gmail.com';

INSERT INTO todo (title, description, completed, due_date, user_id)
SELECT 'Rendez-vous médecin', 'Consultation annuelle', false, DATEADD('DAY', 7, CURRENT_DATE()), id
FROM _user WHERE email = 'test@gmail.com';

INSERT INTO todo (title, description, completed, due_date, user_id)
SELECT 'Rapport mensuel', 'Préparer le rapport', false, CURRENT_DATE(), id
FROM _user WHERE email = 'admin@gmail.com';