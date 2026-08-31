
import amrAhmed from "./amrAhmed.js";
import khalidAmr from "./khalidAmr.js";
import khaledAbdelhady from "./khaledAbdelhady.js";
import khaledAshraf from "./khaledAshraf.js";
import YousefSameh from "./YousefSameh.js";

  const students = [
    amrAhmed,
    khalidAmr,
    khaledAbdelhady,
    khaledAshraf,
    YousefSameh,
    
  ];

 if (typeof module !== "undefined" && module.exports) {
   module.exports = students;
 }
export default students;