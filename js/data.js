
import amrAhmed from "./amrAhmed.js";
import khalidAmr from "./khalidAmr.js";
import khaledAbdelhady from "./khaledAbdelhady.js";

  const students = [
    amrAhmed,
    khalidAmr,
    khaledAbdelhady,

  ];

 if (typeof module !== "undefined" && module.exports) {
   module.exports = students;
 }
export default students;