import React, { useState } from "react";
import { Card } from "@ui5/webcomponents-react";
import CreateUser from "./CreateUser";
import EditUser from "./EditUser";
import DeleteUser from "./DeleteUser";

const tileStyle = {
  width: "250px",
  height: "150px",
  padding: "1rem",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  textAlign: "center",
  cursor: "pointer",
  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)",
  borderRadius: "8px",
};

const ManageUsers = () => {
  const [mode, setMode] = useState(null);

  if (!mode) {
    return (
      <div style={{ padding: "2rem" }}>
        <h2 style={{ backgroundColor: "blue", color: "white", textAlign: "center", padding: "1rem", marginBottom: "2rem" }}>
          Manage Users
        </h2>
        <div style={{ display: "flex", gap: "2rem", justifyContent: "center" }}>
          <div onClick={() => setMode("create")}>
            <Card style={tileStyle}>
              <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Create User</div>
              <div>Add a new system user</div>
            </Card>
          </div>
          <div onClick={() => setMode("edit")}>
            <Card style={tileStyle}>
              <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Edit User</div>
              <div>Update or reset credentials</div>
            </Card>
          </div>
          <div onClick={() => setMode("delete")}>
            <Card style={tileStyle}>
              <div style={{ fontWeight: "bold", fontSize: "1.2rem" }}>Delete User</div>
              <div>Deactivate resigned users</div>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div style={{ padding: "2rem" }}>
        <CreateUser />
      </div>
    );
  }

  if (mode === "edit") {
    return (
      <div style={{ padding: "2rem" }}>
        <EditUser />
      </div>
    );
  }

  if (mode === "delete") {
    return (
      <div style={{ padding: "2rem" }}>
        <DeleteUser />
      </div>
    );
  }

  return null;
};

export default ManageUsers;