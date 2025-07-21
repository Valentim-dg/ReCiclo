// import React from "react";
// import { FaTrophy, FaLock } from "react-icons/fa";

// const Achievement = ({ achievement, unlocked }) => {
//   return (
//     <li
//       className={`flex items-center space-x-3 p-3 rounded-lg ${
//         unlocked ? "bg-green-50" : "bg-gray-100"
//       }`}
//     >
//       {unlocked ? (
//         <FaTrophy className="text-yellow-500 text-2xl" />
//       ) : (
//         <FaLock className="text-gray-400 text-xl" />
//       )}
//       <div className="w-full">
//         <p
//           className={`font-semibold ${
//             unlocked ? "text-gray-800" : "text-gray-500"
//           }`}
//         >
//           {achievement.title}
//         </p>
//         <p className="text-gray-600 text-sm">{achievement.description}</p>
//         {!unlocked && achievement.progress && (
//           <div className="mt-2 w-full">
//             <div className="flex justify-between items-center mb-1">
//               <span className="text-xs text-gray-500">
//                 {achievement.progress.current}/{achievement.progress.total}{" "}
//                 {achievement.progress.unit}
//               </span>
//             </div>
//             <div className="bg-gray-200 rounded-full h-2.5">
//               <div
//                 className="bg-green-500 h-2.5 rounded-full"
//                 style={{
//                   width: `${Math.min(
//                     100,
//                     (achievement.progress.current /
//                       achievement.progress.total) *
//                       100
//                   )}%`,
//                 }}
//               ></div>
//             </div>
//           </div>
//         )}
//       </div>
//     </li>
//   );
// };

// export default Achievement;
