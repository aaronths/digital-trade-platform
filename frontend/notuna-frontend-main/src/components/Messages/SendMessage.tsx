import React, { useState } from "react";

const SendMessage: React.FC = () => {
  const [receiver, setReceiver] = useState(""); // Receiver's email
  const [content, setContent] = useState(""); // Message content
  const [message, setMessage] = useState(""); // Status message (success or error)

  const sender = localStorage.getItem("email"); // Get the sender's email from localStorage

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!receiver || !content) {
      setMessage("Please fill in both the receiver's email and message.");
      return;
    }

    try {
      const response = await fetch(
        `https://notuna-backend.vercel.app/shop/messages/${sender}/send`, // Change this to your deployed backend URL
        {
          method: "POST",
          // headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiver_email: receiver, content }), // Sending receiver and content to the API
        }
      );

      if (!response.ok) {
        throw new Error("Message sending failed");
      }

      const data = await response.json();
      setMessage(data.message || "Message sent successfully");
      setReceiver(""); // Clear input fields
      setContent("");  // Clear input fields
    } catch (err: any) {
      setMessage(`Failed to send message: ${err.message || "Unknown error"}`);
    }
  };

  return (
    <div>
      <h4>Send Message</h4>
      <form onSubmit={handleSubmit}>
        <input
          className="form-control mb-2"
          type="email"
          placeholder="Receiver's Email"
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)} // Update receiver state
          required
        />
        <textarea
          className="form-control mb-2"
          placeholder="Message"
          value={content}
          onChange={(e) => setContent(e.target.value)} // Update content state
          required
        ></textarea>
        <button className="btn btn-success">Send</button>
      </form>
      {message && <div className="mt-2 text-info">{message}</div>} {/* Display success/error message */}
    </div>
  );
};

export default SendMessage;
