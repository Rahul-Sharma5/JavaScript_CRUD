const express = require("express");
const { default: mongoose } = require("mongoose");
const bodyParser = require("body-parser");
let cors = require("cors");

const app = express();
const port = 5000;

//! DataBase Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/Student", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((err) => {
    console.error("Error connecting");
  });

const studentSchema = new mongoose.Schema({
  name: String,
  email: String,
  roll: String,
  deptname: String,
  contact: String,
});

const Student = mongoose.model("Student", studentSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello Server");
});

//! Get All Data From Database
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find({});
    res.json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//! Get Data By ID From Database
app.get("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//! Post Request 
app.post("/api/students", async (req, res) => {
  try {
    const studentsData = req.body;

    // Ensure the incoming data is an array of student objects
    if (!Array.isArray(studentsData)) {
      return res.status(400).json({ error: "Invalid data format" });
    }

    // Insert the students into the database
    const insertedStudents = await Student.insertMany(studentsData);
    res.json(insertedStudents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//! PUT Request
app.put("/api/students/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, roll, deptname, contact } = req.body;
    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      { name, email, roll, deptname, contact },
      { new: true }
    );
    if (!updatedStudent) {
      return res.status(404).json({ error: "Student not found" });
    }
    res.json(updatedStudent);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//! Delete Request //! Delete Many Data at Ones
app.delete("/api/students", (req, res, next) => {
  const studentIdsToDelete = req.body;

  Student.deleteMany({ _id: { $in: studentIdsToDelete } })
    .then((result) => {
      res.status(200).json({
        message: "Students Deleted successfully!!",
        result: result,
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).json({
        message: "Error occurred while deleting student records !!",
        error: err,
      });
    });
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
