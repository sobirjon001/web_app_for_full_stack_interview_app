// web elements
const usersModuleContainer = document.querySelector("#users-module-container");
const navUserName = document.querySelector("#nav-user-name");
const usersTableBody = document.querySelector("#users-table > tbody");
const adminContainer = document.querySelector("#admin-container-outer");
const addNewUserContainer = document.querySelector("#add-new-user-container");
const selectNewUserType = document.querySelector(
  "#input-new-user-select-isadmin"
);
const inputNewUserFullName = document.querySelector(
  "#input-new-user-full-name"
);
const inputNewUserEmail = document.querySelector("#input-new-user-email");
const inputNewUserPassword = document.querySelector("#input-new-user-password");
const alertNewUserExist = document.querySelector("#input-new-user-exist-alert");
const alertNewUserFullNmae = document.querySelector(
  "#input-new-user-full-name-alert"
);
const alertNewUserEmail = document.querySelector("#input-new-user-email-alert");
const alertNewUserPassword = document.querySelector(
  "#input-new-user-password-alert"
);
const updateUserContainer = document.querySelector("#update-user-container");
const inputUpdateUserId = document.querySelector("#user-id");
const selectUpdateUserType = document.querySelector(
  "#input-update-user-select-isadmin"
);
const inputUpdateUserFullName = document.querySelector(
  "#input-update-user-full-name"
);
const inputUpdateUserEmail = document.querySelector("#input-update-user-email");
const inputUpdateUserPassword = document.querySelector(
  "#input-update-user-password"
);
const alertUpdateUserExist = document.querySelector(
  "#input-update-user-exist-alert"
);
const alertUpdateUserFullNmae = document.querySelector(
  "#input-update-user-full-name-alert"
);
const alertUpdateUserEmail = document.querySelector(
  "#input-update-user-email-alert"
);
const alertUpdateUserPassword = document.querySelector(
  "#input-update-user-password-alert"
);
const selectFilterUsersIsAdmin = document.querySelector("#select-isAdmin");
const usersCount = document.querySelector("#users-count");
const pages = document.querySelector("#pages");
const inputSearchByFullName = document.querySelector("#input-search-name");

// event listeners

// global variables
let token = "";
let userName = "";
let users = [];
let totalUsers = 1;
let usersCurrentPage = 1;
let usersTotalPages = 1;

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
    getAllUsers("All");
  });
})();

function getAllUsers(user_status) {
  fetch("/api/users", {
    method: "GET",
    headers: {
      Authorization: "Bearer " + token,
      user_status: user_status,
      page: usersCurrentPage,
    },
  }).then(async (response) => {
    let data = await response.json();
    users = [];
    users.push(...users, ...data.users);
    usersTotalPages = parseInt(data.total_pages);
    totalUsers = parseInt(data.number_of_entries);
    displayUsers();
    updatePageButtons();
  });
}

function displayUsers() {
  usersCount.innerHTML = totalUsers + " users";
  let matcher = "";
  switch (selectFilterUsersIsAdmin.value) {
    case "User":
      matcher = /0/;
      break;
    case "Admin":
      matcher = /1/;
      break;
    default:
      matcher = /.?/;
  }
  let tableRows = "";
  users.forEach((user) => {
    if (matcher.test(user.is_admin)) {
      tableRows += `<tr>
      <td>
        <button 
          class="user-action-delete"
          onclick="JavaScript:deleteUserHandler(this, event)"
        >
          Delete
        </button>
        <button 
          class="user-action-update"
          onclick="JavaScript:openUpdateUserForm(this, event)"
        >
          Update
        </button>
      </td>
      <td>${user.user_id}</td><td>${user.full_name}</td>
      <td>${user.email}</td><td>${user.is_admin == 1}</td></tr>`;
    }
  });
  usersTableBody.innerHTML = tableRows;
}

function openAddNewUserForm() {
  for (let alert of [
    alertNewUserExist,
    alertNewUserFullNmae,
    alertNewUserEmail,
    alertNewUserPassword,
  ]) {
    alert.classList.add("hidden");
  }
  for (let input of [
    inputNewUserFullName,
    inputNewUserEmail,
    inputNewUserPassword,
  ]) {
    input.value = "";
  }
  adminContainer.classList.add("grey");
  addNewUserContainer.classList.remove("hidden");
}

function addUserCancelHandler() {
  adminContainer.classList.remove("grey");
  addNewUserContainer.classList.add("hidden");
}

function validateFullName(full_name) {
  return /[A-Z]([a-z]){3,10}\s[A-Z]([a-z]){3,15}/.test(full_name);
}

function validateEmail(email) {
  return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/.test(
    email
  );
}

function validatePassword(password) {
  return /^.*(?=.{8,})(?=.*[a-zA-Z])(?=.*\d)(?=.*[!#$%&?@"]).*$/.test(password);
}

function addUserButtonHandler() {
  let canAddNewUser = true;
  if (!validateFullName(inputNewUserFullName.value)) {
    alertNewUserFullNmae.classList.remove("hidden");
    canAddNewUser = false;
  }
  if (!validateEmail(inputNewUserEmail.value)) {
    {
      alertNewUserEmail.classList.remove("hidden");
      canAddNewUser = false;
    }
  }
  if (!validatePassword(inputNewUserPassword.value)) {
    alertNewUserPassword.classList.remove("hidden");
    canAddNewUser = false;
  }
  if (canAddNewUser) {
    fetch("/api/users/create_user", {
      method: "POST",
      headers: {
        Authorization: "Bearer " + token,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        full_name: inputNewUserFullName.value,
        email: inputNewUserEmail.value,
        password: inputNewUserPassword.value,
        is_admin: parseInt(selectNewUserType.value),
      }),
    }).then(async (response) => {
      let data = await response.json();
      if (data.success) {
        addUserCancelHandler();
        getAllUsers(selectFilterUsersIsAdmin.value);
      } else if (data.message.includes("Duplicate entry")) {
        clearNewUserForm();
        alertNewUserExist.classList.remove("hidden");
      }
    });
  }
}

function deleteUserHandler(t, e) {
  let id = e.target.parentElement.parentElement.children[1].innerHTML;
  fetch("/api/users/delete_user", {
    method: "DELETE",
    headers: {
      Authorization: "Bearer " + token,
      user_id: id,
    },
  }).then(async (response) => {
    let data = await response.json();
    if (data.success) {
      getAllUsers(selectFilterUsersIsAdmin.value);
    } else if (
      data.message.includes("Deleting or modifying Super Admin is Prohibited!")
    ) {
      alert(data.message);
    }
  });
}

function openUpdateUserForm(t, e) {
  for (let alert of [
    alertUpdateUserExist,
    alertUpdateUserFullNmae,
    alertUpdateUserEmail,
    alertUpdateUserPassword,
  ]) {
    alert.classList.add("hidden");
  }
  let id = e.target.parentElement.parentElement.children[1].innerHTML;
  let full_name = e.target.parentElement.parentElement.children[2].innerHTML;
  let email = e.target.parentElement.parentElement.children[3].innerHTML;
  let is_admin = e.target.parentElement.parentElement.children[4].innerHTML;
  adminContainer.classList.add("grey");
  updateUserContainer.classList.remove("hidden");
  inputUpdateUserId.value = "user id: " + id;
  selectUpdateUserType.value = is_admin == "true" ? "1" : "0";
  inputUpdateUserFullName.value = full_name;
  inputUpdateUserEmail.value = email;
  inputUpdateUserPassword.value = "";
}

function updateUserCancelHandler() {
  adminContainer.classList.remove("grey");
  updateUserContainer.classList.add("hidden");
}

function updateUserButtonHandler() {
  let id = parseInt(inputUpdateUserId.value.substring(9));
  let canUpdateUser = true;
  if (!validateFullName(inputUpdateUserFullName.value)) {
    alertUpdateUserFullNmae.classList.remove("hidden");
    canUpdateUser = false;
  }
  if (!validateEmail(inputUpdateUserEmail.value)) {
    {
      alertUpdateUserEmail.classList.remove("hidden");
      canUpdateUser = false;
    }
  }
  if (!validatePassword(inputUpdateUserPassword.value)) {
    alertUpdateUserPassword.classList.remove("hidden");
    canUpdateUser = false;
  }
  if (canUpdateUser) {
    fetch("/api/users/update_user", {
      method: "PATCH",
      headers: {
        Authorization: "Bearer " + token,
        user_id: id,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        full_name: inputUpdateUserFullName.value,
        email: inputUpdateUserEmail.value,
        password: inputUpdateUserPassword.value,
        is_admin: parseInt(selectUpdateUserType.value),
        user_id: id,
      }),
    }).then(async (response) => {
      let data = await response.json();
      if (data.success) {
        updateUserCancelHandler();
        getAllUsers(selectFilterUsersIsAdmin.value);
      } else if (data.message.includes("Duplicate entry")) {
        alertUpdateUserExist.classList.remove("hidden");
      } else if (
        data.message.includes(
          "Deleting or modifying Super Admin is Prohibited!"
        )
      ) {
        alert(data.message);
        updateUserCancelHandler();
      }
    });
  }
}

function updatePageButtons() {
  let buttons = "";
  if (usersTotalPages > 1) {
    if (usersCurrentPage > 2) {
      buttons += `<button
        class="table-page-button"
        onclick="JavaScript:pageButtonHandler(this)"
      >
        1
      </button>`;
    }
    if (usersCurrentPage > 3) {
      buttons += `<span> . . . </span>`;
    }
    for (
      let i = usersCurrentPage - 1;
      i <= usersCurrentPage + 1 && i <= usersTotalPages;
      i++
    ) {
      if (i < 1) continue;
      let status = i == usersCurrentPage ? " active-page" : "";
      buttons += `<button
          class="table-page-button${status}"
          onclick="JavaScript:pageButtonHandler(this)"
        >${i}</button>`;
    }
    if (usersCurrentPage + 2 < usersTotalPages) {
      buttons += `<span> . . . </span>`;
    }
    if (usersCurrentPage + 1 < usersTotalPages) {
      buttons += `<button
      class="table-page-button"
      onclick="JavaScript:pageButtonHandler(this)"
    >${usersTotalPages}</button>`;
    }
    pages.innerHTML = buttons;
  }
}

function pageButtonHandler(t) {
  usersCurrentPage = parseInt(t.innerHTML);
  getAllQuestions(selectFilterBySubject.value);
}

function searhUserByFullNameButtonHandler() {
  if (
    inputSearchByFullName.value == "" ||
    inputSearchByFullName.value == "Please Provide valid Full Name" ||
    !validateFullName(inputSearchByFullName.value)
  ) {
    inputSearchByFullName.value = "Please Provide valid Full Name";
  } else {
    console.log(inputSearchByFullName.value);
    fetch("/api/users/by_full_name", {
      method: "GET",
      headers: {
        Authorization: "Bearer " + token,
        full_name: inputSearchByFullName.value,
      },
    }).then(async (response) => {
      let data = await response.json();
      console.log(data);
      if (data.message == "Record not found") {
        inputSearchByFullName.value = "Record not found";
      } else {
        users = [];
        users.push(...data.users);
        usersTotalPages = parseInt(data.total_pages);
        totalUsers = parseInt(data.number_of_entries);
        displayUsers();
        updatePageButtons();
      }
    });
  }
}

function clearUpdateButtonHandler() {
  inputSearchByFullName.value = "";
  selectFilterUsersIsAdmin.value = "All";
  getAllUsers("All");
}
