import React from "react";
import MaterialList from "../components/MaterialList";

const MaterialPage = ({ groupId }) => {
  const materials = [
    { id: 1, title: "Lecture Notes", url: "https://example.com/notes.pdf" },
    { id: 2, title: "Assignment 1", url: "https://example.com/assignment.pdf" },
  ];

  return <MaterialList materials={materials} />;
};

export default MaterialPage;
