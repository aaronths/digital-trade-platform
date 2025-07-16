import React, { useState } from "react";

const DeleteMessage: React.FC = () => {
  const [messageId, setMessageId] = useState("");
  const [message, setMessage] = useState("");

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `http://localhost:3000/shop/messages/${messageId}/delete`,
        {
          method: "DELETE",
        }
      );
      const data = await response.json();
      setMessage(data.message || "Message deleted");
    } catch (err) {
      setMessage("Failed to delete message");
    }
  };

  return (
    <div>
      <h4>Delete Message</h4>
      <form onSubmit={handleDelete}>
        <input
          className="form-control mb-2"
          type="number"
          placeholder="Message ID"
          value={messageId}
          onChange={(e) => setMessageId(e.target.value)}
          required
        />
        <button className="btn btn-danger">Delete</button>
      </form>
      {message && <div className="mt-2 text-info">{message}</div>}
    </div>
  );
};

export default DeleteMessage;
