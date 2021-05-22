// web elements
const navUserName = document.querySelector("#nav-user-name");
const adminContainer = document.querySelector("#admin-container-outer");
const subjectsTableBody = document.querySelector("#subjects-table > tbody");
const questionsTableBody = document.querySelector("#questions-table > tbody");
const addNewSubjectContainer = document.querySelector(
  "#add-new-subject-container"
);
const inputNewSubject = document.querySelector("#input-new-subject");
const alertNewSubjectExists = document.querySelector(
  "#input-new-subject-exist-alert"
);
const subjectsCount = document.querySelector("#subjects-count");
const questionsCount = document.querySelector("#questions-count");
const subjectsTable = document.querySelector("#subjects-table");
const questionsTable = document.querySelector("#questions-table");
const updateSubjectForm = document.querySelector("#update-subject-container");
const inputUpdateSubjectID = document.querySelector("#subject-id");
const inputUpdateSubject = document.querySelector("#input-update-subject");
const alertUpdateSubjectExist = document.querySelector(
  "#input-update-subject-exist-alert"
);
const switchStatusUpdateSubject = document.querySelector(
  "#subject-status-switch"
);
const addNewQuestionForm = document.querySelector(
  "#add-new-question-container"
);
const alertNewQuestionExist = document.querySelector(
  "#input-new-question-exist-alert"
);
const selectNewQuestionSubjects = document.querySelector(
  "#select-new-question-subjects"
);
const selectNewQuestionTime = document.querySelector(
  "#select-new-question-time"
);
const textareaNewQuestion = document.querySelector("#textarea-new-question");
const textareaNewSolution = document.querySelector("#textarea-new-solution");
const selectFilterBySubject = document.querySelector("#select-subject");
const updateQuestionForm = document.querySelector("#update-question-container");
const alertUpdateQuestionExist = document.querySelector(
  "#input-update-question-exist-alert"
);
const inputUpdateQuestionId = document.querySelector(
  "#input-update-question-id"
);
const selectUpdateQuestionSubject = document.querySelector(
  "#select-update-question-subjects"
);
const selectUpdateQuestionTime = document.querySelector(
  "#select-update-question-time"
);
const textareaUpdateQuestion = document.querySelector(
  "#textarea-update-question"
);
const textareUpdateSolution = document.querySelector(
  "#textarea-update-solution"
);
const pages = document.querySelector("#pages");
const deleteSubjectForm = document.querySelector("#delete-subject-container");
const inputDeleteSubjectId = document.querySelector("#subject-id-to-delete");
const inputDeleteSubject = document.querySelector("#subject-name-to-delete");

// global variables
let token = "";
let userName = "";
let subjects = [];
let questions = [];
let questionsCurrentPage = 1;
let questionsTotalPages = 1;

// event listeners

// functions
(() => {
  token = sessionStorage.getItem("token");
  fetch("/api/users/decode", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
    },
  }).then(async (response) => {
    let data = await response.json();
    userName = data.data.full_name;
    navUserName.innerHTML = "Welcome " + userName;
    getAllSubjects();
    getAllQuestions("All");
  });
})();

function getAllSubjects() {
  fetch("/api/questions/all_subjects", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
    },
  }).then(async (response) => {
    let data = await response.json();
    if (data.message.includes("No records found")) {
      subjects = [
        {
          subject_id: 0,
          subject_name: "No subjects",
          subject_is_active: 0,
        },
      ];
      subjectsCount.innerHTML = 0 + " subjects";
    } else {
      subjects = [];
      subjects.push(...data.subjects);
      subjectsCount.innerHTML = subjects.length + " subjects";
    }
    displaySubjects();
  });
}

function displaySubjects() {
  let tableRows = "";
  let selectOptions = `<option value="All">All</option>`;
  if (subjects.length != 0) {
    subjects.forEach((subject) => {
      let state =
        subject.subject_is_active == 0
          ? "../img/switch_off.gif"
          : "../img/switch_on.gif";
      tableRows += `<tr>
        <td>${subject.subject_id}</td>
        <td>${subject.subject_name}</td>
        <td>
          <button 
            class="update-subject"
            onclick="JavaScript:openUpdateSubjectForm(this)"
          >
            Update
          </button>
          <button 
            class="delete-subject"
            onclick="JavaScript:deleteSubjectHandler(this)"
          >
            Delete
          </button>
        </td>
        <td>
          <div class="switch-container">
            <img 
              class="switch-item" 
              src="${state}" 
              value="${subject.subject_is_active}"
              ignore="false"
              onclick="JavaScript:subjectStatusSwitchHandler(this)"
            >
          </div>
        </td>
      </tr>`;
      selectOptions += `<option 
        value="${subject.subject_name}"
      >
        ${subject.subject_name}
      </option>`;
    });
  } else {
    tableRows += `<tr>
      <td>N/A</td>
      <td>No subjects recorded yet</td>
      <td></td>
      <td></td>
    </tr>`;
  }
  subjectsTableBody.innerHTML = tableRows;
  selectFilterBySubject.innerHTML = selectOptions;
}

function showSubjectsTable() {
  subjectsTable.classList.remove("hidden");
  questionsTable.classList.add("hidden");
  pages.classList.add("hidden");
}

function showQuestionsTable() {
  subjectsTable.classList.add("hidden");
  questionsTable.classList.remove("hidden");
  pages.classList.remove("hidden");
}

function openAddNewSubjectForm() {
  inputNewSubject.value = "";
  adminContainer.classList.add("grey");
  addNewSubjectContainer.classList.remove("hidden");
}

function addNewSubjectCanselHandler() {
  adminContainer.classList.remove("grey");
  addNewSubjectContainer.classList.add("hidden");
}

function addNewSubjectButtonHandler() {
  if (inputNewSubject.value.length > 2) {
    fetch("/api/questions/create_subject", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        subject_name: inputNewSubject.value,
      }),
    }).then(async (response) => {
      let data = await response.json();
      if (data.success) {
        addNewSubjectCanselHandler();
        getAllSubjects();
      } else if (data.message.includes("Duplicate entry")) {
        inputNewSubject.value = "";
        alertNewSubjectExists.classList.remove("hidden");
      }
    });
  }
}

function openUpdateSubjectForm(t) {
  alertUpdateSubjectExist.classList.add("hidden");
  let id = t.parentElement.parentElement.children[0].innerHTML;
  let subject = t.parentElement.parentElement.children[1].innerHTML;
  let subject_is_active =
    t.parentElement.parentElement.children[3].children[0].children[0].attributes
      .value.value;
  adminContainer.classList.add("grey");
  updateSubjectForm.classList.remove("hidden");
  inputUpdateSubjectID.value = "subject id: " + id;
  inputUpdateSubject.value = subject;
  switchStatusUpdateSubject.getAttribute("value").value = subject_is_active;
  switchStatusUpdateSubject.getAttribute("src").value =
    subject_is_active == 0 ? "../img/switch_off.gif" : "../img/switch_on.gif";
}

function updateSubjectCanselHandler() {
  adminContainer.classList.remove("grey");
  updateSubjectForm.classList.add("hidden");
}

function updateSubjectButtonHandler() {
  updateSubjectAction(
    parseInt(inputUpdateSubjectID.value.substring(12)),
    inputUpdateSubject.value,
    parseInt(switchStatusUpdateSubject.getAttribute("value"))
  );
}

function subjectStatusSwitchHandler(t) {
  if (t.attributes.value.value == "0") {
    t.attributes.value.value = "1";
    t.attributes.src.value = "../img/switch_on.gif";
  } else {
    t.attributes.value.value = "0";
    t.attributes.src.value = "../img/switch_off.gif";
  }
  if (t.attributes.ignore.value == "false") {
    updateSubjectAction(
      parseInt(
        t.parentElement.parentElement.parentElement.children[0].innerHTML
      ),
      t.parentElement.parentElement.parentElement.children[1].innerHTML,
      parseInt(t.attributes.value.value)
    );
  }
}

function updateSubjectAction(id, subject, status) {
  fetch("/api/questions/update_subject", {
    method: "PATCH",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      subject_name: subject,
      subject_id: id,
      subject_is_active: status,
    }),
  }).then(async (response) => {
    let data = await response.json();
    if (data.success) {
      updateSubjectCanselHandler();
      getAllSubjects();
    } else if (data.message.includes("Duplicate entry")) {
      alertUpdateSubjectExist.classList.remove("hidden");
    }
  });
}

function deleteSubjectHandler(t) {
  console.log(t.parentElement.parentElement.children[0].innerHTML);
  let id = t.parentElement.parentElement.children[0].innerHTML;
  inputDeleteSubjectId.value = "subject id: " + id;
  inputDeleteSubject.value =
    t.parentElement.parentElement.children[1].innerHTML;
  adminContainer.classList.add("grey");
  deleteSubjectForm.classList.remove("hidden");
}

function deleteSubjectCansel() {
  adminContainer.classList.remove("grey");
  deleteSubjectForm.classList.add("hidden");
}

function deleteSubjectAction() {
  let id = inputDeleteSubjectId.value.substring(12);
  fetch("/api/questions/by_subject_id", {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
      subject_id: id,
    },
  }).then(async (response) => {
    let data = await response.json();
    fetch("/api/questions/subject_by_id", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
        subject_id: id,
      },
    }).then(async (response) => {
      let data2 = await response.json();
      console.log(data2);
      getAllSubjects();
      getAllQuestions("All");
      deleteSubjectCansel();
    });
  });
}

function getAllQuestions(subject_name) {
  fetch(
    subject_name == "All" ? "/api/questions" : "/api/questions/by_subject",
    {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        subject: subject_name,
        page: questionsCurrentPage,
      },
    }
  ).then(async (response) => {
    let data = await response.json();
    if (data.message.includes("No records found")) {
      questions = [];
      questionsCount.innerHTML = 0 + " questions";
    } else {
      questions = [];
      questions.push(...data.questions);
      questionsCount.innerHTML = data.number_of_entries + " questions";
    }
    questionsTotalPages = parseInt(data.total_pages);
    displayQuestions();
    updatePageButtons();
  });
}

function displayQuestions() {
  let tableRows = "";
  if (questions.length != 0) {
    questions.forEach((question) => {
      tableRows += `<tr>
        <td>${question.question_id}</td>
        <td>${question.time}</td>
        <td>${question.subject_name}</td>
        <td>
          <span>${question.question}</span><br />
          <span>${question.solution}</span>
        <td>
          <button 
            class="update-question"
            onclick="JavaScript:openUpdateQuestionForm(this)"
          >
            Update
          </button>
          <button 
            class="delete-qustion"
            onclick="JavaScript:deleteQuestionHandler(this)"
          >
            Delete
          </button>
        </td>
      </tr>`;
    });
  } else {
    tableRows += `<tr>
      <td>N/A</td>
      <td>N/A</td>
      <td>N/A</td>
      <td>No questions recorded yet</td>
      <td>N/A</td>
    </tr>`;
  }
  questionsTableBody.innerHTML = tableRows;
}

function openAddNewQuestionForm() {
  alertNewQuestionExist.classList.add("hidden");
  if (subjects.length != 0) {
    textareaNewQuestion.value = "";
    textareaNewSolution.value = "";
    let options = "";
    subjects.forEach((subject) => {
      options += `<option value="${subject.subject_id}">
        ${subject.subject_name}
      </option>`;
    });
    selectNewQuestionSubjects.innerHTML = options;
    adminContainer.classList.add("grey");
    addNewQuestionForm.classList.remove("hidden");
  }
}

function addNewQuestionCanselHandler() {
  adminContainer.classList.remove("grey");
  addNewQuestionForm.classList.add("hidden");
}

function addNewQuestionButtonHandler() {
  if (
    textareaNewQuestion.value.length > 5 &&
    textareaNewSolution.value.length > 5
  ) {
    fetch("/api/questions/create", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        subject_id: selectNewQuestionSubjects.value,
        question: textareaNewQuestion.value,
        solution: textareaNewSolution.value,
        time: selectNewQuestionTime.value,
      }),
    }).then(async (response) => {
      let data = await response.json();
      console.log(data);
      if (data.success) {
        addNewQuestionCanselHandler();
        getAllQuestions(selectFilterBySubject.value);
      } else if (data.message.includes("Duplicate entry")) {
        textareaNewQuestion.value = "";
        textareaNewSolution.value = "";
        alertNewQuestionExist.classList.remove("hidden");
      }
    });
  } else {
    textareaNewQuestion.value = "PLease provide valid question";
  }
}

function openUpdateQuestionForm(t) {
  alertUpdateQuestionExist.classList.add("hidden");
  let id = t.parentElement.parentElement.children[0].innerHTML;
  let subject = t.parentElement.parentElement.children[2].innerHTML;
  console.log(subject);
  let time = t.parentElement.parentElement.children[1].innerHTML;
  let questin = t.parentElement.parentElement.children[3].children[0].innerHTML;
  let solution =
    t.parentElement.parentElement.children[3].children[2].innerHTML;
  adminContainer.classList.add("grey");
  updateQuestionForm.classList.remove("hidden");
  inputUpdateQuestionId.value = "question id: " + id;
  let options = "";
  subjects.forEach((subject) => {
    options += `<option value="${subject.subject_name}">
        ${subject.subject_name}
      </option>`;
  });
  selectUpdateQuestionSubject.innerHTML = options;
  selectUpdateQuestionSubject.value = subject;
  selectUpdateQuestionTime.value = time;
  textareaUpdateQuestion.innerHTML = questin;
  textareUpdateSolution.innerHTML = solution;
}

function updateQuestionCanselHandler() {
  adminContainer.classList.remove("grey");
  updateQuestionForm.classList.add("hidden");
}

function updateQuestionButtonHandler() {
  fetch("/api/questions/update", {
    method: "PATCH",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      question_id: parseInt(inputUpdateQuestionId.value.substring(13)),
      subject_name: selectUpdateQuestionSubject.value,
      time: parseInt(selectUpdateQuestionTime.value),
      question: textareaUpdateQuestion.value,
      solution: textareUpdateSolution.value,
    }),
  }).then(async (response) => {
    let data = await response.json();
    if (data.success) {
      updateQuestionCanselHandler();
      getAllQuestions(selectFilterBySubject.value);
    } else if (data.message.includes("Duplicate entry")) {
      alertUpdateQuestionExist.classList.remove("hidden");
    }
  });
}

function deleteQuestionHandler(t) {
  let id = t.parentElement.parentElement.children[0].innerHTML;
  fetch(`/api/questions/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
    },
  }).then(async (response) => {
    let data = await response.json();
    if (data.success) {
      getAllQuestions(selectFilterBySubject.value);
    } else {
      alert(data.message);
    }
  });
}

function updatePageButtons() {
  let buttons = "";
  if (questionsTotalPages > 1) {
    if (questionsCurrentPage > 2) {
      buttons += `<button
        class="table-page-button"
        onclick="JavaScript:pageButtonHandler(this)"
      >
        1
      </button>`;
    }
    if (questionsCurrentPage > 3) {
      buttons += `<span> . . . </span>`;
    }
    for (
      let i = questionsCurrentPage - 1;
      i <= questionsCurrentPage + 1 && i <= questionsTotalPages;
      i++
    ) {
      if (i < 1) continue;
      let status = i == questionsCurrentPage ? " active-page" : "";
      buttons += `<button
          class="table-page-button${status}"
          onclick="JavaScript:pageButtonHandler(this)"
        >${i}</button>`;
    }
    if (questionsCurrentPage + 2 < questionsTotalPages) {
      buttons += `<span> . . . </span>`;
    }
    if (questionsCurrentPage + 1 < questionsTotalPages) {
      buttons += `<button
      class="table-page-button"
      onclick="JavaScript:pageButtonHandler(this)"
    >${questionsTotalPages}</button>`;
    }
    pages.innerHTML = buttons;
  }
}

function pageButtonHandler(t) {
  questionsCurrentPage = parseInt(t.innerHTML);
  getAllQuestions(selectFilterBySubject.value);
}
