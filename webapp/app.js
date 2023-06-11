const express = require("express");
const fs = require("fs");
const path = require("path");

const basicAuth = require("express-basic-auth");
const bcrypt = require("bcrypt");
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

const app = express();
const port = process.env.PORT || 3000;

require("./models/Student");

// Server configuration
// Enable JSON requests/responses
app.use(express.json());
// Enable form requests
app.use(express.urlencoded({ extended: true }));

// Enable EJS templates
app.set("views", "./views");
app.set("view engine", "ejs");

// Enable static files loading (like CSS files or even HTML)
app.use(express.static("public"));



/**
 * CSV parsing (for files with a header and 2 columns only)
 *
 * @example: "name,school\nEric Burel, LBKE"
 * => [{ name: "Eric Burel", school: "LBKE"}]
 */
const parseCsvWithHeader = (filepath, cb) => {
  const rowSeparator = "\n";
  const cellSeparator = ",";
  // example based on a CSV file
  fs.readFile(filepath, "utf8", (err, data) => {
    const rows = data.split(rowSeparator);
    // first row is an header I isolate it
    const [headerRow, ...contentRows] = rows;
    const header = headerRow.split(cellSeparator);

    const items = contentRows.map((row) => {
      const cells = row.split(cellSeparator);
      const item = {
        [header[0]]: cells[0],
        [header[1]]: cells[1],
      };
      return item;
    });
    items.pop()
    return cb(null, items);
  });
};
// Student model
/**
 * @param {*} cb A callback (err, students) => {...}
 * that is called when we get the students
 */
const getStudentsFromCsvfile = (cb) => {
  // example based on a CSV file
  parseCsvWithHeader("./students.csv", cb);
};

const storeStudentInCsvFile = (student, cb) => {
  const csvLine = `\n${student.name},${student.school}`;
  // Temporary log to check if our value is correct
  // in the future, you might want to enable Node debugging
  // https://code.visualstudio.com/docs/nodejs/nodejs-debugging
  console.log(csvLine);
  fs.writeFile("./students.csv", csvLine, { flag: "a" }, (err) => {
    cb(err, "ok");
  });
};

// UI
// Serving some HTML as a file
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "./views/home.html"));
});

// A data visualization page with D3
app.get("/students/data", (req, res) => {
  res.render("students-data");
});

app.get("/students", (req, res) => {
  getStudentsFromCsvfile((err, students) => {
    if (err) {
      console.error(err);
      res.send("ERROR");
    }
    
    console.log(students)
    res.render("students", {
      students,
    });
  });
});



// Student create form
app.get("/students/create", (req, res) => {
  res.render("create-student");
});

// Form handlers
app.post("/students/create", (req, res) => {
  console.log(req.body);
  const student = req.body;
  storeStudentInCsvFile(student, (err, storeResult) => {
    if (err) {
      res.redirect("/students/create?error=1");
    } else {
      res.redirect("/students/create?created=1");
    }
  });
});


app.get("/students/find-from-db", (req, res) => {
  mongoose.model("Student").find((err, students) => {
    if (err) {
      console.error(err);
      throw new Error("Could not create student");
    }
    res.send(students);
  });
});
app.get('/students/:id', (req, res) => {
  // retrieve the id
  const id = req.params.id;
  
  // convert my student file to an array
  parseCsvWithHeader('./students.csv', (err, students) => {
    if (err) {
      console.error(err);
      return res.send('ERROR');
    }
    
   //retrieve the information of the student based on his id
   const student = students[id] || {}; // Default to empty object if no student with that ID is found
    
   //render the view
    res.render('student_details', { student , id});
  });
});
// JSON API

// Not real login but just a demo of setting an auth token
// using secure cookies
app.post("/api/login", (req, res) => {
  console.log("current cookies:", req.cookies);
  // We assume that you check if the user can login based on "req.body"
  // and then generate an authentication token
  const token = "FOOBAR";
  const tokenCookie = {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 60 * 1000),
  };
  res.cookie("auth-token", token, tokenCookie);
  res.send("OK");
});

app.get("/api/students", (req, res) => {
  getStudentsFromCsvfile((err, students) => {
    res.send(students);
  });
});

app.post("/api/students/create", (req, res) => {
  console.log(req.body);
  const student = req.body;
  storeStudentInCsvFile(student, (err, storeResult) => {
    if (err) {
      res.status(500).send("error");
    } else {
      res.send("ok");
    }
  });
});



app.post("/students/:id", (req, res) => {
  const id = req.body.id; // parse the id parameter as integer
  const name = req.body.name; // get the new name from the form
  const school = req.body.school; // get the new school from the form

  // read the CSV file and parse it to a JavaScript array of objects
  parseCsvWithHeader("./students.csv", (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).send("Error reading students.csv");
      return;
    }
    console.log("Before uptading")
    console.log(rows)

    // find the student to update by index in the rows array
    const student = rows[id];
    console.log(req.body)
    if (!student) {
      res.status(404).send("Student not found");
      return;
    }

    // update the name and school of the student object
    rows[id].name = name;
    rows[id].school = school;
   
   console.log("After updating")
   console.log(rows)
    // convert the updated rows array back to CSV format
    //csvWriter.writeRecords(rows);
    
  if (fs.existsSync('students.csv')) {
  // Delete the file
  fs.unlinkSync('students.csv');
}

  const csvWriter = createCsvWriter({
  path: 'students.csv',
  header: [
    { id: 'name', title: 'name' },
    { id: 'school', title: 'school' }
  ]
});

csvWriter
  .writeRecords(rows)
  .then(() => {
    console.log('CSV file has been written successfully.');
    res.redirect('/students');
  })
  .catch((error) => {
    console.error('Error writing CSV file:', error);
    res.redirect("/students/create?error=1");
  });
  
    

  });
});



app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
