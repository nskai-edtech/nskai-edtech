// import React from "react";
// import { EmailLayout } from "./config";

// interface NewCourseAvailableEmailProps {
//   learnerName: string;
//   courseTitle: string;
//   courseLink: string;
// }

// export const NewCourseAvailableEmail: React.FC<
//   NewCourseAvailableEmailProps
// > = ({ learnerName, courseTitle, courseLink }) => (
//   <EmailLayout subject={`New Course Available: ${courseTitle}`}>
//     <h1>Hello {learnerName},</h1>
//     <p>
//       We have a new course that matches your interests:{" "}
//       <strong>{courseTitle}</strong>.
//     </p>
//     <p>
//       <a
//         href={courseLink}
//         style={{ color: "#0070f3", textDecoration: "underline" }}
//       >
//         View Course
//       </a>
//     </p>
//     <p>Happy learning!</p>
//     <p>The Zerra Team</p>
//   </EmailLayout>
// );
