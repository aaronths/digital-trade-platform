// import React, { useState, useEffect } from "react";
// // import axios from "axios";

// interface Message {
//   message_id: number;
//   sender_email: string;
//   reciever_email: string;
//   content: string;
//   timestamp: string;
// }

// interface Props {
//   contact: any; // The selected contact from the list
// }

// const ViewMessages: React.FC<Props> = ({ contact }) => {
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(true);

//   const userEmail = localStorage.getItem("email") || ""; // User email from localStorage

//   useEffect(() => {
//     const fetchMessages = async () => {
//       if (!contact.email) {
//         setError("Invalid contact email.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const sentMessagesResponse = await axios.get(
//           `http://localhost:3000/shop/messages/${userEmail}/view?type=sent&sender_email=${contact.email}`
//         );
//         const receivedMessagesResponse = await axios.get(
//           `http://localhost:3000/shop/messages/${userEmail}/view?type=received&sender_email=${contact.email}`
//         );

//         console.log("Sent messages response:", sentMessagesResponse.data);
//         console.log("Received messages response:", receivedMessagesResponse.data);

//         // Merge both sent and received messages
//         const allMessages = [
//           ...sentMessagesResponse.data.messages,
//           ...receivedMessagesResponse.data.messages,
//         ];

//         if (allMessages.length === 0) {
//           setError("No messages found for this contact.");
//         } else {
//           setMessages(allMessages);
//         }
//       } catch (error) {
//         setError("Error fetching messages");
//         console.error("Error fetching messages:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (contact.email) {
//       fetchMessages();
//     }
//   }, [contact, userEmail]);

//   return (
//     <div className="message-content" style={{ marginBottom: "20px" }}>
//       {loading ? (
//         <p>Loading messages...</p>
//       ) : error ? (
//         <div className="alert alert-danger">{error}</div>
//       ) : messages.length === 0 ? (
//         <p>No messages found.</p>
//       ) : (
//         <ul className="list-group">
//           {messages.map((msg) => (
//             <li key={msg.message_id} className="list-group-item">
//               <p><strong>From:</strong> {msg.sender_email}</p>
//               <p><strong>To:</strong> {msg.reciever_email}</p>
//               <p><strong>Message:</strong> {msg.content}</p>
//               <p><strong>Sent at:</strong> {new Date(msg.timestamp).toLocaleString()}</p>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default ViewMessages;
