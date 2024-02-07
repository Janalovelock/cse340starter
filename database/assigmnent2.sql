--INSERT DATA--
INSERT INTO public.account(
account_firstname, 
account_lastname, 
account_email,
account_password)

VALUES (
'Tony', 
'Stark', 
'tony@starkent.com',
'Iam1ronM@n');

--MODIFY DATA--
UPDATE account
SET account_type = 'Admin'
WHERE account_firstname = 'Tony';

--DELETE__

DELETE FROM account WHERE account_lastname='Stark';

--update--
UPDATE 
  inventory
SET 
  inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior'
)
						   
WHERE 
  inv_model = 'Hummer';

--INNER JOIN--
SELECT 
inv_make,
inv_model,
classification_name
FROM
inventory
INNER JOIN 
classification 
ON 
classification.classification_id = inventory.classification_id
WHERE 
classification_name = 'Sport';

--replace path--
UPDATE 
  inventory
SET 
  inv_image = REPLACE(inv_image, '/images/', '/images/vehicles/'
),
inv_thumbnail = REPLACE(inv_thumbnail, '/images/', '/images/vehicles/'
);
			