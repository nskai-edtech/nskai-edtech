// import React from "react";
// import { EmailLayout } from "./config";

// interface CourseCompletedEmailProps {
//   learnerName: string;
//   courseTitle: string;
//   certificateLink?: string;
// }

// export const CourseCompletedEmail: React.FC<CourseCompletedEmailProps> = ({
//   learnerName,
//   courseTitle,
//   certificateLink,
// }) => (
//   <EmailLayout subject={`Congratulations on Completing ${courseTitle}!`}>
//     <h1>Congratulations, {learnerName}!</h1>
//     <p>
//       You have successfully completed <strong>{courseTitle}</strong>.
//     </p>
//     <p>We are proud of your achievement. Keep up the great work!</p>
//     {certificateLink && (
//       <p>
//         <a
//           href={certificateLink}
//           style={{ color: "#0070f3", textDecoration: "underline" }}
//         >
//           View Your Certificate
//         </a>
//       </p>
//     )}
//     <p>
//       Best wishes,
//       <br />
//       The Zerra Team
//     </p>
//   </EmailLayout>
// );
