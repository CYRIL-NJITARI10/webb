# Exercice 0

The character of ID 5 in the Rick and Morty API is Jerry Smith.

## Why?

To retrieve the information about the character, I've followed these steps:

1. Using Insomnia, I send an HTTP GET request to the URL `https://rickandmortyapi.com/api/character/5`.

2. The API responds with the JSON data representing all the information of the character with ID 5.

3. In the Insomnia environment editor, to extract only the name of the character from the response, I set up a variable with the value `$.name`. This filter the result to only include the character's name.

4. After sending the request, the filtered result is:

```json
[
  "Jerry Smith"
]
```
# Exercice 2
The xercices 2 requires  the csv-writer package, which is used to handle CSV files. You can install it by running the following command:
```sh
npm install csv-writer
```
