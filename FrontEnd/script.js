const studentForm = document.getElementById("studentForm");
const studentList = document.getElementById("studentList");
const addStudentButton = document.getElementById("addStudent");
const studentsContainer = document.getElementById("studentsContainer");

addStudentButton.addEventListener("click", () => {
  const studentEntry = document.createElement("div");
  studentEntry.classList.add("studentEntry");
  studentEntry.innerHTML = `
        <label>Name : </label>
        <input type="text" name="name" class="name" placeholder="Enter Name" required>
        <br>
        <label>Email : </label>
        <input type="email" name="email" class="email" placeholder="Enter Email" required>
        <br>
        <label>Roll : </label>
        <input type="text" name="roll" class="roll" placeholder="Enter Roll">
        <br>
        <label>Department Name : </label>
        <input type="text" name="deptname" class="deptname" placeholder="Enter Department Name" required>
        <br>
        <label>Contact : </label>
        <input type="text" name="contact" class="contact" placeholder="Enter Contact" required>
        <br>
        <hr>
    `;
  studentsContainer.appendChild(studentEntry);
});

studentForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const studentEntries = document.querySelectorAll(".studentEntry");

  const studentsData = [];

  studentEntries.forEach((entry) => {
    const name = entry.querySelector(".name").value;
    const email = entry.querySelector(".email").value;
    const roll = entry.querySelector(".roll").value;
    const deptname = entry.querySelector(".deptname").value;
    const contact = entry.querySelector(".contact").value;

    studentsData.push({ name, email, roll, deptname, contact });
  });

  fetch("http://localhost:5000/api/students", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(studentsData),
  })
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      data.forEach((student) => {
        const listItem = document.createElement("li");
        listItem.textContent = `Name: ${student.name}, Email: ${student.email}, Roll: ${student.roll}, Department: ${student.deptname}, Contact: ${student.contact}`;
        studentList.appendChild(listItem);
      });

      // Clear input fields
      studentEntries.forEach((entry) => {
        entry.querySelectorAll("input").forEach((input) => {
          input.value = "";
        });
      });
    })
    .catch((error) => {
      console.log("Error", error);
    });
});

//! Function to fetch and display all students
async function getStudents() {
  try {
    const response = await fetch("http://localhost:5000/api/students");
    if (response.ok) {
      const students = await response.json();
      displayStudents(students);
    } else {
      console.error("Failed to fetch students");
    }
  } catch (error) {
    console.error("Error:", error);
  }
}

//! Function to display students in a list
function displayStudents(students) {
  const studentList = document.getElementById("studentList");
  studentList.innerHTML = ""; // Clear previous data

  students.forEach((student) => {
    const li = document.createElement("li");
    li.textContent = `Name: ${student.name}, email: ${student.email}, roll: ${student.roll}, deptname: ${student.deptname}, contact: ${student.contact}`;

    //! Create checkbox for each student entry
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = student._id; // Assuming student has an _id field
    li.appendChild(checkbox);

    // //! Create Edit button for each student entry
    const editButton = document.createElement("button");
    editButton.textContent = "Edit";
    editButton.addEventListener("click", () => editStudent(student._id)); // Pass student ID to the edit function
    li.appendChild(editButton);

    studentList.appendChild(li);
  });
}

//! Function to delete selected students
async function deleteStudents() {
  const checkboxes = document.querySelectorAll(
    'input[type="checkbox"]:checked'
  );
  const idsToDelete = Array.from(checkboxes).map((cb) => cb.value);

  if (idsToDelete.length > 0) {
    try {
      const response = await fetch("http://localhost:5000/api/students", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(idsToDelete),
      });

      if (response.ok) {
        alert("Selected students deleted successfully!");
        getStudents(); // Refresh the student list after deletion
      } else {
        alert("Failed to delete selected students.");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  } else {
    alert("Please select students to delete.");
  }
}

//! Prompt
// async function editStudent(studentId) {
//   const newName = prompt('Enter new name:');
//   const newEmail = prompt('Enter new email:');
//   const newRoll = prompt('Enter new roll:');
//   const newDeptname = prompt('Enter new deptname:');
//   const newContact = prompt('Enter new contact:');

//   if (newName || newEmail || newRoll || newDeptname || newContact) {
//       const updatedStudent = {
//           name: newName,
//           email: newEmail,
//           roll: newRoll,
//           deptname: newDeptname,
//           contact: newContact
//       };

//       try {
//           const response = await fetch(`http://localhost:5000/api/students/${studentId}`, {
//               method: 'PUT',
//               headers: {
//                   'Content-Type': 'application/json',
//               },
//               body: JSON.stringify(updatedStudent),
//           });

//           if (response.ok) {
//               alert('Student information updated successfully!');
//               getStudents(); // Refresh the student list after update
//           } else {
//               alert('Failed to update student information.');
//           }
//       } catch (error) {
//           console.error('Error:', error);
//       }
//   } else {
//       alert('Please provide valid information for the student.');
//   }
// }


//! Function to handle editing of student data
async function editStudent(studentId) {
  try {
    const response = await fetch(`http://localhost:5000/api/students/${studentId}`);
    if (response.ok) {
      const student = await response.json();
      createEditForm(student);
    } else {
      console.error('Failed to fetch student data');
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

//! Function to create and populate the edit form with student data
function createEditForm(student) {
  const editForm = document.createElement('form');
  editForm.classList.add('editForm');
  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const formData = new FormData(editForm);
    const updatedStudent = {};

    for (const [name, value] of formData.entries()) {
      updatedStudent[name] = value;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/students/${student._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedStudent),
      });

      if (response.ok) {
        alert('Student information updated successfully!');
        getStudents(); // Refresh the student list after update
        editForm.remove(); // Remove the edit form after submission
      } else {
        alert('Failed to update student information.');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  });

  //! Populate the edit form with existing student data
  editForm.innerHTML = `
    <label>Name:</label>
    <input type="text" name="name" class="name" placeholder="Enter Name" value="${student.name}" required>
    <br>
    <label>Email:</label>
    <input type="email" name="email" class="email" placeholder="Enter Email" value="${student.email}" required>
    <br>
    <label>Roll:</label>
    <input type="text" name="roll" class="roll" placeholder="Enter Roll" value="${student.roll}">
    <br>
    <label>Department Name:</label>
    <input type="text" name="deptname" class="deptname" placeholder="Enter Department Name" value="${student.deptname}" required>
    <br>
    <label>Contact:</label>
    <input type="text" name="contact" class="contact" placeholder="Enter Contact" value="${student.contact}" required>
    <br>
    <button type="submit">Update</button>
  `;

  // Append the edit form to a container in the HTML document
  const editContainer = document.getElementById('editContainer');
  editContainer.innerHTML = ''; // Clear previous data
  editContainer.appendChild(editForm);
}

getStudents();
